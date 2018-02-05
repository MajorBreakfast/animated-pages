import { root as rootOfPath } from '../../../../@polymer/polymer/lib/utils/path.js'
import countChildElements from '../../utils/count-child-elements.js'
import getFirstElementChild from '../../utils/get-first-element-child.js'

export default class Page {
  constructor (parentElement, templateName) {
    this.__parentElement = parentElement
    this.__templateName = templateName
    this.__isAttached = false
    this.__unsyncedProps = undefined
    this.__templateInstance = undefined
    this.__element = undefined
    this.__pageVar = undefined
    this.__isPageVarUnsynced = false
  }

  /**
   * Inserts the page's element into the DOM. Creates the element if necessary.
   * @param {Node} refElement Specifies before which other element the page's
   * element should be inserted. If the value is `null`, the element is appended
   * at the end.
   */
  insertBefore (refElement) {
    if (this.__isAttached) { this.remove(false) }

    if (!this.__templateInstance) {
      const TplCtor =
        this.__parentElement.__getTemplateConstructor(this.__templateName)
      const pageVarName = TplCtor.__pageVarName
      this.__pageVarName = pageVarName

      this.__templateInstance = new TplCtor({ [pageVarName]: this.__pageVar })

      this.__element = getFirstElementChild(this.__templateInstance.root)

      // Warn if there is more than one root element inside the template
      const elementCount = countChildElements(this.__templateInstance.root)
      if (elementCount !== 1) {
        console.warn(`Expected template "${this.__templateName}" to contain ` +
                     `exactly one root element, found ${elementCount}.`)
      }
    } else {
      let needsFlush = false
      // Sync template variable
      if (this.__isPageVarUnsynced) {
        const value = this.__pageVar
        this.__templateInstance._setPendingProperty(this.__pageVarName, value)
        this.__isPageVarUnsynced = false
        needsFlush = true
      }

      // Sync properties changes
      if (this.__unsyncedProps) {
        const dataHost = this.__parentElement.__dataHost
        for (let prop of this.__unsyncedProps) {
          this.__templateInstance._setPendingProperty(prop, dataHost[prop])
        }
        this.__unsyncedProps = null
        needsFlush = true
      }

      if (needsFlush) { this.__templateInstance._flushProperties() }
    }

    this.__parentElement.insertBefore(this.__element, refElement)
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
      this.__parentElement.removeChild(this.__element)
      this.__templateInstance = null
      this.__element = null
    } else {
      this.__templateInstance.root.appendChild(this.__element)
    }

    this.__isAttached = false
  }

  get pageVarName () { return }

  get pageVar () { return this.__pageVar }
  set pageVar (value) {
    this.__pageVar = value
    if (this.__isAttached) {
      this.__templateInstance._setPendingProperty(this.__pageVarName, value)
      this.__templateInstance._flushProperties()
    } else {
      this.__isPageVarUnsynced = true
    }
  }

  /**
   * Fowards change to template variable
   * @param {*} path
   * @param {*} value
   */
  forwardPageVarChange (path, value) {
    if (this.__isAttached) {
      const itemPath = this.__pageVarName + (path ? '.' + path : '')
      // This is effectively `notifyPath`, but avoids some of the overhead
      // of the public API
      this.__templateInstance._setPendingPropertyOrPath(itemPath, value, false, true)
      this.__templateInstance._flushProperties()
    }
  }

  get element () { return this.__element }

  _forwardHostProp (prop, value) {
    if (this.__isAttached) {
      this.__templateInstance.forwardHostProp(prop, value)
    } else if (this.__templateInstance) {
      // Remember property change, so that it can be synced later if the page
      // becomes active again
      if (!this.__unsyncedProps) { this.__unsyncedProps = new Set() }
      this.__unsyncedProps.add(rootOfPath(prop))
    }
  }
}
