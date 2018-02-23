import WebAnimationsSegue from './web-animations-segue.js'
import { easeInOutCirc } from '../utils/easing.js'

export default class SwapSegue extends WebAnimationsSegue {
  /**
   * @param {*} options
   * @param {*} options.duration
   * @param {'right'|'bottom'|left'|'top'} options.side Default: 'right'
   * @param {string|number} options.distance Default: '50px'
   */
  constructor (options) { super(options) }

  configure ({ duration = 400, side = 'right', distance = '50px' }) {
    const { keyframesA, keyframesB } = makeKeyframes({ side, distance })
    return {
      keyframesA,
      keyframesB,
      optionsA: { duration, easing: easeInOutCirc, fill: 'both' },
      optionsB: { duration, easing: easeInOutCirc, fill: 'both' }
    }
  }
}

function makeKeyframes ({ side, distance }) {
  if (typeof distance === 'number') { distance += 'px'}

  let transform
  switch (side) {
    case 'right': transform = `translate3d(${distance}, 0, 0)`; break
    case 'left': transform = `translate3d(-${distance}, 0, 0)`; break
    case 'bottom': transform = `translate3d(0, ${distance}, 0)`; break
    case 'top': transform = `translate3d(0, -${distance}, 0)`; break
  }

  const keyframesA = [
    { opacity: 1, zIndex: 1, transform: 'translate3d(0, 0, 0)' },
    { opacity: 0, zIndex: 1, transform }
  ]

  const keyframesB = [
    { opacity: 0, zIndex: 2, transform },
    { opacity: 1, zIndex: 2, transform: 'translate3d(0, 0, 0)' }
  ]

  return { keyframesA, keyframesB }
}
