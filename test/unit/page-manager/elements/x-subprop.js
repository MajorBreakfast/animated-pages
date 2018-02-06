import { Element, html } from '../../../../../@polymer/polymer/polymer-element.js'

export default class XSubprop extends Element {
  static get is () { return 'x-subprop' }

  static get template () { return html`[[prop.a.b]]` }

  static get properties () {
    return {
      prop: { notify: true }
    }
  }
}

customElements.define(XSubprop.is, XSubprop)
