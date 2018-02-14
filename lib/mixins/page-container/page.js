import { root as rootOfPath } from '../../../../@polymer/polymer/lib/utils/path.js'
import countChildElements from '../../utils/count-child-elements.js'
import getFirstElementChild from '../../utils/get-first-element-child.js'

export default class Page {
  constructor (parentElement, templateName) {
    this.__parentElement = parentElement
    this.__templateName = templateName
    this.__inserted = false
    this.__visible = true
    this.__pageVar = undefined

    // Delayed property syncing
    this.__unsyncedPropSet = undefined
    this.__isPageVarUnsynced = false

    // Set at template instatiation
    this.__templateInstance = undefined
    this.__element = undefined
    this.__templateOptions = false
  }

  /**
   * Returns whether the page's element is currently attached to the document.
   */
  get inserted () { return this.__inserted }

  /**
   * Returns the DOM element of the page once the page has instantiated its
   * template.
   */
  get element () { return this.__element }

  /**
   * Returns the options defined through attributes on the template element once
   * the template has been instantiated.
   * ```TS
   * type TemplateOptions {
   *   pageVarName: string,
   *   restamp: boolean
   * }
   * ```
   */
  get templateOptions () { return this.__templateOptions }

  /**
   * Visibility of the DOM element of the page. If `visible` is set to false,
   * the DOM element's `hidden` property will be set and property changes
   * will be delayed.
   */
  get visible () { return this.__visible }
  set visible (visible) {
    visible = Boolean(visible)
    if (this.__visible === visible) { return }
    this.__visible = visible
    if (this.__element) { this.__element.hidden = !visible }
    if (visible) { this.__syncUnsyncedProps() }
  }

  get __shouldSyncProps () { return this.__visible && this.__inserted }

  /**
   * Inserts the page's element into the DOM. Creates the element if necessary.
   * @param {Node} refElement Specifies before which other element the page's
   * element should be inserted. If the value is `null`, the element is appended
   * at the end.
   */
  insertBefore (refElement) {
    this.__syncUnsyncedProps() // Is NOP if there's no template instance
    this.__ensureTemplateInstance()
    this.__parentElement.insertBefore(this.__element, refElement)
    this.__inserted = true
  }

  /**
   * Removes the page's element from the DOM. If the page was has
   * @param {*} deleteElement Whether to discard the page's DOM element
   * for later if the page is inserted again.
   */
  detach (deleteElement = false) {
    if (!this.__inserted) { return }

    this.__inserted = false
    this.__parentElement.removeChild(this.__element)
    const restamp = this.__templateOptions.restamp
    if (deleteElement || restamp ) { this.__deleteTemplateInstance() }
  }

  /**
   * This property contains the value of the page's template variable.
   */
  get pageVar () { return this.__pageVar }
  set pageVar (pageVar) {
    this.__pageVar = pageVar
    if (this.__shouldSyncProps) {
      const pageVarName = this.__templateOptions.pageVarName
      this.__templateInstance._setPendingProperty(pageVarName, pageVar)
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
    const root = this.__templateOptions.pageVarName
    const path = root + (subpath ? '.' + subpath : '')

    if (this.__shouldSyncProps) {
      // Propagate reported change now
      inst._setPendingPropertyOrPath(path, value, false, true)
      inst._flushProperties()
      if (root === path) { this.__pageVar = value }
    } else if (inst) { // Delay property change propagation if possible
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

    if (this.__shouldSyncProps) {
      // Propagate reported change now
      inst.forwardHostProp(path, value)
    } else if (inst) { // Delay property change propagation if possible
      const root = rootOfPath(path)
      if (root === path) { // Path is not deep: Propagate later
        if (!this.__unsyncedPropSet) { this.__unsyncedPropSet = new Set() }
        this.__unsyncedPropSet.add(root)
      } else { // Path is deep: Propagate now
        if (this.__unsyncedPropSet && this.__unsyncedPropSet.has(root)) {
          // Propagate earlier root property change
          this.__unsyncedPropSet.delete(root)
          const value = this.__parentElement.__dataHost[root]
          inst.forwardHostProp(root, value)
        }
        // Propagate reported change now
        inst.forwardHostProp(path, value)
      }
    }
  }

  __syncUnsyncedProps () {
    let inst = this.__templateInstance
    if (!inst) { return }

    // Sync template variable
    if (this.__isPageVarUnsynced) {
      const pageVarName = this.__templateOptions.pageVarName
      inst._setPendingProperty(pageVarName, this.__pageVar)
      this.__isPageVarUnsynced = false
    }

    // Sync properties changes
    if (this.__unsyncedPropSet) {
      const dataHost = this.__parentElement.__dataHost
      for (let prop of this.__unsyncedPropSet) {
        inst._setPendingProperty(prop, dataHost[prop])
      }
      this.__unsyncedPropSet = null
    }

    inst._flushProperties()
  }

  __ensureTemplateInstance () {
    let inst = this.__templateInstance
    if (inst) { return }

    const TplCtor =
      this.__parentElement.__getTemplateConstructor(this.__templateName)
    this.__templateOptions = TplCtor.__templateOptions

    inst = new TplCtor({ [this.__templateOptions.pageVarName]: this.__pageVar })
    this.__templateInstance = inst

    this.__element = getFirstElementChild(inst.root)
    this.__element.hidden = !this.__visible

    // Warn if there is more than one root element inside the template
    const elementCount = countChildElements(inst.root)
    if (elementCount !== 1) {
      console.warn(`Expected template "${this.__templateName}" to contain ` +
                    `exactly one root element, found ${elementCount}.`)
    }

    this.__isPageVarUnsynced = false
    this.__unsyncedPropSet = undefined
  }

  __deleteTemplateInstance () {
    this.__templateInstance = undefined
    this.__element = undefined
    this.__templateOptions = undefined

    this.__isPageVarUnsynced = false
    this.__unsyncedPropSet = undefined
  }
}
