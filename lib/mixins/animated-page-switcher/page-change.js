export default class PageChange {
  /**
   * Constructs a `PageChange` using the specified callbacks.
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
  constructor (callbacks) {
    this.state = 'ready'
    this.promise = new Promise((a) => { this.__resolve = a })
    this.__callbacks = callbacks
    this.onStop = undefined
  }

  start () {
    if (this.state !== 'ready') {
      throw new Error('PageChange can only be started once')
    }
    this.state = 'running'

    const startCallback = this.__callbacks.start || async function () {}
    startCallback()
      .catch((error) => {
        if (error !== 'WasStopped') { console.error(error) }
      })
      .then((result) => {
        if (this.state === 'running') {
          this.state = 'stopped'
          let ret
          try {
            const stopCallback = this.__callbacks.stop || async function () {}
            const revert = (result && result.revert) || false
            ret = stopCallback(true, false, revert)
          } catch (error) {
            console.error(error)
          }
          this.__resolve(ret)
          if (this.onStop) { this.onStop() }
        }
      })
  }

  /**
   * Stops the PageChange.
   * @param {boolean|undefined} revert Indicates whether the page change should
   *   revert to its starting state
   */
  stop (revert) {
    if (this.state !== 'stopped') {
      const started = this.state === 'running'
      this.state = 'stopped'
      let ret
      try {
        const stopCallback = this.__callbacks.stop || async function () {}
        revert = started ? (revert || false) : undefined
        const canceled = started ? true : undefined
        ret = stopCallback(started, canceled, revert)
      } catch (error) {
        console.error(error)
      }
      this.__resolve(ret)
      if (this.onStop) { this.onStop() }
    }
  }
}
