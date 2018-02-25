import { dedupingMixin } from '../../../../@polymer/polymer/lib/utils/mixin.js'
import PageContainer from '../page-container/page-container.js'
import PageChangeQueue from './page-change-queue.js'
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
      this.__currentPage = undefined
      this.__pageChangeQueue = new PageChangeQueue()
      this.__pageChangeQueue.paused = true
      this.__pageChangeQueue.onStart = () => { this._setAnimating(true) }
      this.__pageChangeQueue.onStop = () => { this._setAnimating(false) }
      this.__initialRender = undefined
      this.__initialRenderRafId = undefined
    }

    static get properties () {
      return {
         /**
         * Disables animations. Intended mainly for use in tests.
         *
         * Side note: If the element is not visible (i.e. an anchestor has
         * `display: none` set), animations are disabled automatically without
         * setting this property.
         *
         * ```HTML
         * <animated-pages no-animations>
         *   ...
         * </animated-pages>
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

    connectedCallback () {
      super.connectedCallback()

      this.__initialRender = true
      this.__initialRenderRafId = requestAnimationFrame(() => {
        this.__initialRenderRafId = undefined
        this.__initialRender = false
      })

      this.__pageChangeQueue.paused = false
    }

    disconnectedCallback () {
      super.disconnectedCallback()

      this.__initialRender = false
      if (this.__initialRenderRafId) {
        cancelAnimationFrame(this.__initialRenderRafId)
      }

      this.__pageChangeQueue.paused = true
    }

    /**
     * Animates to the designated page. If no segue is currently playing,
     * the specified segue will start synchronously. Otherwise, the page
     * change will be queued up.
     * @param {*} callbacks
     * @param {*} callbacks.getPageB
     * @param {*} callbacks.createSegue
     * @param {*} callbacks.output
     * @returns {Promise} Promise that resolves to an object once the segue
     *   is over. If no segue is used or animations are disabled, the
     *   browser is guaranteed to not rerender the website until this promise
     *   is fulfilled. The object describes how the page change finished:
     *   - `started`: `true` if the page change happend. `false` if
     *     it was skipped, due to a different page change being enqueued before
     *     this one could start playing. If started is `false`, all other
     *     properties are `undefined`.
     *   - `pageA`, `pageB`: The pages involded in the page change. Both values
     *     are `undefined` if the page change was skipped (`started === false`).
     *   - `canceled`: `true` if the segue was canceled before it could
     *     finish naturally.
     *   - `animated`: `true` if an animated segue was played
     *   - `reverted`: `true` if the page change was reverted to the starting
     *     state. This property is independent of the `canceled` property and
     *     can even be `true` when `canceled` is `false` - this happens if an
     *     segue completes and but requests the page change to be reverted.
     */
    _enqueuePageChange (callbacks) {
      const {
        getPageB,
        createSegue = x => undefined,
        output = x => x
      } = callbacks

      if (!getPageB) { throw new Error('getPageB callback is required') }

      const firePageEvent = (page, eventName, detail) => {
        const prefix = this.constructor.is
        const event = new CustomEvent(prefix + '-page-' + eventName, { detail })
        page.element.dispatchEvent(event)
      }

      let pageA, pageB, segue

      return this.__pageChangeQueue.enqueue({
        start: async () => {
          pageA = this.__currentPage
          this.__currentPage = undefined

          try { pageB = getPageB() } catch (error) { console.error(error) }

          if (pageB) { pageB.show() }

          let animated = !this.noAnimations && isVisible(this)
          const initialRender = this.__initialRender

          if (animated) {
            try {
              segue = createSegue({ pageA, pageB, initialRender })
            } catch (error) { console.error(error) }
          }

          if (segue && (typeof segue.start !== 'function' ||
                        typeof segue.stop !== 'function')) {
            console.error('Animation must have a start() and a stop() method.')
            segue = undefined
          }

          if (pageA) { firePageEvent(pageA, 'will-leave', { initialRender }) }
          if (pageB) { firePageEvent(pageB, 'will-enter', { initialRender }) }

          if (segue) {
            try {
              return await segue.start()
            } catch (error) { console.error(error) }
          }
        },
        stop: (started, canceled, revert) => {
          let reverted, animated

          if (started) {
            if (segue) {
              animated = true
              if (segue.stop) {
                try {
                  segue.stop()
                } catch (error) { console.error(error) }
              }
            } else {
              animated = false
            }

            reverted = revert

            const hiddenPage = revert ? pageB : pageA
            const shownPage = revert ? pageA : pageB
            const initialRender = this.__initialRender

            if (revert) {
              if (hiddenPage) {
                firePageEvent(hiddenPage, 'will-leave', { initialRender })
              }
              if (shownPage) {
                firePageEvent(shownPage, 'will-enter', { initialRender })
              }
            }

            if (hiddenPage) {
              firePageEvent(hiddenPage, 'did-leave', { initialRender })
            }
            if (shownPage) {
              firePageEvent(shownPage, 'did-enter', { initialRender })
            }

            if (hiddenPage) { hiddenPage.hide() }
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
      this.__pageChangeQueue.cancelCurrent(revert)
    }

    /**
     * Removes the upcoming page change from the queue.
     */
    clearUpcomingPageChange () {
      this.__pageChangeQueue.clearUpcoming()
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
