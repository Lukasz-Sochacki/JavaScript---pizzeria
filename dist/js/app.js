import { settings, select, classNames, templates } from './settings.js';
// './' są bardzo ważne, nie możemy ich pominąć. Jeśli nie zaczniemy pisać ścieżki pliku od './' albo '../' wówczas JS uzna, że chcemy zaimportować jeden z pakietów, które są już gdzieś zdefionowane w kodzie.
//Nawiasów klamrowych używamy wówczas, gdy importujemy więcej niż jedną rzecz i nie jest to rzecz domyślna.
import Product from './components/Product.js';
import Cart from './components/Cart.js';
import Booking from './components/Booking.js';
import Home from './components/Home.js';

const app = {
  initHome: function () {
    const thisApp = this;

    thisApp.homeContainer = document.querySelector(select.containerOf.home);
    thisApp.home = new Home(thisApp.homeContainer);

    thisApp.homeShortcuts = document.querySelectorAll(select.home.links);

    for (let link of thisApp.homeShortcuts) {
      link.addEventListener('click', function (event) {
        const clickedElement = this;
        event.preventDefault();

        const homeId = clickedElement.getAttribute('href').replace('#', '');

        thisApp.activatePage(homeId);

        window.location.hash = '#/' + homeId;
      });
    }
  },

  initBooking: function () {
    const thisApp = this;

    thisApp.widgetContainer = document.querySelector(
      select.containerOf.booking
    );

    thisApp.booking = new Booking(thisApp.widgetContainer);
  },

  initPages: function () {
    const thisApp = this;

    thisApp.pages = document.querySelector(select.containerOf.pages).children;
    //we właściwości pages znajdą się wszystkie dzieci kontenera stron - sekcje o ID order i ID booking
    thisApp.navLinks = document.querySelectorAll(select.nav.links);

    const idFromHash = window.location.hash.replace('#/', '');

    let pageMatchingHash = thisApp.pages[0].id;

    for (let page of thisApp.pages) {
      if (page.id == idFromHash) {
        pageMatchingHash = page.id;
        break;
      }
    }

    thisApp.activatePage(pageMatchingHash);
    for (let link of thisApp.navLinks) {
      link.addEventListener('click', function (event) {
        const clickedElement = this;
        event.preventDefault();

        /* get page id from href attribute */
        const id = clickedElement.getAttribute('href').replace('#', '');

        /* run thisApp.activatePage with that ID */
        thisApp.activatePage(id);

        /* change URL hash */
        window.location.hash = '#/' + id;
      });
    }
  },

  activatePage: function (pageId) {
    const thisApp = this;

    /* add class "active" to matching pages, remove from non-matching */
    for (let page of thisApp.pages) {
      page.classList.toggle(classNames.pages.active, page.id == pageId);
      //metoda toggle umożliwia podanie drugiego argumentu jako warunek
    }
    /* add class "active" to matching links, remove from non-matching */
    for (let link of thisApp.navLinks) {
      link.classList.toggle(
        classNames.nav.active,
        link.getAttribute('href') == '#' + pageId
      );
    }
  },
  initCart: function () {
    const thisApp = this;

    const cartElem = document.querySelector(select.containerOf.cart);
    thisApp.cart = new Cart(cartElem);

    thisApp.productList = document.querySelector(select.containerOf.menu);

    thisApp.productList.addEventListener('add-to-cart', function (event) {
      app.cart.add(event.detail.product);
    });
  },

  initMenu: function () {
    const thisApp = this;

    for (let productData in thisApp.data.products) {
      new Product(
        thisApp.data.products[productData].id,
        thisApp.data.products[productData]
      );
    }
  },
  initData: function () {
    const thisApp = this;
    thisApp.data = {};
    const url = settings.db.url + '/' + settings.db.products;

    fetch(url)
      .then(function (rawResponse) {
        return rawResponse.json();
      })
      .then(function (parsedResponse) {
        console.log('parsedResponse: ', parsedResponse);

        /* Save parsedResponse as thisApp.data.products */
        thisApp.data.products = parsedResponse;
        /* Execute initMenu method */
        thisApp.initMenu();
      });
  },
  init: function () {
    const thisApp = this;
    console.log('*** App starting ***');
    console.log('thisApp:', thisApp);
    console.log('classNames:', classNames);
    console.log('settings:', settings);
    console.log('templates:', templates);

    thisApp.initPages();
    thisApp.initData();
    // thisApp.initMenu();
    thisApp.initCart();
    thisApp.initBooking();
    thisApp.initHome();
  },
};

app.init();
