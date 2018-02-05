import { Element, html } from '../../../../../@polymer/polymer/polymer-element.js'

export default class XProp extends Element {
  static get is () { return 'x-prop' }

  static get template () { return html`[[prop]]` }

  static get properties () {
    return {
      prop: { notify: true }
    }
  }
}

customElements.define(XProp.is, XProp)
