import { Element, html } from '../../@polymer/polymer/polymer-element.js'
import AnimatedPageSwitcher from './mixins/animated-page-switcher/animated-page-switcher.js'

const template = html`
<style>
  :host {
    display: block;
  }

  :host(:not([no-style])) {
    /* Force stacking context through "position: relative; z-index: 0" */
    position: relative;
    z-index: 0;
  }

  :host(:not([no-style])) ::slotted(*) {
    /* Force stacking context through "position: absolute; z-index: 0" */
    position: absolute; top: 0; right: 0; bottom: 0; left: 0;
    z-index: 0;
  }

  ::slotted([hidden]) { display: none !important; }
</style>

<slot></slot>
`

/**
 * The `<animated-pages>` element provides a flexible mechanism for animating
 * between different pages of a web app. The element handles the instantiation
 * of templates, provides various hooks, mangages property bindings and the
 * firing of events. Animations can be implemented either via CSS or JavaScript.
 * The package also ships with some pre-built animations which can be used to
 * get started quickly or as a reference for building custom animations.
 *
 * ## Basic Usage
 * The simplest way to use the `<animated-pages>` element looks like this:
 *
 * ```HTML
 * <animated-pages selected="[[_selectedPage]]"
 *                 create-segue="_createSegue">
 *   <template name="page1"><x-page1></x-page1></template>
 *   <template name="page2"><x-page2></x-page2></template>
 * </animated-pages>
 * ```
 *
 * Here the `selected` property has beend bound to the `_selectedPage`
 * property on the host element. Whenever the value of this property changes,
 * the page with the respective `name` is animated in. For example, setting it
 * to `'page1'` will make page 1 appear.
 *
 * A nice detail about segues: If the property is changed while a
 * segue is already in progress, a new segue will begin after the current
 * segue has finished playing. If the property is changed multiple times
 * until the next segue starts, the `<animated-pages>` element will directly
 * animate to the most recent value.
 *
 * Each page is defined through a named template. The template has to contain
 * exactly one element at the top level. The name of the template is defined
 * by setting the `name` attribute on it.
 *
 * The segue is configured through a function. The `createSegue`
 * property is set to the name of the method on the host element that
 * shall be called. In the above example this function is called
 * `_createSegue()`:
 *
 * ```JS
 * import SwapSegue from 'animated-pages/lib/segues/swap-segue.js'
 * // ...
 * class MyElement extends Element {
 *   // ...
 *   _createSegue ({ elementA, elementB }) {
 *     return new SwapSegue({ duration: 300 })
 *   }
 * ```
 *
 * Here, the `SwapSegue` that ships as one of the built-in segues
 * included in the `animated-pages` package is used to smoothly transition
 * between the two elements.
 *
 * `elementA` and `elementB` are the two DOM elements involved in the
 * segue. Each property value is `undefined` if the the respective page
 * does not exist. This happens if the page change only involves a single
 * page and there is nothing to animate to or from.
 *
 * The object that is passed into the `createSegue()` function has
 * additional properties besides `elementA` and `elementB` which were not used
 * in the example above. It is, for example, possible to set up different
 * segues for different page combinations. You can learn more about these
 * in the description of the `createSegue` property.
 *
 * ## CSS Animations
 * It is possible to define animations using CSS. The `ClassSegue`
 * sets a class on each element which can then be used to play a CSS animation.
 *
 * ```CSS
 * .fade-in { z-index: 1; animation: fade-in 300ms forwards; }
 * .fade-out { animation: fade-in 300ms forwards reverse; }
 * @keyframes fade-in {
 *   0% { opacity: 0; }
 *   100% { opacity: 1; }
 * }
 * ```
 *
 * ```JS
 * import ClassSegue from 'animated-pages/lib/segues/class-segue.js'
 * // ...
 * _createSegue ({ elementA, elementB }) {
 *   return new ClassSegue({
 *     classA: 'fade-out',
 *     classB: 'fade-in',
 *     duration: 300
 *   })
 * }
 * ```
 *
 * The `duration` property specified in the function call should match the
 * animation duration specified in CSS. It determines how long both page
 * elements stay visible together and how long the CSS classes remain set.
 *
 * @customElement
 * @summary Web component for smooth page transitions
 *
 */
class AnimatedPages extends AnimatedPageSwitcher(Element) {
  constructor () {
    super()
    this.__idToPageMap = new Map()
  }

  static get is () { return 'animated-pages' }

  static get template () { return template }

