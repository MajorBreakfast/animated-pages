import { dedupingMixin } from '../../../../@polymer/polymer/lib/utils/mixin.js'
import { Templatize } from '../../../../@polymer/polymer/lib/utils/templatize.js'
import Page from './page.js'

/**
 * The page container is responsible for creating and removing pages from the
 * DOM.
 * Features:
 * - Pages create their element using a template
 * - Pages can exist without an element. The creation of a page's element is
 *   deferred until the page's element needs to be inserted into the DOM
 * - When the element of a page is removed from the DOM, the page can either...
 *   - Discard its DOM element: If the page is inserted again later, a new
 *     element is created using the page's template.
 *   - Keep its DOM element
 * - Pages can be hidden
 * - Non-deep property changes won't be propagated to the page's template
 *   instance while the element is detached or hidden. (Deep property changes,
 *   like the mutation of arrays or setting of object properties will be
 *   propagated, however). If the page is inserted or shown again later, the
 *   element is reused and all property changes that happend in the meantime
 *   will be propagated to the element.
 */
const PageContainer = dedupingMixin(SuperClass => {
  /**
   * @mixinClass
   * @polymer
   */
  class PageContainer extends SuperClass {
    constructor (element) {
      super()
      this.__templateConstructorMap = new Map()
      this.__pageSet = new Set()
    }

    /**
     * Returns the template that has its name attribute set to the specified name.
     * @param {*} templateName
     */
    __getTemplate (templateName) {
      for (let c = this.firstElementChild; c; c = c.nextElementSibling) {
        if (c.tagName === 'TEMPLATE' && c.getAttribute('name') === templateName) {
          return c
        }
      }
    }

    /**
     * Returns the constructor for the specified template. Makes use of Polymer's
     * `templatize()` mechanism.
     * @param {string} templateName
     */
    __getTemplateConstructor (templateName) {
      let TplCtor = this.__templateConstructorMap.get(templateName)
      if (!TplCtor) {
        const template = this.__getTemplate(templateName)
        const owner = this
        const restamp = Boolean(template.getAttribute('restamp'))
        const pageVarName = template.getAttribute('page-as') || 'page'

        TplCtor = Templatize.templatize(template, owner, {
          instanceProps: {
            [pageVarName]: true
          },
          forwardHostProp (prop, value) {
            // host -> template instance
            const pages = this.__pageSet
            for (let page of pages) { page._forwardHostProp(prop, value) }
          },
          notifyInstanceProp (inst, prop, value) {
            // host <- template instance
            console.log(inst, prop, value)
          }
        })
        TplCtor.__templateOptions = { restamp, pageVarName }

        this.__templateConstructorMap.set(templateName, TplCtor)
      }
      return TplCtor
    }

    /**
     * Adds new page to the page container.
     * @param {string} templateName
     * @return {Page}
     */
    _createPage (templateName) {
      const TemplateConstructor = this.__getTemplateConstructor(templateName)
      const page = new Page(this, TemplateConstructor)
      this.__pageSet.add(page)
      return page
    }

    /**
     * Deletes the page from the page container
     * @param {*} page
     */
    _deletePage (page) {
      page.detach(true)
      this.__pageSet.delete(page)
    }
  }

  return PageContainer
})

export default PageContainer
