import { Element } from '../../../@polymer/polymer/polymer-element.js'

export default class DummyElement extends Element {
  static get is () { return 'dummy-element' }
}

customElements.define(DummyElement.is, DummyElement)
