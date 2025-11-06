import { select, templates, settings, classNames } from '../settings.js';
import utils from '../utils.js';
import AmountWidget from '../components/AmountWidget.js';
import DatePicker from '../components/DatePicker.js';
import HourPicker from '../components/HourPicker.js';

class Booking {
  constructor(element) {
    const thisBooking = this;

    thisBooking.element = element;
    thisBooking.chosenTable = 0; //CZEMU NIE MOŻE BYĆ TABLICA?
    thisBooking.render(element);
    thisBooking.initWidgets();
    thisBooking.getData();
  }

  getData() {
    const thisBooking = this;

    const startDateParam =
      settings.db.dateStartParamKey +
      '=' +
      utils.dateToStr(thisBooking.datePicker.minDate);
    const endDateParam =
      settings.db.dateEndParamKey +
      '=' +
      utils.dateToStr(thisBooking.datePicker.maxDate);

    const params = {
      bookings: [startDateParam, endDateParam],

      eventsCurrent: [settings.db.notRepeatParam, startDateParam, endDateParam],

      eventsRepeat: [settings.db.repeatParam, endDateParam],
    };

    // console.log('getData params: ', params);

    const urls = {
      bookings:
        settings.db.url +
        '/' +
        settings.db.bookings +
        '?' +
        params.bookings.join('&'),
      eventsCurrent:
        settings.db.url +
        '/' +
        settings.db.events +
        '?' +
        params.eventsCurrent.join('&'),
      eventsRepeat:
        settings.db.url +
        '/' +
        settings.db.events +
        '?' +
        params.eventsRepeat.join('&'),
    };
    // console.log('getData urls: ', urls);
    Promise.all([
      fetch(urls.bookings),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function (allResponse) {
        const bookingsResponse = allResponse[0];
        const eventsCurrentResponse = allResponse[1];
        const eventsRepeatResponse = allResponse[2];
        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })
      .then(function ([bookings, eventsCurrent, eventsRepeat]) {
        // console.log(bookings, eventsCurrent, eventsRepeat);

        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });
  }

  parseData(bookings, eventsCurrent, eventsRepeat) {
    const thisBooking = this;

    thisBooking.booked = {};
    for (let item of bookings) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }
    for (let item of eventsCurrent) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    const minDate = thisBooking.datePicker.minDate;
    const maxDate = thisBooking.datePicker.maxDate;

    for (let item of eventsRepeat) {
      if (item.repeat == 'daily') {
        for (
          let loopDate = minDate;
          loopDate <= maxDate;
          loopDate = utils.addDays(loopDate, 1)
        ) {
          thisBooking.makeBooked(
            utils.dateToStr(loopDate),
            item.hour,
            item.duration,
            item.table
          );
        }
      }
    }

    console.log('thisBooking.booked: ', thisBooking.booked);
    thisBooking.updateDOM();
  }

  makeBooked(date, hour, duration, table) {
    const thisBooking = this;

    if (typeof thisBooking.booked[date] == 'undefined') {
      thisBooking.booked[date] = {};
    }

    const startHour = utils.hourToNumber(hour);

    for (
      let hourBlock = startHour;
      hourBlock < startHour + duration;
      hourBlock += 0.5
    ) {
      // console.log('loop', hourBlock);
      if (typeof thisBooking.booked[date][hourBlock] == 'undefined') {
        thisBooking.booked[date][hourBlock] = [];
      }
      thisBooking.booked[date][hourBlock].push(table);
    }
  }

