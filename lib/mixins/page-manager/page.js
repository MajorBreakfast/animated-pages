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

  get element () { return this.__element }

  /**
   * Inserts the page's element into the DOM. Creates the element if necessary.
   * @param {Node} refElement Specifies before which other element the page's
   * element should be inserted. If the value is `null`, the element is appended
   * at the end.
   */
  insertBefore (refElement) {
    if (this.__isAttached) { this.remove(false) }

    let inst = this.__templateInstance
    if (!inst) {
      const TplCtor =
        this.__parentElement.__getTemplateConstructor(this.__templateName)
      this.__pageVarName = TplCtor.__pageVarName

      inst = new TplCtor({ [this.__pageVarName]: this.__pageVar })
      this.__templateInstance = inst

      this.__element = getFirstElementChild(inst.root)

      // Warn if there is more than one root element inside the template
      const elementCount = countChildElements(inst.root)
      if (elementCount !== 1) {
        console.warn(`Expected template "${this.__templateName}" to contain ` +
                     `exactly one root element, found ${elementCount}.`)
      }
    } else {
      let needsFlush = false
      // Sync template variable
      if (this.__isPageVarUnsynced) {
        const value = this.__pageVar
        inst._setPendingProperty(this.__pageVarName, value)
        this.__isPageVarUnsynced = false
        needsFlush = true
      }

      // Sync properties changes
      if (this.__unsyncedProps) {
        const dataHost = this.__parentElement.__dataHost
        for (let prop of this.__unsyncedProps) {
          inst._setPendingProperty(prop, dataHost[prop])
        }
        this.__unsyncedProps = null
        needsFlush = true
      }

      if (needsFlush) { inst._flushProperties() }
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
  forwardPageVarChange (subpath, value) {
    const inst = this.__templateInstance
    const root = this.__pageVarName
    const path = root + (subpath ? '.' + subpath : '')

    if (this.__isAttached) {
      // Propagate reported change now
      inst._setPendingPropertyOrPath(path, value, false, true)
      inst._flushProperties()
      if (root === path) { this.__pageVar = value }
    } else if (inst) { // Not attached
      // Delay property change propagation if possible

      if (root === path) { // Path is not deep: Propagate later
        this.__pageVar = value
        this.__isPageVarUnsynced = true
      } else { // Path is deep: Propagate now
        if (this.__isPageVarUnsynced) {
          // Propagate earlier root property change
          inst._setPendingProperty(root, value)
          inst._flushProperties()
          this.__isPageVarUnsynced = false
        }
        // Propagate reported change now
        inst._setPendingPropertyOrPath(path, value, false, true)
        inst._flushProperties()
      }
    }
  }

  _forwardHostProp (path, value) {
    const inst = this.__templateInstance

    if (this.__isAttached) {
      // Propagate reported change now
      inst.forwardHostProp(path, value)
    } else if (inst) { // Not attached
      // Delay property change propagation if possible

      const root = rootOfPath(path)
      if (root === path) { // Path is not deep: Propagate later
        if (!this.__unsyncedProps) { this.__unsyncedProps = new Set() }
        this.__unsyncedProps.add(root)
      } else { // Path is deep: Propagate now
        if (this.__unsyncedProps && this.__unsyncedProps.has(root)) {
          // Propagate earlier root property change
          this.__unsyncedProps.delete(root)
          const value = this.__parentElement.__dataHost[root]
          inst.forwardHostProp(root, value)
        }
        // Propagate reported change now
        inst.forwardHostProp(path, value)
      }
    }
  }
}
