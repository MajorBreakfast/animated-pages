import animationFinished from '../utils/animation-finished.js'

export default class WebAnimationsSegue {
  /**
   * @param {*} options
   * @param {*} options.elementA
   * @param {*} options.elementB
   * @param {*} options.duration
   */
  constructor (options) {
    this._options = options
  }

  static get config () {
    return {
      keyframesA: undefined,
      keyframesB: undefined,
      optionsA: undefined,
      optionsB: undefined,
      duration: undefined
    }
  }

  async start () {
    if (!HTMLElement.prototype.animate) { return } // No browser support :/

    const config = this.constructor.config

    const {
      elementA,
      elementB,
      duration = config.duration
    } = this._options

    this.__animations = []

    if (elementA) {
      const options = Object.assign({ duration }, config.optionsA)
      this.__animations.push(elementA.animate(config.keyframesA, options))
    }

    if (elementB) {
      const options = Object.assign({ duration }, config.optionsB)
      this.__animations.push(elementB.animate(config.keyframesB, options))
    }

    await Promise.all(this.__animations.map(anim => animationFinished(anim)))
  }

  stop (canceled) {
    if (canceled) { for (let anim of this.__animations) { anim.cancel() } }

    const { elementA, elementB } = this._options
    const config = this.constructor.config
  }
}
