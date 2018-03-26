import { PolymerElement } from '../../../../../@polymer/polymer/polymer-element.js'
import PageContainerMixin from '../../../../lib/mixins/page-container/page-container.js'

export default class PageContainer extends PageContainerMixin(PolymerElement) {
  static get is () { return 'page-container' }
}

customElements.define(PageContainer.is, PageContainer)
