import pause from '../utils/pause.js'

export default class ClassAnimation {
  /**
   * @param {*} options
   * @param {*} options.elementA
   * @param {*} options.classA
   * @param {*} options.elementB
   * @param {*} options.classB
   * @param {*} options.duration
   */
  constructor (options) {
    this._options = options
  }

  async start () {
    const { elementA, classA, elementB, classB, duration } = this._options

    if (elementA && classA) { elementA.classList.add(classA) }
    if (elementB && classB) { elementB.classList.add(classB) }

    await pause(typeof duration === 'number' ? duration : 300)
  }

  stop () {
    const { elementA, classA, elementB, classB } = this._options

    if (elementA && classA) { elementA.classList.remove(classA) }
    if (elementB && classB) { elementB.classList.remove(classB) }
  }
}
