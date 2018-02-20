import { Element, html } from '../../../../../@polymer/polymer/polymer-element.js'
import './animated-page-switcher.js'

const template = html`
<div>prop: [[_toJSON(prop, prop.*)]]</div>

<animated-page-switcher id="animated-page-switcher">
  <template name="1">
    <div>1</div>
  </template>

  <template name="2">
    <div>2</div>
  </template>

  <template name="3">
    <div>3</div>
  </template>

  <template name="4">
    <div>4</div>
  </template>
</animated-page-switcher>`

export default class XWrapper extends Element {
  static get is () { return 'x-wrapper' }

  static get template () { return template }
}

customElements.define(XWrapper.is, XWrapper)
