import { Element, html } from '../../../../@polymer/polymer/polymer-element.js'
import PageManager from '../../../lib/page-manager.js'

export default class PageManagerElement extends Element {
  static get is () { return 'page-manager-element' }
  static get properties () {
    return {
      pageManager: { value () { return new PageManager(this) } }
    }
  }
}

customElements.define(PageManagerElement.is, PageManagerElement)
