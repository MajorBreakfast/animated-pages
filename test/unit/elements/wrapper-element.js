import { Element, html } from '../../../../@polymer/polymer/polymer-element.js'

const template = html`
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
    <div class="value-page">[[testValue]]</div>
  </template>

  <template name="subproperty">
    <div class="subproperty-page">[[testValue.prop.subprop]]</div>
  </template>
</page-manager-element>`

export default class WrapperElement extends Element {
  static get is () { return 'wrapper-element' }

  static get template () { return template }

  static get properties () {
    return {
      testValue: {}
    }
  }
}

customElements.define(WrapperElement.is, WrapperElement)
