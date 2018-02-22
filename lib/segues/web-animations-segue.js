import animationFinished from '../utils/animation-finished.js'

export default class WebAnimationsSegue {
  /**
   * @param {*} options
   * @param {*} options.elementA
   * @param {*} options.elementB
   * @param {*} options.duration
   */
  constructor (options) {
    this.options = options
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

    const { duration = config.duration } = this.options
    const { elementA, elementB, animatedPages } = this.elements

    this.__animations = []

    // Note: Use `fill: forwards` everywhere to avoid flickering

    if (elementA) {
      const options = { duration, fill: 'forwards' }
      Object.assign(options, config.optionsA)
      this.__animations.push(elementA.animate(config.keyframesA, options))
    }

    if (elementB) {
      const options = { duration, fill: 'forwards' }
      Object.assign(options, config.optionsB)
      this.__animations.push(elementB.animate(config.keyframesB, options))
    }

    {
      const options = { duration, fill: 'forwards' }
      Object.assign(options, config.optionsAnimatedPages)
      const keyframes = config.keyframesAnimatedPages
      this.__animations.push(animatedPages.animate(keyframes, options))
    }

    await Promise.race(this.__animations.map(anim => animationFinished(anim)))
  }

  stop (canceled) {
    for (let anim of this.__animations) { anim.cancel() }

    const { elementA, elementB } = this.options
    const config = this.constructor.config
  }
}
