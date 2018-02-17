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
      this.__nextPageSegue = undefined
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
     * the animation will start synchronously. Otherwise, the page change will
     * be queued up.
     * @param {*} pageB
     * @param {*} callbacks
     * @returns {Promise} Promise that resolves to an object once the animation
     *   is over. The object describes how the page change finished:
     *   - `happened`: `true` if the page change happend. `false` if
     *     it was skipped, due to a different page change being enqueued before
     *     this one could start playing.
     *   - `animated`: `true` if an animation was played
     *   - `animationCompleted`: `true` if the animation completed from start
     *     to finish
     */
    _animateToPage (pageB, callbacks) {
      const ret = {
        happened: false,
        animated: false,
        animationCompleted: false
      }

      let resolve
      const promise = new Promise((a) => { resolve = a })

      const pageSegue = {
        start: async () => {
          const {
            createAnimation = () => undefined,
            shouldRestampA = () => false
          } = callbacks

          ret.happened = true
          this.animating = true
          const pageA = this.__currentPage
          this.__currentPage = undefined
          showPage(pageB)

          const initialRender = false // ToDo: Implement this
          const animation = createAnimation({ initialRender })
          if (animation) {
            if (typeof animation.play === 'function') {
              ret.animated = true
              await promisifiedCall(animation.play.bind(animation))
                .catch((error) => { console.error(error) })
              ret.animationCompleted = true // ToDo: Canceled animations
            } else {
              console.error('Animation needs to have a play() method.')
            }
          }
          hidePage(pageA, shouldRestampA())
          this.__currentPage = pageB

          if (this.__nextPageSegue) {
            // Start queued page change
            const nextPageSegue = this.__nextPageSegue
            this.__nextPageSegue = undefined
            nextPageSegue.start()
          } else {
            // Nothing queued
            this.animating = false
          }

          resolve(ret)
        },
        abort: () => {
          resolve(ret)
        }
      }

      if (this.animating) {
        if (this.__nextPageSegue) {
          this.__nextPageSegue.abort()
        }
        this.__nextPageSegue = pageSegue
      } else {
        pageSegue.start()
      }

      return promise
    }

    /**
     * Stops any animation that is currently running or about to start.
     * Use with caution: Canceled animations look jittery and not aesthetically
     * pleasing.
     */
    cancelAnimation () {
    }

    __onDisableAnimationsChange (value) {
      if (value === false && this.isAnimating) {
        this.cancelAnimation()
      }
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
