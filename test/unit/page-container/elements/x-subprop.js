import { PolymerElement, html } from '../../../../../@polymer/polymer/polymer-element.js'

export default class XSubprop extends PolymerElement {
  static get is () { return 'x-subprop' }

  static get template () { return html`[[prop.a.b]]` }

  static get properties () {
    return {
      prop: { notify: true }
    }
  }
}

customElements.define(XSubprop.is, XSubprop)
