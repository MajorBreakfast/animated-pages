import PageChange from './page-change.js'

export default class PageChangeQueue {
  constructor () {
    this.__activePageChange = undefined
    this.__upcomingPageChange = undefined
    this.running = false
    this.onStart = undefined
    this.onStop = undefined
    this.__paused = false
  }

  /**
   * Enqueues a page change.
   *
   * @param {Object} callbacks
   * @param {{() => Promise<{revert: boolean}|undefined>}} callbacks.start
   *   Called when the page change should start. This function should return a promise
   *   which resolves once the page change completes.
   * @param {{(started: boolean, canceled?: boolean, revert?: boolean) => any}} callbacks.stop
   *   This callback is called when the page change finishes naturally (i.e. the
   *   promise returned by its `start()` callback is fulfilled), when the page
   *   change is canceled (i.e. it is currently running, but is stopped
   *   manually) or when the page change is skipped without ever getting
   *   started it.
   */
  enqueue (callbacks) {
    const pageChange = new PageChange(callbacks)

    this.clearUpcoming()
    this.__upcomingPageChange = pageChange

    this.__runUpcoming()

    return pageChange.promise
  }

  get paused () { return this.__paused }
  set paused (paused) {
    if (paused === this.__paused) { return }
    this.__paused = paused
    if (!paused) { this.__runUpcoming() }
  }

  __runUpcoming () {
    if (this.__activePageChange) { return } // Already running, cannot run next now
    if (this.__paused) { return }

    if (this.__upcomingPageChange) {
      if (!this.running) {
        this.running = true
        if (this.onStart) { this.onStart() }
      }

      this.__activePageChange = this.__upcomingPageChange
      this.__upcomingPageChange = undefined

      this.__activePageChange.onStop = () => {
        this.__activePageChange = undefined
        this.__runUpcoming()
      }

      this.__activePageChange.start()
    } else {
      if (this.running) {
        this.running = false
        if (this.onStop) { this.onStop() }
      }
    }
  }

  /**
   * Removes the upcoming page change from the queue.
  */
  clearUpcoming () {
    if (this.__upcomingPageChange) {
      this.__upcomingPageChange.stop() // Stop page change before start
      this.__upcomingPageChange = undefined
    }
  }

  /**
   * Stops the current page change. If there is an upcoming page change queued
   * up, it will start right away.
   * @param {boolean} revert Indicates whether the page change should jump to
   *   its start or end state.
   */
  cancelCurrent (revert) {
    if (this.__activePageChange) {
      const pageChange = this.__activePageChange
      this.__activePageChange = undefined
      pageChange.stop(revert) // Leads to call of this.__runUpcoming()
    }
  }
}
