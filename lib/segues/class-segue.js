import pause from '../utils/pause.js'

export default class ClassSegue {
  /**
   * @param {*} options
   * @param {*} options.elementA
   * @param {*} options.classA
   * @param {*} options.elementB
   * @param {*} options.classB
   * @param {*} options.duration
   */
  constructor (options) {
    this.options = options || {}
  }

  async start () {
    const { classA, classB, duration = 300 } = this.options
    const { elementA, elementB } = this.elements

    if (elementA && classA) { elementA.classList.add(classA) }
    if (elementB && classB) { elementB.classList.add(classB) }

    await pause(duration)
  }

  stop () {
    const { classA, classB } = this.options
    const { elementA, elementB } = this.elements

    if (elementA && classA) { elementA.classList.remove(classA) }
    if (elementB && classB) { elementB.classList.remove(classB) }
  }
}
