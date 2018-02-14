import { dedupingMixin } from '../../../../@polymer/polymer/lib/utils/mixin.js'
import PageContainer from '../page-container/page-container.js'
import promisifiedCall from '../../utils/promisified-call.js'

const AnimatedPageSwitcher = dedupingMixin(SuperClass => {
  SuperClass = PageContainer(SuperClass)

  /**
   * @mixinClass
   * @polymer
   */
  class AnimatedPageSwitcher extends SuperClass {
    constructor () {
      super()
      this.__nextPageSegueFn = undefined
      this.__currentPage = undefined
    }

    static get properties () {
      return {
         /**
         * Disables animations. Intended for use in tests.
         *
         * Side note: If the element is not visible (i.e. via `display: none`),
         * animations are disabled automatically without setting this property.
         */
        disableAnimations: {
          type: Boolean,
          value: false,
          observer: '__onDisableAnimationsChange'
        },

        /**
         * Indicates whether an animation is currently playing or about to
         * start.
         */
        animating: {
          type: Boolean,
          value: false,
          readOnly: true,
          notify: true
        }
      }
    }

    /**
     * Animates to the designated page. If no animation is currently playing,
     * the animation will start synchronously. Otherwise, the segue will be
     * queued up.
     * @param {*} pageB
     * @param {*} callbacks
     */
    _animateToPage (pageB, callbacks = {}) {
      const pageSegueFn = async () => {
        this.animating = true
        const pageA = this.__currentPage
        this.__currentPage = undefined
        showPage(pageB)

        const animation = callbacks.createAnimation({
          initialRender: false // ToDo: Implement this
        })
        if (animation) {
          await promisifiedCall(animation.play.bind(animation))
            .catch((error) => { console.error(error) })
        }

        hidePage(pageA, callbacks.shouldRestampA())
        this.__currentPage = pageB

        if (this.__nextPageSegueFn) {
          const nextPageSegueFn = this.__nextPageSegueFn
          this.__nextPageSegueFn = undefined
          nextPageSegueFn()
        } else {
          this.animating = false
        }
      }

      if (this.animating) {
        this.__nextPageSegueFn = pageSegueFn
      } else {
        pageSegueFn()
      }
    }

    /**
     * Stops any animation that is currently running or about to start.
     * Use with caution: Canceled animations look jittery and not aesthetically
     * pleasing.
     */
    cancelAnimation () {
    }
  }

  return AnimatedPageSwitcher
})

function showPage (page) {
  if (!page) { return }
  if (!page.inserted) { page.insertBefore(null) }
  page.visible = true
}

function hidePage (page, restamp) {
  if (!page) { return }
  restamp = restamp || page.templateOptions.restamp
  if (restamp) { page.detach(restamp) } else { page.visible = false }
}

export default AnimatedPageSwitcher
