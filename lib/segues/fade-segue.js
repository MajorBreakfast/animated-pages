import WebAnimationsSegue from './web-animations-segue.js'

export default class FadeSegue extends WebAnimationsSegue {
  static get config () {
    return {
      keyframesA: [{ opacity: 1, zIndex: 1 }, { opacity: 0, zIndex: 1 }],
      keyframesB: [{ opacity: 0, zIndex: 2 }, { opacity: 1, zIndex: 2 }],
      optionsA: undefined,
      optionsB: undefined,
      duration: 300
    }
  }
}