  updateDOM() {
    const thisBooking = this;

    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

    let allAvailable = false;

    if (
      typeof thisBooking.booked[thisBooking.date] == 'undefined' ||
      typeof thisBooking.booked[thisBooking.date][thisBooking.hour] ==
        'undefined'
    ) {
      allAvailable = true;
    }

    for (let table of thisBooking.dom.tables) {
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      if (!isNaN(tableId)) {
        tableId = parseInt(tableId);
      }
      if (
        !allAvailable &&
        thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)
      ) {
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }
    }
  }

  render(element) {
    const thisBooking = this;

    const generatedHTML = templates.bookingWidget();

    thisBooking.dom = {};
    thisBooking.dom.wrapper = element;

    thisBooking.dom.wrapper.innerHTML = generatedHTML;

    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(
      select.booking.peopleAmount
    );
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(
      select.booking.hoursAmount
    );
    thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(
      select.widgets.datePicker.wrapper
    );
    thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(
      select.widgets.hourPicker.wrapper
    );
    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(
      select.booking.tables
    );
    thisBooking.dom.tablesContainer = thisBooking.dom.wrapper.querySelector(
      select.containerOf.tables
    );
    thisBooking.dom.form = thisBooking.dom.wrapper.querySelector(
      select.booking.form
    );
    thisBooking.dom.duration = thisBooking.dom.wrapper.querySelector(
      select.booking.duration
    );
    thisBooking.dom.people = thisBooking.dom.wrapper.querySelector(
      select.booking.people
    );
    thisBooking.dom.phone = thisBooking.dom.wrapper.querySelector(
      select.booking.phone
    );
    thisBooking.dom.address = thisBooking.dom.wrapper.querySelector(
      select.booking.address
    );
    thisBooking.dom.date = thisBooking.dom.wrapper.querySelector(
      select.booking.date
    );
    thisBooking.dom.hour = thisBooking.dom.wrapper.querySelector(
      select.booking.hour
    );
    thisBooking.dom.starters = thisBooking.dom.wrapper.querySelectorAll(
      select.booking.starters
    );
  }

  initTables(event) {
    const thisBooking = this;
    thisBooking.tables = document.querySelectorAll(select.booking.tables); //Dlaczego tutaj muszę pobrać stoliki? Gdy zrobię to w metodzie render, to metoda initTables tego nie widzi (pętla for of)

    const clickedElement = event.target;
    event.preventDefault();
    for (let table of thisBooking.tables) {
      if (
        table !== clickedElement &&
        table.classList.contains(classNames.booking.tableChosen)
      ) {
        table.classList.remove(classNames.booking.tableChosen);
      }
    }
    if (!clickedElement.classList.contains(classNames.booking.tableBooked)) {
      if (!clickedElement.classList.contains(classNames.booking.tableChosen)) {
        clickedElement.classList.add(classNames.booking.tableChosen);
        thisBooking.chosenTable = clickedElement.getAttribute(
          settings.booking.tableIdAttribute //Nie działała metoda push, gdy thisBooking.chosenTable było tablicą
        );
      } else {
        clickedElement.classList.remove(classNames.booking.tableChosen);
        thisBooking.chosenTable = 0;
      }
    } else {
      alert('This table is booked! Please choose another one');
    }
    // console.log(thisBooking.chosenTable);
  }

  sendBooking() {
    const thisBooking = this;
    const url = settings.db.url + '/' + settings.db.bookings;

    const payLoad = {
      date: thisBooking.dom.date.value,
      hour: utils.numberToHour(thisBooking.dom.hour.value),
      table: parseInt(thisBooking.chosenTable),
      duration: parseInt(thisBooking.dom.duration.value),
      ppl: parseInt(thisBooking.dom.people.value),
      phone: thisBooking.dom.phone.value,
      address: thisBooking.dom.address.value,
      starters: [],
    };

    for (let start of thisBooking.dom.starters) {
      if (start.checked == true) {
        payLoad.starters.push(start.value);
      }
    }

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payLoad),
    };
    fetch(url, options)
      .then(function (response) {
        return response.json();
      })
      .then(function (parsedResponse) {
        console.log('parsed Response', parsedResponse);
        thisBooking.makeBooked(
          payLoad.date,
          payLoad.hour,
          payLoad.duration,
          payLoad.table
        );
        // thisBooking.initTables();
      });

    // console.log(payLoad);
  }

  initWidgets() {
    const thisBooking = this;

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);

    thisBooking.dom.wrapper.addEventListener('updated', function () {
      thisBooking.updateDOM();
      for (let table of thisBooking.dom.tables) {
        table.classList.remove(classNames.booking.tableChosen);
      }
      thisBooking.chosenTable = 0;
    });

    thisBooking.dom.tablesContainer.addEventListener('click', function (event) {
      thisBooking.initTables(event); //Wcześniej napisałem funkcję w ten sposób:
      // (... 'click', initTables) - czemu nie zadziałało?
    });

    thisBooking.dom.form.addEventListener('submit', function (event) {
      event.preventDefault();
      if (thisBooking.chosenTable !== 0) {
        thisBooking.sendBooking();
      }

      // if (thisBooking.chosenTable !== 0) {}
      //Nie działa ponieważ podczas wysłania formularza, thisBooking.chosenTable zawsze wskazuje wartość 0!!
    });
  }
}

export default Booking;
