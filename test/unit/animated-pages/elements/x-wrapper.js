import { Element, html } from '../../../../../@polymer/polymer/polymer-element.js'
import '../../../../lib/animated-pages.js'

const template = html`
<animated-pages id="animated-pages">
  <template name="1"><div>1</div></template>
  <template name="2"><div>2</div></template>
</animated-pages>`

export default class XWrapper extends Element {
  static get is () { return 'x-wrapper' }

  static get template () { return template }
}

customElements.define(XWrapper.is, XWrapper)
