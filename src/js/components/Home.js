import { templates, select } from '../settings.js';
import Carousel from '../components/Carousel.js';

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

    thisHome.carousel = new Carousel(thisHome.dom.carousel);
  }
}

export default Home;
