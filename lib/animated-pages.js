import { Element } from '../../@polymer/polymer/polymer-element.js'
import AnimatedPageSwitcher from './mixins/animated-page-switcher/animated-page-switcher.js'

class AnimatedPages extends AnimatedPageSwitcher(Element) {
  constructor () {
    super()
    this.__idToPageMap = new Map()
  }

  static get is () { return 'animated-pages' }

  static get properties () {
    return {
      selected: {
        type: Object,
        notify: true,
        observer: '__onSelectedChange'
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

  __onSelectedChange (pageDefinition) {
    const promise = this._enqueuePageChange(
      // Input callback
      ({ pageA, animated }) => {
        let pageB

        if (pageDefinition) {
          const { id, templateName, restamp, data } =
            this._normalizePageDefinition(pageDefinition)

          pageB = this.__idToPageMap.get(id)

          // Ensure correct page template
          if (pageB && pageB.templateName !== templateName) {
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
        }

        return { pageB }
      },

      // Output callback
      // (Called afterwards, in particular it is guaranteed to be called before
      //  the start of any subsequent page change)
      ({ pageA, pageB, started, canceled, animated, reverted }) => {
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
    )
    this._setFinished(promise)
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
}

customElements.define(AnimatedPages.is, AnimatedPages)
