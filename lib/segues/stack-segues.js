import WebAnimationsSegue from './web-animations-segue.js'
import { easeInOutCirc } from '../utils/easing.js'

export class PushSegue extends WebAnimationsSegue {
  /**
   * @param {*} options
   * @param {*} options.duration
   */
  constructor (options) { super(options) }

  configure ({ duration = 200 }) {
    return {
      keyframesA: pushKeyframesA,
      keyframesB: pushKeyframesB,
      keyframesAnimatedPages: { perspective: ['700px', '700px'] },
      optionsA: { duration, easing: easeInOutCirc, fill: 'both' },
      optionsB: { duration, easing: easeInOutCirc, fill: 'both' },
      optionsAnimatedPages: { duration, fill: 'both' }
    }
  }
}

export class PopSegue extends WebAnimationsSegue {
  /**
   * @param {*} options
   * @param {*} options.duration
   */
  constructor (options) { super(options) }

  configure ({ duration = 200 }) {
    return {
      keyframesA: pushKeyframesB,
      keyframesB: pushKeyframesA,
      keyframesAnimatedPages: { perspective: ['700px', '700px'] },
      optionsA: { duration, easing: easeInOutCirc,
                  fill: 'both', direction: 'reverse' },
      optionsB: { duration, easing: easeInOutCirc,
                  fill: 'both', direction: 'reverse' },
      optionsAnimatedPages: { duration, fill: 'both' }
    }
  }
}

const pushKeyframesA = [
  { opacity: 1, transform: 'translate3d(0, 0, 0)', zIndex: 1 },
  { opacity: 0, transform: 'translate3d(0, 0, -100px)', zIndex: 1 }
]

const pushKeyframesB = [
  { opacity: 0, transform: 'translate3d(0, 0, 100px)', zIndex: 2 },
  { opacity: 1, transform: 'translate3d(0, 0, 0)', zIndex: 2 }
]