  static get properties () {
    return {
      /**
       * The `selected` property defines which page should be displayed.
       *
       * The description of a page looks like this:
       * ```TS
       * type PageDefinition = {
       *   id?: string,
       *   templateName: string,
       *   restamp?: boolean,
       *   data?: any
       * } | string
       * ```
       *
       * - `id`: The `id` is what makes the page unique. If it is not defined,
       *   the `templateName` is used as `id`. You can create multiple pages
       *   with different `id`s but with the same `<template>`.
       * - `templateName`: The name of the `<template>` that shall be used.
       * - `restamp`: If set to `true`, the DOM element of the page is
       *   removed from the DOM as soon as the page becomes invisible and a
       *   new element will be created once the page becomes visible again.
       *   If set to `false` the element stays in the DOM with its `hidden`
       *   attribute set. The `restamp` property defaults to `false`, unless
       *   `restamp` is set on the `<template>` or the `<animated-pages>`
       *   element.
       * - `data`: The data that shall be passed into the page. The `data`
       *   property's value becomes available as the `page.data` variable inside
       *   the template of the page. It may be changed and any modifications to
       *   it will be propagated to and from the page template instance.
       */
      selected: {
        type: String,
        notify: true,
        observer: '__onSelectedChange'
      },

      /**
       * This property is used to define the segue between pages. The value
       * can either be a function or a string. If it is a string, the method
       * with the specified name on the host element is called.
       *
       * The function is passed-in the following options:
       * ```TS
       * type SegueOptions = {
       *   elementA?: HTMLElement, elementB?: HTMLElement
       *   idA?: any, idB?: any,
       *   templateNameA?: string, templateNameB?: string,
       *   dataA?: any, dataB?: any
       *   initialRender: boolean
       * }
       * ```
       * - `id{A,B}`, `templateName{A,B}` and `data{A,B}` are the
       *   id, template name and data of the two pages. "A" refers to the
       *   old page that animates out, and "B" to the new page that animates in.
       *   The values for either page can be `undefined` when the page change
       *   only involves a single page, i.e. there is nothing to animate to or
       *   from.
       * - The `initalRender` boolean can be used to detect when the
       *   `<animated-pages>` has just been added to the document, for example
       *   when the user has just loaded the website. Playing no or a different
       *   segue on the initial render can improve the experience in some
       *   scenarios.
       *
       * The return value can be either `undefined` or a segue.
       *
       * ```HTML
       * <animated-pages create-segue="_createSegue">
       *   ...
       * </animated-pages>
       * ```
       *
       * ```JS
       * import SwapSegue from 'animated-pages/lib/segues/swap-segue.js'
       *
       * class MyElement extends Element {
       *   ...
       *   _createSegue ({ initialRender }) {
       *     if (initialRender) { return }
       *     return new SwapSegue()
       *   }
       * }
       * ```
       *
       * A segue is an object of the following format:
       * ```TS
       * interface Segue {
       *   start: () => Promise<SegueResult|undefined>
       *   stop?: () => void
       * }
       *
       * interface SegueResult {
       *   revert?: boolean
       * }
       * ```
       * - The `start()` method is called when the segue should begin
       *   playing. To signify when the segue has finished playing, the
       *   method has to return a promise which may optionally resolve to an
       *   `SegueResult` object. An `SegueResult` object is a plain
       *   JavaScript object with an optional `revert` property. `revert: true`
       *   means that the segue ended with pageA being the shown page.
       *   This is useful for segues that are controlled by user input
       *   (i.e. a touch gesture), because the user might change their mind
       *   while they control the segue.
       * - The `stop()` method is called when the segue finishes naturally
       *   or when it is canceled. This function is the last time the segue
       *   is allowed to modify the elements it is animating. Afterwards, it
       *   may no longer do so. This means that it has to in particular stop
       *   any animations it started in the `start()` method.
       *
       */
      createSegue: {
        type: Function,
        observer: '__onCreateSegueChange'
      },

      /**
       * By default `<animated-pages>` sets `position: relative; z-index: 0;`
       * on itself. As a result, the element becomes the root of a "stacking
       * context" which makes the `z-index` values of its children (the pages)
       * relative to it.
       *
       * Also, it sets `position: absolute; z-index: 0;` on all its children
       * (the pages). This makes each page element the root of a "stacking
       * context" and prevents weird ordering where some elements of a page
       * appear above and some underneath elements of another page. Instead, it
       * makes it so that the complete page is either above or underneath
       * another page.
       *
       * Additionally, it sets `top: 0; right: 0; bottom: 0; left: 0;` on
       * each page element to stack them on top of each other and to make each
       * the same size as its parent, the `<animated-pages>` element.
       *
       * Setting the `noStyle` property to `true` prevents all this.
       *
       * ```HTML
       * <animated-pages no-style>
       *   ...
       * </animated-pages>
       * ```
       */
      noStyle: {
        type: Boolean,
        reflectToAttribute: true
      },

      /**
       * By default, the element of each page is kept while the page is not
       * shown. With `restamp` enabled, page elements are not kept. Instead,
       * each page's element is recreated every time the page is shown.
       *
       * Setting this property means that `restamp` is enabled for every
       * template. If you want to set it on a per template basis, set the
       * `restamp` attribute on the individual templates instead.
       *
       * This property only determines the `restamp` value if it is not set
       * in the page definition. A page definition with `restamp` explicitly set
       * to `false` will still produce a page with `restamp` disabled.
       * (e.g. `{ templateName: 'keepElementWhileHiddenPage', restamp: false }`)
       *
       * ```HTML
       * <animated-pages restamp>
       *   ...
       * </animated-pages>
       * ```
       */
      restamp: {
        type: Boolean,
        value: false
      },

      /**
       * Promise that resolves once the latest page change has finished playing.
       * The value of this property is set to a new promise each time a new
       * page change is enqueued.
       */
      finished: {
        type: Object,
        notify: true,
        readOnly: true,
        async value () {}
      }
    }
  }

