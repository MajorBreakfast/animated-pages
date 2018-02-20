import Segue from './segue.js'

export default class SegueQueue {
  constructor () {
    this.__activeSegue = undefined
    this.__upcomingSegue = undefined
    this.running = false
    this.onStart = undefined
    this.onStop = undefined
  }

  /**
   * Enqueues a segue.
   *
   * @param {Object} callbacks
   * @param {{(utils: {assertNotStopped}) => Promise<{revert: boolean}|undefined>}} callbacks.start
   *   Called when the segue should start. This function should return a promise
   *   which resolves once the segue completes.
   * @param {{(started: boolean, canceled?: boolean, revert?: boolean) => any}} callbacks.stop
   *   This callback is called when the segue finishes naturally (i.e. the
   *   promise returned by its `start()` callback is fulfilled), when the segue
   *   is canceled (i.e. it is currently running, but is stopped manually) or
   *   when the segue is skipped without ever starting it.
   */
  enqueue (callbacks) {
    const segue = new Segue(callbacks)

    this.clearUpcoming()
    this.__upcomingSegue = segue

    this.__runUpcoming()

    return segue.promise
  }

  __runUpcoming () {
    if (this.__activeSegue) { return } // Already running, cannot run next now

    if (this.__upcomingSegue) {
      if (!this.running) {
        this.running = true
        if (this.onStart) { this.onStart() }
      }

      this.__activeSegue = this.__upcomingSegue
      this.__upcomingSegue = undefined

      this.__activeSegue.onStop = () => {
        this.__activeSegue = undefined
        this.__runUpcoming()
      }

      this.__activeSegue.start()
    } else {
      if (this.running) {
        this.running = false
        if (this.onStop) { this.onStop() }
      }
    }
  }

  /**
   * Removes the upcoming segue from the queue.
  */
  clearUpcoming () {
    if (this.__upcomingSegue) {
      this.__upcomingSegue.stop() // Stop segue before start
      this.__upcomingSegue = undefined
    }
  }

  /**
   * Stops the current segue. If there is an upcoming segue queued up, it will
   * start right away.
   * @param {boolean} revert Indicates whether the segue should jump to
   *   its start or end state.
   */
  cancelCurrent (revert) {
    if (this.__activeSegue) {
      const segue = this.__activeSegue
      this.__activeSegue = undefined
      segue.stop(revert) // Leads to call of this.__runUpcoming()
    }
  }
}