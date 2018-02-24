/**
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
 */
