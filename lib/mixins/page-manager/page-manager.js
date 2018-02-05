import { dedupingMixin } from '../../../../@polymer/polymer/lib/utils/mixin.js'
import { Templatize } from '../../../../@polymer/polymer/lib/utils/templatize.js'
import Page from './page.js'

/**
 * The page manager is responsible for creating and removing pages from the DOM.
 * Features:
 * - Pages create their element using a template
 * - The creation of the element of a page is deferred until the page is
 *   inserted into the DOM
 * - On removal a page can either
 *   - Discard its DOM element: If the page is inserted again later, a new
 *     element is created using the page's template.
 *   - Keep its DOM element: No property changes will be propagated while the
 *     page is removed. If the page is inserted again later, the element is
 *     reused and all property changes that happend in the meantime will be
 *     propagated to the element.
 */
const PageManager = dedupingMixin(SuperClass => {
  /**
   * @mixinClass
   * @polymer
   */
  class PageManager extends SuperClass {
    constructor (element) {
      super()
      this.__templateConstructorMap = new Map()
      this.__pages = new Set()
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
        const pageVarName = template.getAttribute('page-as') || 'page'
        const owner = this
        TplCtor = Templatize.templatize(template, owner, {
          mutableData: true, // Needed by the sync mechanism

          instanceProps: {
            [pageVarName]: true
          },

          forwardHostProp (prop, value) {
            // host -> template instance
            const pages = this.__pages
            for (let page of pages) { page._forwardHostProp(prop, value) }
          },

          notifyInstanceProp (inst, prop, value) {
            // host <- template instance
            console.log(inst, prop, value)
          }
        })
        TplCtor.__pageVarName = pageVarName
        this.__templateConstructorMap.set(templateName, TplCtor)
      }
      return TplCtor
    }

    /**
     * Adds new page to the page manager.
     * @param {string} templateName
     * @return {Page}
     */
    _createPage (templateName) {
      const page = new Page(this, templateName)
      this.__pages.add(page)
      return page
    }

    /**
     * Deletes the page from the page manager
     * @param {*} page
     */
    _deletePage (page) {
      page.remove(true)
      this.__pages.delete(page)
    }
  }

  return PageManager
})

export default PageManager
