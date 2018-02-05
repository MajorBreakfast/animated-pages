import { Element, html } from '../../../../../@polymer/polymer/polymer-element.js'
import PageManager from '../../../../lib/mixins/page-manager/page-manager.js'

export default class PageManagerElement extends PageManager(Element) {
  static get is () { return 'page-manager-element' }
}

customElements.define(PageManagerElement.is, PageManagerElement)
