class BaseWidget {
  constructor(wrapperElement, initialValue) {
    const thisWidget = this;

    thisWidget.dom = {};
    thisWidget.dom.wrapper = wrapperElement;

    thisWidget.correctValue = initialValue;
  }

  //getter - słówko get, spacja i nazwa właściwości, dla której getter ma być uruchamiany
  //thisWidget.correctValue należy zmienić na inną nazwę (np. thisWidget.correctValue), ponieważ metoda getter wykonywałaby się nieskończenie wiele razy. Kiedy spróbujemy odczytać wartość value, zostanie wykonany getter. Kiedy zostanie wykonany, spróbuje odczytać wartość właściwości value po czym zostanie wykonany getter i tak dalej. Nieskończona pętla wykonań tej samej funkcji przez siebie samą. Rzeczywista wartość widgetu musimy przechowywać w innej właściwości niż thisWidget.correctValue.

  //Getter - metoda wykonywana przy każdej próbie odczytania wartości właściwości value
  get value() {
    const thisWidget = this;

    return thisWidget.correctValue;
  }

  //Setter - metoda, która jest wykonywana przy każdej próbie ustawienia nowej wartości właściwości value.
  set value(value) {
    const thisWidget = this;

    const newValue = thisWidget.parseValue(value);

    //TODO: Add validation

    if (newValue != thisWidget.correctValue && thisWidget.isValid(newValue)) {
      thisWidget.correctValue = newValue;
      thisWidget.announce();
    }

    thisWidget.renderValue();
  }

  setValue(value) {
    const thisWidget = this;

    thisWidget.value = value;
    //Taki zapis spowoduje, że zostanie wykonany setter, który ustawi nową wartość tylko jeśli jest ona poprawna (if).
  }

  parseValue(value) {
    return parseInt(value);
  }

  isValid(value) {
    return !isNaN(value);
  }
  renderValue() {
    const thisWidget = this;
    thisWidget.dom.wrapper.innerHTML = thisWidget.value;
  }

  announce() {
    const thisWidget = this;

    //"updated" is an invented name, a random one
    // const event = new Event('updated');
    const event = new CustomEvent('updated', {
      bubbles: true,
    });
    thisWidget.dom.wrapper.dispatchEvent(event);
  }
}

export default BaseWidget;
