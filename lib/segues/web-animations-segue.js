import animationFinished from '../utils/animation-finished.js'

export default class WebAnimationsSegue {
  /**
   * @param {*} options
   */
  constructor (options) {
    this.options = options || {}
  }

  configure (options) {
    return {
      keyframesA: undefined,
      keyframesB: undefined,
      keyframesAnimatedPages: undefined,
      optionsA: undefined,
      optionsB: undefined,
      optionsAnimatedPages: undefined,
    }
  }

  async start () {
    if (!HTMLElement.prototype.animate) { return } // No browser support :/

    const { elementA, elementB, animatedPages } = this.elements
    const config = this.configure(this.options)

    this.__animations = []

    if (elementA && config.keyframesA && config.optionsA) {
      const keyframes = config.keyframesA
      const options = config.optionsA
      this.__animations.push(elementA.animate(keyframes, options))
    }

    if (elementB && config.keyframesB && config.optionsB) {
      const keyframes = config.keyframesB
      const options = config.optionsB
      this.__animations.push(elementB.animate(keyframes, options))
    }

    if (config.keyframesAnimatedPages && config.optionsAnimatedPages) {
      const keyframes = config.keyframesAnimatedPages
      const options = config.optionsAnimatedPages
      this.__animations.push(animatedPages.animate(keyframes, options))
    }

    await allSettled(this.__animations.map(anim => animationFinished(anim)))
  }

  stop () {
    for (let anim of this.__animations) { anim.cancel() }
  }
}
