import { select, classNames, settings, templates } from '../settings.js';
import utils from '../utils.js';
import CartProduct from '../components/CartProduct.js';

class Cart {
  constructor(element) {
    const thisCart = this;

    thisCart.products = [];

    thisCart.getElements(element);
    thisCart.initActions();

    // console.log('new Cart: ', thisCart);
  }

  getElements(element) {
    const thisCart = this;

    thisCart.dom = {};

    thisCart.dom.wrapper = element;

    thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(
      select.cart.toggleTrigger
    );

    thisCart.dom.productList = thisCart.dom.wrapper.querySelector(
      select.cart.productList
    );

    thisCart.dom.deliveryFee = thisCart.dom.wrapper.querySelector(
      select.cart.deliveryFee
    );
    thisCart.dom.subtotalPrice = thisCart.dom.wrapper.querySelector(
      select.cart.subtotalPrice
    );
    thisCart.dom.totalPrice = thisCart.dom.wrapper.querySelectorAll(
      select.cart.totalPrice
    );
    thisCart.dom.totalNumber = thisCart.dom.wrapper.querySelector(
      select.cart.totalNumber
    );
    thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
    thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone);
    thisCart.dom.address = thisCart.dom.wrapper.querySelector(
      select.cart.address
    );
  }
  initActions() {
    const thisCart = this;

    thisCart.dom.toggleTrigger.addEventListener('click', function (event) {
      event.preventDefault();

      thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
    });

    thisCart.dom.productList.addEventListener('updated', function () {
      thisCart.update();
    });

    thisCart.dom.productList.addEventListener('remove', function (event) {
      thisCart.remove(event.detail.cartProduct);
    });
    thisCart.dom.form.addEventListener('submit', function (event) {
      event.preventDefault();

      if (thisCart.dom.productList !== 0) {
        thisCart.sendOrder();
      }
      thisCart.dom.productList.innerHTML = '';

      thisCart.products.splice(0, thisCart.products.length);
      thisCart.update();
      thisCart.dom.address.value = '';
      thisCart.dom.phone.value = '';
    });

    thisCart.dom.phone.addEventListener('change', function () {
      thisCart.dom.phone.classList.remove('error');
    });
    thisCart.dom.address.addEventListener('change', function () {
      thisCart.dom.address.classList.remove('error');
    });
  }

  sendOrder() {
    const thisCart = this;
    const url = settings.db.url + '/' + settings.db.orders;

    const payLoad = {
      address: thisCart.dom.address.value,
      phone: thisCart.dom.phone.value,
      totalPrice: thisCart.totalPrice,
      subtotalPrice: thisCart.dom.subtotalPrice.innerHTML,
      totalNumber: thisCart.dom.totalNumber.innerHTML,
      deliveryFee: thisCart.dom.deliveryFee.innerHTML,
      products: [],
    };
    for (let prod of thisCart.products) {
      payLoad.products.push(prod.getData());
    }
    console.log(payLoad);

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
        console.log('parsedResponse', parsedResponse);
      });
  }

  remove(thisCartProduct) {
    const thisCart = this;

    thisCartProduct.dom.wrapper.remove();
    thisCart.products.splice(thisCart.products.indexOf(thisCartProduct), 1);
    // console.log(thisCart.products);

    thisCart.update();
  }

  add(menuProduct) {
    const thisCart = this;

    // console.log('adding product: ', menuProduct);

    const generatedHTML = templates.cartProduct(menuProduct);

    const generatedDOM = utils.createDOMFromHTML(generatedHTML);

    thisCart.dom.productList.appendChild(generatedDOM);

    thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
    // console.log('new CartProduct: ', thisCart.products);

    thisCart.update();
  }

  update() {
    const thisCart = this;

    let deliveryFee = settings.cart.defaultDeliverFee;
    let totalNumber = 0;
    let subtotalPrice = 0;

    for (let product of thisCart.products) {
      totalNumber += parseInt(product.amount);
      subtotalPrice += parseInt(product.price);
    }
    if (totalNumber == 0 && subtotalPrice == 0) {
      thisCart.totalPrice = 0;
      deliveryFee = 0;
    } else {
      thisCart.totalPrice = subtotalPrice + deliveryFee;
    }

    thisCart.dom.deliveryFee.innerHTML = deliveryFee;
    thisCart.dom.subtotalPrice.innerHTML = subtotalPrice;
    for (let price of thisCart.dom.totalPrice) {
      price.innerHTML = thisCart.totalPrice;
      thisCart.dom.totalNumber.innerHTML = totalNumber;
    }

    // console.log(deliveryFee);
    // console.log(totalNumber);
    // console.log(subtotalPrice);
    // console.log(thisCart.totalPrice);
  }
}

export default Cart;
