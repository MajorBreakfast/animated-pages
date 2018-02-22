import animationFinished from '../utils/animation-finished.js'

export default class FadeAnimation {
  /**
   * @param {*} options
   * @param {*} options.elementA
   * @param {*} options.elementB
   * @param {*} options.duration
   */
  constructor (options) {
    this._options = options
  }

  async start () {
    if (!HTMLElement.prototype.animate) { return } // No browser support :/

    const {
      elementA,
      elementB,
      duration = 300
    } = this._options

    this.__animations = []
    if (elementA) {
      const animationA = elementA.animate([
        {'opacity': '1'},
        {'opacity': '0'}
      ], { duration })
      this.__animations.push(animationA)
    }

    if (elementB) {
      const animationB = elementB.animate([
        {'opacity': '0'},
        {'opacity': '1'}
      ], { duration })
      this.__animations.push(animationB)
    }

    await Promise.all(this.__animations.map(anim => animationFinished(anim)))
  }

  stop (canceled) {
    if (canceled) { for (let anim of this.__animations) { anim.cancel() } }
  }
}
