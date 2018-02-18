class Segue {
  /**
   * Constructs a segue using the specified callbacks.
   *
   * @param {Object} callbacks
   * @param {{(utils: {assertNotStopped}) => Promise<{jumpTo: 'start'|'end'}|undefined>}} callbacks.start
   *   Called when the segue should start. This function should return a promise
   *   which resolves once the segue completes.
   * @param {{(started: boolean, canceled: boolean, jumpTo: 'start'|'end'|undefined) => any}} callbacks.stop
   *   This callback is called when the segue finishes naturally (i.e. the
   *   promise returned by its `start()` callback is fulfilled) or
   *   when the segue is canceled (i.e. it is currently running, but is stopped
   *   manually).
   */
  constructor (callbacks) {
    this.state = 'ready'
    this.promise = new Promise((a) => { this.__resolve = a })
    this.__callbacks = callbacks
    this.__assertNotStoppedFn = this.__assertNotStopped.bind(this)
  }

  start () {
    if (this.state !== 'ready') {
      throw new Error('Segue can only be started once')
    }
    this.state = 'running'

    const startCallback = this.__callbacks.start || async function () {}
    startCallback({ assertNotStopped: this.__assertNotStoppedFn })
      .catch((error) => {
        if (error !== 'WasStopped') { console.error(error) }
      })
      .then((result) => {
        if (this.state === 'running') {
          this.state = 'stopped'
          let ret
          try {
            const stopCallback = this.__callbacks.stop || async function () {}
            const jumpTo = (result && result.jumpTo) || 'end'
            ret = stopCallback(true, false, jumpTo)
          } catch (error) {
            console.error(error)
          }
          this.__resolve(ret)
          if (this.onStop) { this.onStop() }
        }
      })
  }

  /**
   * Stops the segue.
   * @param {'start'|'end'|undefined} jumpTo Indicates whether the
   *   segue should jump to its start or end state.
   */
  stop (jumpTo) {
    if (this.state !== 'stopped') {
      const started = this.state === 'running'
      jumpTo = started ? jumpTo || 'end' : 'end'
      this.state = 'stopped'
      let ret
      try {
        const stopCallback = this.__callbacks.stop || async function () {}
        ret = stopCallback(started, started, jumpTo)
      } catch (error) { console.error(error) }
      this.__resolve(ret)
      if (this.onStop) { this.onStop() }
    }
  }

  __assertNotStopped () {
    if (this.stopped) { throw 'WasStopped' }
  }
}

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
