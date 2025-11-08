import { select } from '../settings.js';

class Carousel {
  constructor(element) {
    const thisCarousel = this;

    thisCarousel.dom = {};

    thisCarousel.render(element);
    thisCarousel.initPlugin();
  }

  render(element) {
    const thisCarousel = this;
    thisCarousel.dom.wrapper = element;
  }

  initPlugin() {
    const thisCarousel = this;

    /* eslint-disable */
    thisCarousel.flkty = new Flickity(thisCarousel.dom.wrapper, {
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

export default Carousel;
