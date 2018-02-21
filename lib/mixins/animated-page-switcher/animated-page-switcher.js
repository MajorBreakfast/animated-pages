import { dedupingMixin } from '../../../../@polymer/polymer/lib/utils/mixin.js'
import PageContainer from '../page-container/page-container.js'
import SegueQueue from './segue-queue.js'
import promisifiedCall from '../../utils/promisified-call.js'
import isVisible from '../../utils/is-visible.js'

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
        noAnimations: {
          type: Boolean,
          value: false,
          observer: '__onNoAnimationsChange'
        },

        /**
         * Indicates whether an animation is currently playing or about to
         * start.
         * If animations are disabled, this property still changes briefly to
         * `true` during page changes. The browser is, however, guaranteed to
         * not rerender the website during that time.
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
     * @param {*} callbacks
     * @param {*} callbacks.getPageB
     * @param {*} callbacks.createAnimation
     * @param {*} callbacks.output
     * @returns {Promise} Promise that resolves to an object once the animation
     *   is over. If no animation is used or animations are disabled, the
     *   browser is guaranteed to not rerender the website until this promise
     *   is fulfilled. The object describes how the page change finished:
     *   - `started`: `true` if the page change happend. `false` if
     *     it was skipped, due to a different page change being enqueued before
     *     this one could start playing. If started is `false`, all other
     *     properties are `undefined`.
     *   - `pageA`, `pageB`: The pages involded in the page change. Both values
     *     are `undefined` if the page change was skipped (`started === false`).
     *   - `canceled`: `true` if the animation was canceled before it could
     *     finish naturally.
     *   - `animated`: `true` if an animation was played
     *   - `reverted`: `true` if the page change was reverted to the starting
     *     state. This property is independent of the `canceled` property and
     *     can even be `true` when `canceled` is `false` - this happens if an
     *     animation completes and but requests the page change to be reverted.
     */
    _enqueuePageChange (callbacks) {
      const {
        getPageB,
        createAnimation = x => undefined,
        output = x => x
      } = callbacks

      if (!getPageB) { throw new Error('getPageB callback is required') }

      let pageA, pageB, animation

      return this.__segueQueue.enqueue({
        start: async ({ assertNotStopped }) => {
          pageA = this.__currentPage
          this.__currentPage = undefined

          try { pageB = getPageB() } catch (error) { console.error(error) }

          if (pageB) { pageB.show() }

          const initialRender = false // ToDo: Implement this

          let animated = !this.noAnimations && isVisible(this)

          if (animated) {
            try {
              animation = createAnimation({ pageA, pageB })
            } catch (error) { console.error(error) }
          }

          if (animation && (typeof animation.start !== 'function' ||
                            typeof animation.stop !== 'function')) {
            console.error('Animation must have a start() and a stop() method.')
            animation = undefined
          }

          if (animation) {
            return await promisifiedCall(animation.start.bind(animation))
              .catch((error) => { console.error(error) })
          }
        },
        stop: (started, canceled, revert) => {
          let reverted, animated

          if (started) {
            if (animation) {
              animated = true
              if (animation.stop) {
                try {
                  animation.stop(canceled, revert)
                } catch (error) { console.error(error) }
              }
            } else {
              animated = false
            }

            reverted = revert

            const hiddenPage = revert ? pageB : pageA
            if (hiddenPage) { hiddenPage.hide() }

            const shownPage = revert ? pageA : pageB
            this.__currentPage = shownPage
          } else {
            pageA = undefined
            pageB = undefined
            animated = undefined
            reverted = undefined
          }

          return output({
            started,
            pageA, pageB,
            canceled, animated, reverted
          })
        }
      })
    }

    /**
     * Stops the page change animation that is currently running. If there
     * is another page change queued up, it will start right away.
     * Use with caution: Canceled animations look jittery and not aesthetically
     * pleasing.
     *
     * @param {boolean} revert Indicates whether the page change should
     *   revert to its starting state or jump to its end state.
     */
    cancelCurrentPageChange (revert) {
      this.__segueQueue.cancelCurrent(revert)
    }

    /**
     * Removes the upcoming page change from the queue.
     */
    clearUpcomingPageChange () {
      this.__segueQueue.clearUpcoming()
    }

    __onNoAnimationsChange (value) {
      if (value === false) {
        this.cancelCurrentPageChange(false)
        // Note: The animation of the next page change will also not start
        //       because the `noAnimations` property is `true`.
      }
    }
  }

  return AnimatedPageSwitcher
})

export default AnimatedPageSwitcher
