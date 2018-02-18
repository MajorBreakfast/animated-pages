import { dedupingMixin } from '../../../../@polymer/polymer/lib/utils/mixin.js'
import PageContainer from '../page-container/page-container.js'
import promisifiedCall from '../../utils/promisified-call.js'
import SegueQueue from '../../utils/segue-queue.js'

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
      this.__segueQueue = new SegueQueue()
      this.__segueQueue.onStart = () => { this._setAnimating(true) }
      this.__segueQueue.onStop = () => { this._setAnimating(false) }
    }

    static get properties () {
      return {
         /**
         * Disables animations. Intended for use in tests.
         *
         * Side note: If the element is not visible (i.e. via `display: none`),
         * animations are disabled automatically without setting this property.
         */
        // ToDo: Implement this
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
      const {
        createAnimation = () => undefined,
        shouldRestampA = () => false,
        shouldRestampB = () => false
      } = callbacks

      let animation, pageA

      return this.__segueQueue.enqueue({
        start: async ({ assertNotStopped }) => {
          pageA = this.__currentPage
          this.__currentPage = undefined
          showPage(pageB)

          const initialRender = false // ToDo: Implement this
          animation = createAnimation({ initialRender })
          if (animation && typeof animation.play !== 'function') {
            animation = undefined
            console.error('Animation needs to have a play() method.')
          }
          if (animation) {
            await promisifiedCall(() => animation.play())
              .catch((error) => { console.error(error) })
          }
        },
        stop: (started, canceled, jumpTo) => {
          if (started) {
            switch (jumpTo) {
              case 'end':
                hidePage(pageA, shouldRestampA())
                this.__currentPage = pageB
                break
              case 'start':
                hidePage(pageB, shouldRestampB())
                this.__currentPage = pageA
                break
            }
          }
          return {
            happened: started,
            animated: !!animation,
            animationCompleted: !!animation && !canceled
          }
        }
      })

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
