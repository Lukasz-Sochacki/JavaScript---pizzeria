import { templates, select } from '../settings.js';

class Home {
  constructor() {
    const thisHome = this;

    thisHome.render();
    thisHome.initWidgets();
  }

  render() {
    const thisHome = this;
    const generatedHTML = templates.home();

    thisHome.dom = {};
    thisHome.dom.wrapper = document.querySelector(select.containerOf.home);
    thisHome.dom.wrapper.innerHTML = generatedHTML;

    thisHome.dom.carousel = thisHome.dom.wrapper.querySelector(
      select.containerOf.carousel
    );
  }
  initWidgets() {
    const thisHome = this;
    /* eslint-disable */
    thisHome.flkty = new Flickity(thisHome.dom.carousel, {
      /* eslint-enable */
      cellAlign: 'center',
      contain: true,
      autoPlay: 3000,
      pauseAutoPlayOnHover: false,
      wrapAround: false,
      prevNextButtons: false,
      pageDots: true,
      freeScroll: true,
    });
  }
}

export default Home;
