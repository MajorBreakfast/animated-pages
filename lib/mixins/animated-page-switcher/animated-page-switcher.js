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
        disableAnimations: {
          type: Boolean,
          value: false,
          observer: '__onDisableAnimationsChange'
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
     * @param {*} pageB
     * @param {*} callbacks
     * @returns {Promise} Promise that resolves to an object once the animation
     *   is over. If no animation is used or animations are disabled, the
     *   browser is guaranteed to not rerender the website until this promise
     *   is fulfilled. The object describes how the page change finished:
     *   - `started`: `true` if the page change happend. `false` if
     *     it was skipped, due to a different page change being enqueued before
     *     this one could start playing.
     *   - `canceled`: `true` if the animation was canceled before it could
     *     finish naturally.
     *   - `animated`: `true` if an animation was played
     */
    _animateToPage (pageB, callbacks) {
      const {
        createAnimation = () => undefined,
        shouldRestampA = () => false,
        shouldRestampB = () => false
      } = callbacks || {}

      let animated = false
      let pageA

      return this.__segueQueue.enqueue({
        start: async ({ assertNotStopped }) => {
          pageA = this.__currentPage
          this.__currentPage = undefined
          if (pageB) { pageB.show() }

          const initialRender = false // ToDo: Implement this
          let animation
          if (!this.disableAnimations && isVisible(this)) {
            animation = createAnimation({ initialRender })
          }
          if (animation && typeof animation.play !== 'function') {
            animation = undefined
            console.error('Animation needs to have a play() method.')
          }
          if (animation) {
            animated = true
            await promisifiedCall(() => animation.play())
              .catch((error) => { console.error(error) })
          }
        },
        stop: (started, canceled, jumpTo) => {
          if (started) {
            switch (jumpTo) {
              case 'end':
                if (pageA) { pageA.hide() }
                this.__currentPage = pageB
                break
              case 'start':
                if (pageB) { pageB.hide() }
                this.__currentPage = pageA
                break
            }
          }
          return { pageA, pageB, started, canceled, animated }
        }
      })

      return promise
    }

    /**
     * Stops the page change animation that is currently running. If there
     * is another page change queued up, it will start right away.
     * Use with caution: Canceled animations look jittery and not aesthetically
     * pleasing.
     *
     * @param {'start'|'end'} jumpTo Indicates whether the page change should
     *   revert to its start state or jump to its end state.
     */
    cancelCurrentPageChange (jumpTo) {
      this.__segueQueue.cancelCurrent(jumpTo)
    }

    /**
     * Removes the upcoming page change from the queue.
     */
    clearUpcomingPageChange () {
      this.__segueQueue.clearUpcoming()
    }

    __onDisableAnimationsChange (value) {
      if (value === false) {
        this.cancelCurrentPageChange('end')
        // Note: The animation of the next page change will also not start
        //       because the `disableAnimations` property is `true`.
      }
    }
  }

  return AnimatedPageSwitcher
})

export default AnimatedPageSwitcher
