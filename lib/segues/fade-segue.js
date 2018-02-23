import WebAnimationsSegue from './web-animations-segue.js'
import { easeInOutCirc } from '../utils/easing.js'

export default class FadeSegue extends WebAnimationsSegue {
  /**
   * @param {*} options
   * @param {*} options.duration
   */
  constructor (options) { super(options) }

  configure ({ duration = 300 }) {
    return {
      keyframesA: [{ opacity: 1, zIndex: 1 }, { opacity: 0, zIndex: 1 }],
      keyframesB: [{ opacity: 0, zIndex: 2 }, { opacity: 1, zIndex: 2 }],
      optionsA: { duration, easing: easeInOutCirc, fill: 'both' },
      optionsB: { duration, easing: easeInOutCirc, fill: 'both' }
    }
  }
}
