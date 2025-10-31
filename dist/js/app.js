import { settings, select, classNames, templates } from './settings.js';
// './' są bardzo ważne, nie możemy ich pominąć. Jeśli nie zaczniemy pisać ścieżki pliku od './' albo '../' wówczas JS uzna, że chcemy zaimportować jeden z pakietów, które są już gdzieś zdefionowane w kodzie.
//Nawiasów klamrowych używamy wówczas, gdy importujemy więcej niż jedną rzecz i nie jest to rzecz domyślna.
import Product from './components/Product.js';
import Cart from './components/Cart.js';

const app = {
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
    console.log('thisApp.data', JSON.stringify(thisApp.data));
  },
  init: function () {
    const thisApp = this;
    console.log('*** App starting ***');
    console.log('thisApp:', thisApp);
    console.log('classNames:', classNames);
    console.log('settings:', settings);
    console.log('templates:', templates);

    thisApp.initData();
    // thisApp.initMenu();
    thisApp.initCart();
  },
};

app.init();