  _enqueuePageChange (pageDefinition, createSegue) {
    const promise = super._enqueuePageChange({
      getPageB: () => {
        if (!pageDefinition) { return }

        if (typeof pageDefinition === 'function') {
          pageDefinition = pageDefinition()
        }

        const { id, templateName, restamp, data } =
          this._normalizePageDefinition(pageDefinition)

        let pageB = this.__idToPageMap.get(id)

        // Ensure correct page template
        if (pageB && pageB.templateOptions.name !== templateName) {
          this.__idToPageMap.delete(pageB)
          pageB = undefined
        }

        // Create page if needed
        if (!pageB) {
          pageB = this._createPage(templateName)
          pageB.id = id
          this.__idToPageMap.set(id, pageB)
        }

        // Set restamp option
        pageB.restamp = restamp || pageB.templateOptions.restamp

        // Set page var
        pageB.pageVar = data

        return pageB
      },

      createSegue: ({ pageA, pageB, initialRender }) => {
        const segueInfo = {
          elementA: pageA && pageA.element,
          elementB: pageB && pageB.element,
          idA: pageA && pageA.id,
          idB: pageB && pageB.id,
          templateNameA: pageA && pageA.templateOptions.name,
          templateNameB: pageB && pageB.templateOptions.name,
          dataA: pageA && pageA.pageVar,
          dataB: pageB && pageB.pageVar,
          initialRender
        }

        let segue
        if (typeof createSegue === 'function') {
          segue = createSegueFn(segueInfo)
        } else if (this.__createSegueFn) {
          segue = this.__createSegueFn(segueInfo)
        } else {
          console.warn(
            `<animated-pages>'s createSegue property has not been set`)
        }

        if (segue) {
          segue.elements = {
            elementA: pageA && pageA.element,
            elementB: pageB && pageB.element,
            animatedPages: this
          }
        }

        return segue
      },

      output: ({ pageA, pageB, started, canceled, animated, reverted }) => {
        // (Called afterwards, in particular it is guaranteed to be called before
        //  the start of any subsequent page change)

        if (reverted && pageA && pageB && pageA.id === pageB.id) {
          // Restore pageA in the __idToPageMap if it has the same id as pageB
          this.__idToPageMap.set(pageA.id, pageA)
        }

        // Get rid of the now hidden page if it has restamp true
        const hiddenPage = reverted ? pageB : pageA
        if (hiddenPage && hiddenPage.restamp) {
          this._deletePage(hiddenPage)
          this.__idToPageMap.delete(hiddenPage.id)
        }

        return { started, canceled, animated, reverted }
      }
    })
    this._setFinished(promise)
    return promise
  }

  __onSelectedChange (pageDefinition) {
    this._enqueuePageChange(pageDefinition)
  }

  _normalizePageDefinition (pageDefinition) {
    let templateName, id, restamp, data
    if (typeof pageDefinition === 'string') {
      templateName = pageDefinition
      id = templateName
      restamp = this.restamp
      data = undefined
    } else if (pageDefinition && typeof pageDefinition === 'object') {
      templateName = pageDefinition.templateName
      if (!templateName || typeof templateName !== 'string') {
        throw new
          Error('`templateName` in page definition must be a non-empty string')
      }
      id = pageDefinition.id || templateName
      if (typeof id !== 'string') {
        throw new Error('`id` in page definition must be a string or undefined')
      }
      restamp = pageDefinition.restamp
      if (typeof restamp !== 'boolean')  { restamp = this.restamp }
      data = pageDefinition.data
    } else {
      throw new Error('Page definition must be a string or an object')
    }
    return { templateName, id, restamp, data }
  }

  __functionFromPropertyValue (functionOrMethodName) {
    if (typeof functionOrMethodName === 'string') {
      const methodName = functionOrMethodName;
      const obj = this.__getMethodHost();
      return function() { return obj[methodName].apply(obj, arguments); };
    }
    return functionOrMethodName;
  }

  __onCreateSegueChange (createSegue) {
    this.__createSegueFn = this.__functionFromPropertyValue(createSegue)
  }

  __getMethodHost () { // From <dom-repeat> source
    return this.__dataHost._methodHost || this.__dataHost;
  }
}

customElements.define(AnimatedPages.is, AnimatedPages)
