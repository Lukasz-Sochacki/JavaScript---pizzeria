import { select, settings } from '../settings.js';
import BaseWidget from '../components/BaseWidget.js';

//extends czyli klasa AmountWidget jest rozszerzeniem klasy BaseWidget
class AmountWidget extends BaseWidget {
  constructor(element) {
    //Pierwszą rzeczą, którą wykonujemy w konstruktorze klasy dziedziczącej (AmountWidget) jest wywołanie konstruktora klasy nadrzędnej (BaseWidget). Odwołamy się do niego za pomocą wyrażenia 'super'
    super(element, settings.amountWidget.defaultValue);
    const thisWidget = this;

    thisWidget.getElements(element);

    // if (thisWidget.dom.input.value) {
    //   thisWidget.setValue(thisWidget.dom.input.value);
    // } else {
    //   thisWidget.setValue(settings.amountWidget.defaultValue);
    // }
    //Tym zajmuje się już konkstruktor klasy nadrzędnej (BaseWidget)

    thisWidget.initActions();
    // console.log('AmountWidget: ', thisWidget);
  }

  getElements() {
    const thisWidget = this;

    // thisWidget.dom.wrapper = element;
    //Tym zajmuje się już klasa BaseWidget

    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(
      select.widgets.amount.input
    );

    thisWidget.dom.linkDecrease = thisWidget.dom.wrapper.querySelector(
      select.widgets.amount.linkDecrease
    );
    thisWidget.dom.linkIncrease = thisWidget.dom.wrapper.querySelector(
      select.widgets.amount.linkIncrease
    );
  }

  isValid(value) {
    return (
      !isNaN(value) &&
      value >= settings.amountWidget.defaultMin &&
      value <= settings.amountWidget.defaultMax
    );
  }

  renderValue() {
    const thisWidget = this;
    thisWidget.dom.input.value = thisWidget.value;
  }

  initActions() {
    const thisWidget = this;

    thisWidget.dom.input.addEventListener('change', function () {
      // thisWidget.setValue(thisWidget.dom.input.value);
      thisWidget.value = thisWidget.dom.input.value;
    });
    thisWidget.dom.linkDecrease.addEventListener('click', function (event) {
      event.preventDefault();
      thisWidget.setValue(thisWidget.value - 1);
    });
    thisWidget.dom.linkIncrease.addEventListener('click', function (event) {
      event.preventDefault();
      thisWidget.setValue(thisWidget.value + 1);
    });
  }
}

export default AmountWidget;
