import { Templatize } from '../../@polymer/polymer/lib/utils/templatize.js'
import { root } from '../../@polymer/polymer/lib/utils/path.js'
import countChildElements from './utils/count-child-elements.js'
import getFirstElementChild from './utils/get-first-element-child.js'

export class Page {
  constructor (pageManager, templateName) {
    this.__pageManager = pageManager
    this.__templateName = templateName
    this.__isAttached = false
    this.__unsyncedProps = undefined
    this.__templateInstance = undefined
    this.__element = undefined
    this.__templateVariable = undefined
    this.__isTemplateVariableUnsynced = false
  }

  /**
   * Inserts the page's element into the DOM. Creates the element if necessary.
   * @param {Node} refElement Specifies before which other element the page's
   * element should be inserted. If the value is `null`, the element is appended
   * at the end.
   */
  insertBefore (refElement) {
    if (this.__isAttached) { this.remove(false) }

    if (this.__templateInstance) {
      let needsFlush = false
      // Sync template variable
      if (this.__isTemplateVariableUnsynced) {
        const prop = this.__pageManager.__templateVariableName
        const value = this.__templateVariable
        this.__templateInstance._setPendingProperty(prop, value)
        this.__isTemplateVariableUnsynced = false
        needsFlush = true
      }

      // Sync properties changes
      if (this.__unsyncedProps) {
        const dataHost = this.__pageManager.__element.__dataHost
        for (let prop of this.__unsyncedProps) {
          this.__templateInstance._setPendingProperty(prop, dataHost[prop])
        }
        this.__unsyncedProps = null
        needsFlush = true
      }

      if (needsFlush) { this.__templateInstance._flushProperties() }
    } else {
      const TplCtor =
        this.__pageManager.__getTemplateConstructor(this.__templateName)

      const prop = this.__pageManager.__templateVariableName
      this.__templateInstance = new TplCtor({ [prop]: this.__templateVariable })

      this.__element = getFirstElementChild(this.__templateInstance.root)

      // Warn if there is more than one root element inside the template
      const elementCount = countChildElements(this.__templateInstance.root)
      if (elementCount !== 1) {
        console.warn(`Expected template "${this.__templateName}" to contain ` +
                     `exactly one root element, found ${elementCount}.`)
      }
    }

    this.__pageManager.__element.insertBefore(this.__element, refElement)
    this.__isAttached = true
  }

  /**
   * Removes the page's element from the DOM
   * @param {*} shouldDiscardElement Whether to discard the element or keep it
   * for later if the page is inserted again.
   */
  remove (shouldDiscardElement = false) {
    if (!this.__isAttached) { return}

    if (shouldDiscardElement) {
      this.__pageManager.__element.removeChild(this.__element)
      this.__templateInstance = null
      this.__element = null
    } else {
      this.__templateInstance.root.appendChild(this.__element)
    }

    this.__isAttached = false
  }

  get templateVariable () { return this.__templateVariable }
  set templateVariable (value) {
    this.__templateVariable = value
    if (this.__isAttached) {
      const prop = this.__pageManager.__templateVariableName
      this.__templateInstance._setPendingProperty(prop, value)
      this.__templateInstance._flushProperties()
    } else {
      this.__isTemplateVariableUnsynced = true
    }
  }

  /**
   * Fowards change to template variable
   * @param {*} path
   * @param {*} value
   */
  forwardTemplateVariableChange (path, value) {
    const prop = this.__pageManager.__templateVariableName
    const itemPath = prop + (path ? '.' + path : '')
    // This is effectively `notifyPath`, but avoids some of the overhead
    // of the public API
    this.__templateInstance._setPendingPropertyOrPath(itemPath, value, false, true)
    this.__templateInstance._flushProperties()
  }

  get element () { return this.__element }

  __forwardHostProp (prop, value) {
    if (this.__isAttached) {
      this.__templateInstance.forwardHostProp(prop, value)
    } else if (this.__templateInstance) {
      // Remember property change, so that it can be synced later if the page
      // becomes active again
      if (!this.__unsyncedProps) { this.__unsyncedProps = new Set() }
      this.__unsyncedProps.add(root(prop))
    }
  }
}

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
export default class PageManager {
  constructor (element, templateVariableName = 'page') {
    this.__element = element
    this.__templateVariableName = templateVariableName
    this.__templateConstructorMap = new Map()
    this.__pages = new Set()
  }

  /**
   * Returns the template that has its name attribute set to the specified name.
   * @param {*} templateName
   */
  __getTemplate (templateName) {
    const element = this.__element
    for (let c = element.firstElementChild; c; c = c.nextElementSibling) {
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
      const owner = this.__element
      TplCtor = Templatize.templatize(template, owner, {
        mutableData: true, // Needed by the sync mechanism

        instanceProps: {
          [this.__templateVariableName]: true
        },

        forwardHostProp: (prop, value) => {
          // host -> template instance
          for (let page of this.__pages) { page.__forwardHostProp(prop, value) }
        },

        notifyInstanceProp: (inst, prop, value) => {
          // host <- template instance
          console.log(inst, prop, value)
        }
      })
      this.__templateConstructorMap.set(templateName, TplCtor)
    }
    return TplCtor
  }

  /**
   * Adds new page to the page manager.
   * @param {string} templateName
   * @return {Page}
   */
  createPage (templateName) {
    const page = new Page(this, templateName)
    this.__pages.add(page)
    return page
  }

  /**
   * Deletes the page from the page manager
   * @param {*} page
   */
  deletePage (page) {
    page.remove(true)
    this.__pages.delete(page)
  }
}
