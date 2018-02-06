import { Element, html } from '../../../../../@polymer/polymer/polymer-element.js'
import './page-manager-element.js'
import './x-prop.js'

const template = html`
<div>prop: [[_toJSON(prop, prop.*)]]</div>

<page-manager-element id="page-manager-element">
  <template name="post">
    <div class="post-page">
      <h1>[[page.data.title]]</h1>
      <div>[[page.data.content]]</div>
      <ul class="comments">
        <template is="dom-repeat" items="[[page.data.comments]]">
          <li>[[item.author]]: [[item.content]]</li>
        </template>
      </ul>
    </div>
  </template>

  <template name="home">
    <div class="home-page">
      <h1>Home</h1>
      <div>Welcome to my Blog!</div>
    </div>
  </template>

  <template name="value">
    <x-prop class="value-page" prop="{{prop}}"></x-prop>
  </template>

  <template name="subproperty">
    <x-prop class="subproperty-page" prop="{{prop.a.b}}"></x-prop>
  </template>
</page-manager-element>`

export default class XWrapper extends Element {
  static get is () { return 'x-wrapper' }

  static get template () { return template }

  static get properties () {
    return {
      prop: {}
    }
  }

  _toJSON (x) { return JSON.stringify(x) }
}

customElements.define(XWrapper.is, XWrapper)
