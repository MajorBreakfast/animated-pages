import { Element, html } from '../../../../../@polymer/polymer/polymer-element.js'
import './animated-page-switcher.js'

const template = html`
<div>prop: [[_toJSON(prop, prop.*)]]</div>

<animated-page-switcher id="animated-page-switcher">
  <template name="a">
    <div>A</div>
  </template>

  <template name="b">
    <div>B</div>
  </template>

  <template name="c">
    <div>C</div>
  </template>

  <template name="d">
    <div>D</div>
  </template>
</animated-page-switcher>`

export default class XWrapper extends Element {
  static get is () { return 'x-wrapper' }

  static get template () { return template }
}

customElements.define(XWrapper.is, XWrapper)
