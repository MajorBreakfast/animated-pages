import Segue from './segue.js'

export default class SegueQueue {
  constructor () {
    this.__activeSegue = undefined
    this.__upcomingSegue = undefined
    this.running = false
  }

  enqueue (callbacks) {
    const segue = new Segue(callbacks)

    this.clearUpcoming()
    this.__upcomingSegue = segue

    this.__runNext()

    return segue.promise
  }

  __runNext () {
    if (this.__activeSegue) { return } // Already running

    if (this.__upcomingSegue) {
      if (!this.running) {
        this.running = true
        if (this.onStart) { this.onStart() }
      }

      this.__activeSegue = this.__upcomingSegue
      this.__upcomingSegue = undefined

      this.__activeSegue.onStop = () => {
        this.__activeSegue = undefined
        this.__runNext()
      }

      this.__activeSegue.start()
    } else {
      if (this.running) {
        this.running = false
        if (this.onStop) { this.onStop() }
      }
    }
  }

  clearUpcoming () {
    if (this.__upcomingSegue) {
      this.__upcomingSegue.stop() // Stop segue before start
      this.__upcomingSegue = undefined
    }
  }

  /**
   * Stops the current segue.
   * @param {'start'|'end'|undefined} jumpTo Indicates whether the
   *   segue should jump to its start or end state.
   */
  cancelCurrent (jumpTo = 'end') {
    if (this.__activeSegue) {
      const segue = this.__activeSegue
      this.__activeSegue = undefined
      segue.stop(jumpTo) // Leads to call of this.__runNext()
    }
  }
}
