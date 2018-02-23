import WebAnimationsSegue from './web-animations-segue.js'
import { easeInOutCirc } from '../utils/easing.js'

const keyframesA = [
  { opacity: 1, transform: 'translate3d(0, 0, 0)', zIndex: 1 },
  { opacity: 0, transform: 'translate3d(50px, 0, 0)', zIndex: 1 }
]

const keyframesB = [
  { opacity: 0, transform: 'translate3d(50px, 0, 0)', zIndex: 2 },
  { opacity: 1, transform: 'translate3d(0, 0, 0)', zIndex: 2 }
]

export default class SwapSegue extends WebAnimationsSegue {
  configure ({ duration = 400 }) {
    return {
      keyframesA,
      keyframesB,
      keyframesAnimatedPages: { perspective: ['700px', '700px'] },
      optionsA: { duration, easing: easeInOutCirc, fill: 'both' },
      optionsB: { duration, easing: easeInOutCirc, fill: 'both' },
      optionsAnimatedPages: { duration, fill: 'both' }
    }
  }
}
