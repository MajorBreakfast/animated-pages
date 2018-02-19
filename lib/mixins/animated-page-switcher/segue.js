export default class Segue {
  /**
   * Constructs a segue using the specified callbacks.
   *
   * @param {Object} callbacks
   * @param {{(utils: {assertNotStopped}) => Promise<{jumpTo: 'start'|'end'}|undefined>}} callbacks.start
   *   Called when the segue should start. This function should return a promise
   *   which resolves once the segue completes.
   * @param {{(started: boolean, canceled: boolean, jumpTo: 'start'|'end'|undefined) => any}} callbacks.stop
   *   This callback is called when the segue finishes naturally (i.e. the
   *   promise returned by its `start()` callback is fulfilled), when the segue
   *   is canceled (i.e. it is currently running, but is stopped manually) or
   *   when the segue is skipped without ever starting it.
   */
  constructor (callbacks) {
    this.state = 'ready'
    this.promise = new Promise((a) => { this.__resolve = a })
    this.__callbacks = callbacks
    this.__assertNotStoppedFn = this.__assertNotStopped.bind(this)
    this.onStop = undefined
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
      this.state = 'stopped'
      let ret
      try {
        const stopCallback = this.__callbacks.stop || async function () {}
        jumpTo = started ? jumpTo || 'end' : 'end'
        ret = stopCallback(started, started, jumpTo)
      } catch (error) {
        console.error(error)
      }
      this.__resolve(ret)
      if (this.onStop) { this.onStop() }
    }
  }

  __assertNotStopped () {
    if (this.stopped) { throw 'WasStopped' }
  }
}
