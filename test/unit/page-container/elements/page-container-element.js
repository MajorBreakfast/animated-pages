import { Element, html } from '../../../../../@polymer/polymer/polymer-element.js'
import PageContainer from '../../../../lib/mixins/page-container/page-container.js'

export default class PageContainerElement extends PageContainer(Element) {
  static get is () { return 'page-container-element' }
}

customElements.define(PageContainerElement.is, PageContainerElement)
