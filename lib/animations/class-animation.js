import pause from '../utils/pause.js'

export default class ClassAnimation {
  constructor (options) {
    this.__options = options
  }

  async start () {
    const { elementA, classA, elementB, classB, duration } = this.__options

    if (elementA && classA) { elementA.classList.add(classA) }
    if (elementB && classB) { elementB.classList.add(classB) }

    await pause(typeof duration === 'number' ? duration : 300)
  }

  stop () {
    const { elementA, classA, elementB, classB } = this.__options

    if (elementA && classA) { elementA.classList.remove(classA) }
    if (elementB && classB) { elementB.classList.remove(classB) }
  }
}
