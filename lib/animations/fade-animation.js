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

    await Promise.all(this.__animations.map(a => a.finished))
  }

  stop (canceled) {
    if (canceled) { for (let anim of this.__animations) { anim.cancel() } }
  }
}