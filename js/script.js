const select = {
  templateOf: {
    book: '#template-book',
  },
  containerOf: {
    book: '.books-list',
  },
  images: {
    book: '.book__image',
  },
  form: {
    book: 'section.filters',
  },
};

const classNames = {
  book: {
    favoriteBook: 'favorite',
  },
};

const templates = {
  bookList: Handlebars.compile(
    document.querySelector(select.templateOf.book).innerHTML
  ),
};

('use strict');

class BooksList {
  constructor() {
    const thisBook = this;

    thisBook.filters = [];
    thisBook.favoriteBook = [];
    thisBook.initData();
    thisBook.getElements();
    thisBook.render();
    thisBook.initActions();
  }

  initData() {
    const thisBook = this;
    thisBook.data = dataSource.books;
  }

  getElements() {
    const thisBook = this;
    thisBook.bookContainer = document.querySelector(select.containerOf.book);
    thisBook.filtersForm = document.querySelector(select.form.book);
  }

  determineRatingBgc(rating) {
    if (rating < 6) {
      return 'linear-gradient(to bottom,  #fefcea 0%, #f1da36 100%);';
    } else if (rating > 6 && rating <= 8) {
      return 'linear-gradient(to bottom, #b4df5b 0%,#b4df5b 100%);';
    } else if (rating > 8 && rating <= 9) {
      return 'linear-gradient(to bottom, #299a0b 0%, #299a0b 100%);';
    } else if (rating > 9) {
      return 'linear-gradient(to bottom, #ff0084 0%,#ff0084 100%);';
    }
  }

  render() {
    const thisBook = this;

    for (let book of thisBook.data) {
      book.ratingBgc = thisBook.determineRatingBgc(book.rating);
      book.ratingWidth = book.rating * 10;

      const generatedHTML = templates.bookList(book);

      thisBook.bookDOM = utils.createDOMFromHTML(generatedHTML);

      thisBook.bookContainer.appendChild(thisBook.bookDOM);
    }
  }

  initActions() {
    const thisBook = this;

    thisBook.bookContainer.addEventListener('dblclick', function (event) {
      const clickedElement = event.target.offsetParent;

      event.preventDefault();

      const bookAttribute = clickedElement.getAttribute('data-id');

      if (
        thisBook.favoriteBook.includes(bookAttribute) &&
        clickedElement.classList.contains(classNames.book.favoriteBook)
      ) {
        clickedElement.classList.remove(classNames.book.favoriteBook);

        thisBook.favoriteBook.splice(
          thisBook.favoriteBook.indexOf(bookAttribute),
          1
        );
      } else {
        clickedElement.classList.add(classNames.book.favoriteBook);
        thisBook.favoriteBook.push(bookAttribute);
      }
      console.log(thisBook.favoriteBook);
    });

    thisBook.filtersForm.addEventListener('click', function (event) {
      const clickedElement = event.target;

      if (
        clickedElement.tagName == 'INPUT' &&
        clickedElement.type == 'checkbox' &&
        clickedElement.name == 'filter'
      ) {
        if (clickedElement.checked) {
          thisBook.filters.push(clickedElement.value);
        } else {
          thisBook.filters.splice(
            thisBook.filters.indexOf(clickedElement.value),
            1
          );
        }
        console.log(thisBook.filters);
      }
      thisBook.filterBooks();
    });
  }

  filterBooks() {
    const thisBook = this;

    for (let book of thisBook.data) {
      let shouldBeHidden = false;

      for (const filter of thisBook.filters) {
        if (!book.details[filter]) {
          shouldBeHidden = true;
          break;
        }
      }
      const bookImage = document.querySelector(
        '.book__image[data-id="' + book.id + '"]'
      );
      if (shouldBeHidden == true) {
        bookImage.classList.add('hidden');
      } else {
        bookImage.classList.remove('hidden');
      }
    }
  }
}
const app = new BooksList();
app.initData();
