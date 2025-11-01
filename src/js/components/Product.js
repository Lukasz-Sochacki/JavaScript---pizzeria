import { select, classNames, templates } from '../settings.js';
import utils from '../utils.js';
import AmountWidget from '../components/AmountWidget.js';

class Product {
  constructor(id, data) {
    const thisProduct = this;

    thisProduct.id = id;
    thisProduct.data = data;
    thisProduct.renderInMenu();
    thisProduct.getElements();
    thisProduct.initAccordion();
    thisProduct.initOrderForm();
    thisProduct.initAmountWidget();
    thisProduct.processOrder();
  }

  renderInMenu() {
    const thisProduct = this;

    /* Generate HTML based on template */
    const generatedHTML = templates.menuProduct(thisProduct.data);

    /* Create element using utils.createElementFromHTML */
    thisProduct.element = utils.createDOMFromHTML(generatedHTML);
    // console.log(thisProduct.element);

    /* Find menu container */
    const menuContainer = document.querySelector(select.containerOf.menu);

    /* Add element to menu */
    menuContainer.appendChild(thisProduct.element);
  }

  getElements() {
    const thisProduct = this;

    thisProduct.dom = {};

    thisProduct.dom.accordionTrigger = thisProduct.element.querySelector(
      select.menuProduct.clickable
    );
    thisProduct.dom.form = thisProduct.element.querySelector(
      select.menuProduct.form
    );
    thisProduct.dom.formInputs = thisProduct.dom.form.querySelectorAll(
      select.all.formInputs
    );
    thisProduct.dom.cartButton = thisProduct.element.querySelector(
      select.menuProduct.cartButton
    );
    thisProduct.dom.priceElem = thisProduct.element.querySelector(
      select.menuProduct.priceElem
    );
    thisProduct.dom.imageWrapper = thisProduct.element.querySelector(
      select.menuProduct.imageWrapper
    );
    thisProduct.dom.amountWidgetElem = thisProduct.element.querySelector(
      select.menuProduct.amountWidget
    );
  }

  initAccordion() {
    const thisProduct = this;

    /* Find the clickable trigger (the element that should react to clicking)
      [NEW - after creating getElements function, the variable clickableTrigger is no longer needed] */
    // const clickableTrigger = thisProduct.element.querySelector(
    //   select.menuProduct.clickable
    // );

    /* START: add event listener to clickable trigger on event click */
    thisProduct.dom.accordionTrigger.addEventListener(
      'click',
      function (event) {
        /* Prevent default action for event */
        event.preventDefault();

        /* Find active product (product that has active class) */
        const activeProduct = document.querySelector(
          select.all.menuProductsActive
        );

        /* If there is an active product and it's not thisProduct.element, remove class active from it */
        if (activeProduct) {
          if (activeProduct != thisProduct.element) {
            activeProduct.classList.remove(
              classNames.menuProduct.wrapperActive
            );
          }
        }
        /* Toggle active class on thisProduct.element */
        thisProduct.element.classList.toggle(
          classNames.menuProduct.wrapperActive
        );
      }
    );
  }

  initOrderForm() {
    const thisProduct = this;

    thisProduct.dom.form.addEventListener('submit', function (event) {
      event.preventDefault();
      thisProduct.processOrder();
    });

    for (let input of thisProduct.dom.formInputs) {
      input.addEventListener('change', function () {
        thisProduct.processOrder();
      });
    }

    thisProduct.dom.cartButton.addEventListener('click', function (event) {
      event.preventDefault();
      thisProduct.processOrder();
      thisProduct.addToCart();
      thisProduct.element.classList.remove(
        classNames.menuProduct.wrapperActive
      );
    });
  }

  processOrder() {
    const thisProduct = this;

    /* Convert form to object structure e.g. {sauce: ['tomato'], toppings: ['olives', redPeppers']} */
    const formData = utils.serializeFormToObject(thisProduct.dom.form);

    /* Set price to default price */
    let price = thisProduct.data.price;

    /*For every category (param)... */
    for (let paramId in thisProduct.data.params) {
      /* Determine param value, e.g. paramId = 'toppings', param = {label: 'Toppings', type: 'checkboxes' ...} */
      const param = thisProduct.data.params[paramId];

      /* For every option in this category */
      for (let optionId in param.options) {
        /* Determine option value, e.g. optionId = 'olives', option = {label: 'Olives', price: 2, default: true } */
        const option = param.options[optionId];
        const activeImages = thisProduct.dom.imageWrapper.querySelectorAll(
          'img' + '.' + paramId + '-' + optionId
        );

        if (formData[paramId].includes(optionId)) {
          for (let activeImage of activeImages) {
            activeImage.classList.add(classNames.menuProduct.imageVisible);
          }
          if (!option.default) {
            price += option.price;
          }
        } else {
          for (let activeImage of activeImages) {
            activeImage.classList.remove(classNames.menuProduct.imageVisible);
          }
          if (option.default) {
            price -= option.price;
          }
        }
      }
    }

    /* [NEW] Add new property priceSingle */
    thisProduct.priceSingle = price;
    /* Multiply price by amount */
    price *= thisProduct.amountWidget.value;
    /* Update calculated price in the HTML */
    thisProduct.dom.priceElem.innerHTML = price;
  }

  initAmountWidget() {
    const thisProduct = this;

    thisProduct.amountWidget = new AmountWidget(
      thisProduct.dom.amountWidgetElem
    );
    thisProduct.dom.amountWidgetElem.addEventListener('updated', function () {
      thisProduct.processOrder();
    });
  }

  prepareCartProduct() {
    const thisProduct = this;

    const productSummary = {
      id: thisProduct.id,
      name: thisProduct.data.name,
      amount: thisProduct.amountWidget.value,
      priceSingle: thisProduct.priceSingle,
      price: thisProduct.dom.priceElem.innerHTML,
      params: thisProduct.prepareCartProductParams(),
    };
    return productSummary;
  }

  prepareCartProductParams() {
    const thisProduct = this;
    const formData = utils.serializeFormToObject(thisProduct.dom.form);
    const productParamsSummary = {};

    // for every category (param)
    for (let paramId in thisProduct.data.params) {
      const param = thisProduct.data.params[paramId];

      // create category param in productParamsSummary const eg. productParamsSummary = { ingredients: { name: 'Ingredients', options: {}}}

      productParamsSummary[paramId] = {
        label: param.label,
        options: {},
      };

      // for every option in this category
      for (let optionId in param.options) {
        const option = param.options[optionId];
        const optionSelected =
          formData[paramId] && formData[paramId].includes(optionId);

        if (optionSelected) {
          productParamsSummary[paramId].options[optionId] = option.label;
        }
      }
    }
    return productParamsSummary;
  }
  addToCart() {
    const thisProduct = this;
    // app.cart.add(thisProduct.prepareCartProduct());

    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      detail: {
        product: thisProduct.prepareCartProduct(),
      },
    });
    thisProduct.element.dispatchEvent(event);
  }
}

export default Product;
//Używamy tu eksportowania domyślnego. Tylko i wyłącznie domyślnie eksportowany element/klasa/obiekt/funkcja może być importowany bez zastosowania nawiasów klamrowych.
