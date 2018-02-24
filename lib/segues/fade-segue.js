import WebAnimationsSegue from './web-animations-segue.js'
import { easeInOutCirc } from '../utils/easing.js'

export default class FadeSegue extends WebAnimationsSegue {
  /**
   * @param {*} options
   * @param {number} options.duration
   * @param {boolean} options.both Fade both pages. Default: `false`
   */
  constructor (options) { super(options) }

  configure ({ duration = 300, both = false }) {
    const config = {
      keyframesA: { zIndex: [1, 1] },
      keyframesB: { opacity: [0, 1], zIndex: [2, 2] },
      optionsA: { duration, easing: easeInOutCirc, fill: 'both' },
      optionsB: { duration, easing: easeInOutCirc, fill: 'both' },
    }

    if (both) { config.keyframesA.opacity = [1, 0] }

    return config
  }
}
