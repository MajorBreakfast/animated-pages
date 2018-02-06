import { Element } from '../../@polymer/polymer/polymer-element.js'
import mod from './utils/mod.js'
import isVisible from './utils/is-visible.js'

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
 * <animated-pages selected-id="{{_selectedPage}}"
 *                 define-animation="_defineAnimation">
 *   <template name="page1"><x-page1></x-page1></template>
 *   <template name="page2"><x-page2></x-page2></template>
 * </animated-pages>
 * ```
 *
 * Here the `selectedId` property has beend bound to the `_selectedPage`
 * property on the host element. Whenever the value of this property changes,
 * the page with the respective id is animated in. For example, setting it to
 * `'page1'` will make page 1 appear. (The `_` is just a convention; it means
 * that the `_selectedPage` property is protected, that means it should not be
 * called from outside of the element class)
 *
 * A nice detail about the animation: If the property is changed while an
 * animation is already playing, a new animation will begin after the current
 * animation has finished playing. If the property is changed multiple times
 * until this animation starts, the `<animated-pages>` element will directly
 * animate to the most recent value; any intermediary values will be
 * disregarded.
 *
 * Each page is defined through a named template. The template has to contain
 * exactly one element at the top level. The name of the template is defined
 * by setting the `name` attribute on it.
 *
 * The animation is configured through a function. The `defineAnimation`
 * property is set to the name of the method on the host element that
 * shall be called. In the above example this function is called
 * `_defineAnimation()`:
 *
 * ```JS
 * import SwapAnimation from 'animated-pages/animations/swap-animation.js'
 * // ...
 * class MyElement extends Element {
 *   // ...
 *   _defineAnimation ({ elementA, elementB }) {
 *     return new SwapAnimation({ elementA, elementB, duration: 300 })
 *   }
 * ```
 *
 * Here, the `SwapAnimation` that ships as one of the built-in animations
 * included in the `animated-pages` package is used to smoothly transition
 * between the two elements.
 *
 * `elementA` and `elementB` are the two DOM elements involved in the
 * animation. Each property value is `undefined` if the the respective page
 * does not exist. This happens if the animation only involves a single page and
 * there is nothing to animate to or from.
 *
 * The object that is passed into the `defineAnimation()` function has
 * additional properties besides `elementA` and `elementB` which were not used
 * in the example above. It is, for example, possible to set up different
 * animations for different page combinations. You can learn more about these
 * in the description of the `defineAnimation` property.
 *
 * ## CSS Animations
 * It is possible to define animations using CSS. The `classAnimation`
 * sets a class on each element which can then in turn be used to play a
 * CSS animation.
 *
 * ```CSS
 * .fade-in { animation: fade-in 300ms forwards; }
 * .fade-out { animation: fade-in 300ms forwards reverse; }
 * @keyframes fade-in {
 *   0% { opacity: 0; }
 *   100% { opacity: 1; }
 * }
 * ```
 *
 * ```JS
 * import ClassAnimation from 'animated-pages/animations/class-animation.js'
 * // ...
 * _defineAnimation ({ elementA, elementB }) {
 *   return new ClassAnimation({
 *     elementA, classA: 'fade-out',
 *     elementB, classB: 'fade-in',
 *     duration: 300
 *   })
 * }
 * ```
 *
 * The `duration` property specified in the function call should match the
 * animation duration specified in CSS. It determines how long the CSS classes
 * remain set on the elements.
 *
 * ## Events
 * Each page element gets notified through various events:
 * - `animated-pages-page-will-enter`: At the beginning of the page enter
 *   animation
 * - `animated-pages-page-did-enter`: At the end of the page enter animation
 * - `animated-pages-page-will-leave`: At the beginning of the page leave
 *   animation
 * - `animated-pages-page-did-leave`: At the end of the page leave animation
 *
 * These events can be used to trigger animations, to (re-)load data from a
 * server or for analytics.
 *
 * ```JS
 * ready () {
 *   super.ready()
 *   this.addEventListener(`animated-pages-page-will-enter`, this._willEnter)
 * }
 *
 * _willEnter () {
 *   this._playStylishEnterAnimation()
 *   this._refreshData()
 * }
 * ```
 *
 * ## Element lifetime
 * A template gets instantiated right before the element contained within is
 * needed. By default elements of pages that are no longer visible stay in the
 * DOM with their `hidden` attribute set. Thus, because the same elements is
 * reused when the page becomes visible again later, scroll positions and other
 * ephemeral state is retained.
 * If this is not desired, the `restamp` attribute can be set on the template.
 * When this option is set, the element is removed from the DOM immediately
 * after it is no longer visible and a fresh instance is created when it becomes
 * visible again.
 *
 * ```HTML
 * <animated-pages selepage-id="{{_selectedPage}}"
 *                 define-animation="_defineAnimation">
 *   <template name="page1">
 *     <div>Stays hidden in the DOM after it animates away</div>
 *   </template>
 *   <template name="page2" restamp>
 *     <div>Removed after it animates away</div>
 *   </template>
 * </animated-pages>
 * ```
 *
 * The next section will introduce the `pages` array. Each page's element will
 * be removed from the DOM after its page is removed from this array. If the
 * page is visible when this happens, it animates out first and is removed after
 * the exit animation has finished playing. If the page is already invisible,
 * its element is removed immediately from the DOM (if the element exists).
 *
 * ## Multiple pages with the same template
 * Up until now each template corresponded to exactly one page and vice versa.
 * A single template can, however, be used for more than one page. It is also
 * possible to feed different data into the template depending on the page.
 * All this can be configured through the `pages` property.
 *
 * In the following example the same `'product'` page template is used for
 * multiple product pages:
 * ```HTML
 * <animated-pages pages="{{_pages}}"
 *                 selected-id="{{_selectedPage}}"
 *                 define-animation="_defineAnimation"
 *   <template name="product">
 *     <x-product-page product="[[data.product]]"></x-product-page>
 *   </template>
 * </animated-pages>
 * ```
 *
 * ```JS
 * this._pages = [
 *   { id: 'product1', templateName: 'product', data: { product: product1 } },
 *   { id: 'product2', templateName: 'product', data: { product: product2 } },
 *   // ...
 * ]
 * this._selectedPage = 'product1'
 * ```
 *
 * In the above code each page's element will stay in the DOM after it becomes
 * invisible. If that is not desired, the `restamp` attribute can be set on the
 * `<tempalte>`. Alternatively, `restamp` can also be set on a per page basis:
 *
 * ```JS
 * { id: 'product1', templateName: 'product', restamp: true, ... }
 * ```
 *
 * That said, the code above is impractical for an online store, because
 * defining a product page for each and every product beforehand doesn't
 * make sense. Instead it could be done like this:
 *
 * ```HTML
 * <animated-pages pages="{{_pages}}"
 *                 default-index="0"
 *                 define-animation="_defineAnimation"
 *   <template name="product">
 *     <x-product-page product="[[data.product]]"></x-product-page>
 *   </template>
 * </animated-pages>
 * ```
 *
 * ```JS
 * _showProduct (product) {
 *   // Replace product page
 *   this._pages = [{ templateName: 'product', data: { product: product1 } }]
 * }
 * ```
 *
 * In the code above, whenever a new product needs to be shown, the
 * `_showProduct` function replaces the `pages` array. The removal of the
 * current page from the array would usually mean that it becomes `undefined`,
 * but because `defaultIndex` was set to `0` the new page is slected
 * automatically. This causes the element of the new page to animate in and
 * the old element to animate out. After the animation the old element is
 * removed from the DOM.
 *
 * Note: Using this strategy, wouldn't matter whether `restamp` is set or not.
 * Because we're removing the page from the `pages` array, the outcome, i.e.
 * the removal of the element, is the same.
 *
 * ## Variable inside the template
 * - `page.id`
 * - `page.index`
 * - `page.data`
 *
 * ### Rename variable
 * ```HTML
 * <animated-pages pages="{{pages}}"
 *                 define-animation="_defineAnimation">
 *   <template name="page-with-default-var-name">
 *     <x-product product="[[page.data]]"></x-product>
 *   </template>
 *   <template name="page-with-renamed-var" page-as="info">
 *     <x-product product="[[info.data]]"></x-product>
 *   </template>
 * </animated-pages>
 * ```
 *
 * ## Navigation stack mode
 * It is quite frequent that the pages of an web app form a hierarchical order.
 * For example, something like this: `category` > `subcategory` > `product`.
 *
 * ```HTML
 * <animated-pages stack-mode
 *                 pages="{{pages}}"
 *                 define-animation="_defineAnimation">
 *   <template name="overview">
 *     <x-overview-page></x-overview-page>
 *   </template>
 *   <template name="product">
 *     <x-product-page product="[[page.data]]"></x-product-page>
 *   </template>
 * </animated-pages>
 * ```
 *
 * ```JS
 * this.pages = [
 *   'overview',
 *   { id: 'product1', templateName: 'product', data: product1 },
 *   { id: 'product2', templateName: 'product', data: product2 }
 * ]
 * ```
 *
 * ```JS
 * import SwapAnimation from 'animated-pages/animations/swap-animation.js'
 * import { PushAnimation, PopAnimation } from 'animated-pages/animations/stack-animations.js'
 *
 * _defineAnimation ({ elementA, elementB, isInitialRender, hint }) {
 *   if (isInitialRender) { return }
 *   if (hint === 'push') { return new PushAnimation({ elementA, elementB }) }
 *   if (hint === 'pop') { return new PopAnimation({ elementA, elementB }) }
 *   return new SwapAnimation(elementA, elementB)
 * }
 * ```
 *
 *
 * ## Using a `<slot>`
 * `<animated-pages>` also searches for templates in slots:
 *
 * ```HTML
 * <animated-pages>
 *   <slot></slot>
 * </animated-pages>
 * ```
 *
 * @customElement
 * @summary Custom element for animations between elements.
 */
class AnimatedPages extends Element {
  static get is () { return 'animated-pages' }

  static get properties () {
    return {
      /**
       * The pages array determines what pages can be shown in the
       * `<animated-pages>` component. Which exact page from this array is
       * currently visible is determined by the `selectedId` and
       * `selectedIndex` properties.
       *
       * Each page is described by a plain JavaScript object of the following
       * format:
       * ```TS
       * type PageDefinition = {
       *   id?: any,
       *   templateName: string,
       *   restamp?: boolean,
       *   data?: Object
       * }
       * - `id`: The id of the page. This is usually a string. An id is only
       *   needed if you plan to refer to the page by id. The `id` of a page
       *   must be unique to all other pages that currenty exist in the array
       *   and cannot be changed later on.
       * - `templateName`: The name of the template that shall be used for the
       *   page. The `templateName` property cannot be changed later on.
       * - `restamp`: If set to `true`, the DOM element of the page is
       *   immediately removed from the DOM as soon as the page becomes
       *   invisible and a new element will be created once the page becomes
       *   visible again. If set to `false` the element stays in the DOM with
       *   its hidden attributed set. In any case the DOM element is removed
       *   when the page is removed from the `pages` array. The `restamp`
       *   property defaults to `true` or `false` depending on whether the
       *   template used by the page has the `restamp` attribute set or not
       *   respectively. The `restamp` propery may not be changed later on.
       * - `data`: The data that shall be passed into the page. The `data`
       *   property's value becomes available as the `data` variable inside
       *   the template of the page. It may be changed and any modifications to
       *   it will be propagated to and from the page template instance.
       *
       * Changes to the array assigned to the `pages` property can trigger
       * various actions:
       * - If the array is modified in front of the currently selected page,
       *   the `selectedIndex` property is updated accordingly to point to the
       *   new position of the page in the array.
       * - If the currently selected page is removed from the array and the
       *   `selectNearestPageOnRemoval` property is enabled, the nearest page
       *   will be selected next. Otherwise, `selectDefault()` is called.
       * - If no page is currently selected `selectDefault()` is called.
       */
      pages: {
        type: Array
      },

      /**
       * The `selectedIndex` defines which item of the `pages` array is
       * the currently visible page by selecting a page using its index in the
       * `pages` array. This property may also be set to `undefined` to select
       * no page. If it is set to an invalid index, `selectDefault()` is
       * called. If the value of this property is changed, the old page
       * animates out and the new page with the chosen index animates in. The
       * value of this property is updated accordingly when the `pages` array
       * or the `selectedId` property is modified. This property cannot be
       * set when in `<animated-pages>` is in stack mode. In stack mode the
       * selected page is always the last item in the `pages` array.
       */
      seletedIndex: {
        type: Number,
        notify: true,
        observer: '__onSelectedIndexChange'
      },

      /**
       * The `selectedId` defines which item of the `pages` array is
       * the currently visible page by selecting a page using its id. This
       * property may also be set to `undefined` to select no page. If it is
       * set to an id, but no corresponding page exists, `selectDefault()` is
       * called. Whenever the value of this property is changed, the old page
       * animates out and the new page with the chosen id animates in. The
       * value of this property is updated accordingly when the `pages` array
       * or the `selectedIndex` property is modified. This property cannot
       * be set when in `<animated-pages>` is in stack mode.
       */
      seletedId: {
        observer: '__onSelectedIdChange'
      },

      /**
       * This property is used to set up the animation between pages. The value
       * can either be a function or a string. If it is a string, the method
       * with the specified name on the host element is called.
       *
       * The function is passed-in the following options:
       * ```TS
       * type AnimationOptions = {
       *   elementA: HTMLElement, elementB: HTMLElement
       *   idA: any, idB: any,
       *   indexA: number, indexB: number,
       *   templateNameA: string, templateNameB: string,
       *   dataA: any, dataB: any
       *   hint: any,
       *   isInitialRender: boolean
       * }
       * ```
       * - `id{A,B}`, `index{A,B}`, `templateName{A,B}` and `data{A,B}` are the
       *   id, index, template name and data of the two pages. "A" refers to the
       *   old page that animates out, and "B" to the new page that animates in.
       *   The values for either page can be `undefined` when the animation only
       *   involves a single page, i.e. there is nothing to animate to or from.
       * - `hint` can contain an animation hint so that an appropriate
       *   animation can be chosen. If the `<animated-pages>` element is used
       *   in `stack` mode, the hint is either `'push'`, `'pop'` or
       *   `'exchange'`, depending on how the `pages` array was modified.
       * - The `initalRender` boolean can be used to detect when the
       *   `<animated-pages>` component is rendered for the first time.
       *   Playing no animation on the initial render can lead to a better
       *   user experience in some scenarios, for example when the
       *   `<animated-pages>` elements sits inside another element that is
       *   animated in at the same time.
       *
       * The return value can be either `undefined` or an animation.
       * An animation is an object of the following format:
       * ```TS
       * interface Animation {
       *   play: ((done: () => void) => void) | (() => Promise<undefined>)
       *   cancel: () => void,
       *   domOrder: 'a then b' | 'b then a'
       * }
       * ```
       * - The `play()` method is called when the animation should begin
       *   playing. To signify when the animation has finished playing, the
       *   method has to either return a promise or call the passed-in
       *   `done()` callback.
       * - The `cancel()` method is called when the animation should be
       *   canceled. This function is the last time the animation is allowed to
       *   modify the elements it is animating. Afterwards, it may no longer do
       *   so. This means that it has to cancel any timeouts or other operations
       *   that were started in the `play()` method.
       * - `domOrder`: For some animations it matters which element comes
       *   first in the DOM. This property specifies whether the element of the
       *   old page ("a") should come before the new page ("b") or the other way
       *   around.
       */
      defineAnimation: {
        type: Function,
        observer: '__onDefineAnimationChange'
      },

      /**
       * This property is used by the `selectDefault()` method to select the
       * page whose id matches the value of this property.
       */
      defaultId: {},

      /**
       * This property is used by the `selectDefault()` method to select the
       * page whose index in the `pages` array matches the value of this
       * property.
       */
      defaultIndex: {
        type: Number
      },

      /**
       * This property defines what happens when the page that is currently
       * selected is removed from the `pages` array. If this property is
       * enabled, the nearest page will be selected next. If it is not enabled,
       * `selectDefault()` will be called.
       */
      selectNearestPageOnRemoval: {
        type: Boolean,
        value: false
      },

      /**
       * Changes the behavior of the `previous()` and `next()` methods. If
       * `wrapAround` is enabled, the index wraps around: That is, if the first
       * page is selected and `previous()` is called, it will select the last
       * page and vice versa for the last page and `next()`.
       */
      wrapAround: {
        type: Boolean,
        value: false
      },

      /**
       * This property enables stack mode. `<animated-pages>` in stack mode
       * behaves differently that usual:
       * - The **selected page is always the last page** in the `pages` array.
       * - The animation `hint` passed into `defineAnimation()` has either
       *   the value `push`, `pop` or `exchange` depending on how the array
       *   was modified.
       * - Setting/calling the following properties/methods has no effect:
       *   - `selectedIndex`, `selectedId`
       *   - `defaultIndex`, `defaultId`
       *   - `selectNearestPageOnRemoval`
       *   - `wrapAround`
       *   - `next()`, `previous()`
       *   - `selectIndex()`, `selectId()`, `selectDefault()`
       */
      stackMode: {
        type: Boolean,
        value: false
      },

      /**
       * Disables the animations. Intended for use in tests.
       *
       * Side note: `<animated-pages>` automatically plays no animations if it
       * is not visible (for example when it or its parent has `display: none`
       * set).
       */
      disableAnimations: {
        type: Boolean,
        value: false,
        observer: '__onDisableAnimationsChange'
      },

      /**
       * `true` if an animation is currently playing or about to start, because
       * the selected page was changed.
       */
      isAnimating: {
        type: Boolean,
        value: false,
        readOnly: true,
        notify: true
      }
    }
  }

  static get observers () {
    return ['_onPagesAddedOrRemoved(pages.splices)']
  }

  _onPagesAddedOrRemoved (changeRecord) {
    if (changeRecord) {
      let pushedCount = 0
      let poppedCount = 0

      for (let indexSplice of changeRecord.indexSplices) {
        const index = indexSplice.index
        const removedCount = indexSplice.removed.length
        const addedCount = indexSplice.addedCount
        const added = indexSplice.object.slice(index, index + addedCount)
          .map(x => `element(${JSON.stringify(x)})`)
        this.splice('_elements', index, removedCount, ...added)
      }

      console.log(pushedCount, poppedCount)
    }
  }

  _toJSON (obj) {
    return JSON.stringify(obj)
  }

  /**
   * Switches to the next page by incrementing the page index. Does nothing
   * if no page is selected. If the currently selected page is the last page,
   * it also does nothing by default, although if `wrapAround` is set to true,
   * the index wraps around and the first page is selected.
   */
  next () {
    const currentIndex = this.selectedIndex
    if (typeof currentIndex === 'number') {
      this.selectedIndex = mod(currentIndex + 1, this.pages.length)
    }
  }

  /**
   * Switches to the previous page by decrementing the page index. Does nothing
   * if no page is selected. If the currently selected page is the first page,
   * it also does nothing by default, although if `wrapAround` is set to true,
   * the index wraps around and the last page is selected.
   */
  previous () {
    const currentIndex = this.selectedIndex
    if (typeof currentIndex === 'number') {
      this.selectedIndex = mod(currentIndex - 1, this.pages.length)
    }
  }

  /**
   * Sets the `selectedIndex` property to the specified value. Alternatively,
   * you can set the property directly.
   */
  selectIndex (index) { this.selectedIndex = index }

  /**
   * Sets the `selectedId` property to the specified value. Alternatively,
   * you can set the property directly.
   */
  selectId (id) { this.selectedId = id }

  /**
   * Selects the default page:
   * - If the `defaultId` property is set, the page whose id matches
   *   the property value is selected. If no such page page exists,
   *   the selected page is set to `undefined`.
   * - Else, if the `defaultIndex` property is set, the page with the
   *   corresponding index is selected. If no page with the specified index
   *   exists, the selected page is set to `undefined`.
   * - Else, the selected page is set to `undefined`.
   *
   * This function is called automatically by <animated-pages> when the current
   * page is removed from the `pages` array or when `selectedId` or
   * `selectedIndex` are set to invalid values.
   */
  selectDefault (nearestIndex) {}

  /**
   * Makes the selected page immediately fully visible and stops any animation
   * that is currently running or about to start. Use with caution: Canceled
   * animations don't look aesthetically pleasing.
   */
  cancelAnimation () {}

  __onSelectedIndexChange (index) {

  }

  __onSelectedIdChange (id) {

  }

  __onDefineAnimationChange (fn) {
    if (typeof fn === 'string') {
      const methodName = fn, obj = /** object */ this.__getMethodHost()
      fn = function () { return obj[methodName].apply(obj, arguments) }
    }
    this.__defineAnimationFn = fn
  }

  __onDisableAnimationsChange (value) {
    if (value === false && this.isAnimating) {
      this.cancelAnimation()
    }
  }

  __getMethodHost () { // From <dom-repeat> source
    return this.__dataHost._methodHost || this.__dataHost;
  }
}

customElements.define(AnimatedPages.is, AnimatedPages)
