import WebAnimationsSegue from './web-animations-segue.js'

const pushKeyframesA = [
  { opacity: 1, transform: 'translate3d(0, 0, 0)', zIndex: 1 },
  { opacity: 0, transform: 'translate3d(0, 0, -100px)', zIndex: 1 }
]

const pushKeyframesB = [
  { opacity: 0, transform: 'translate3d(0, 0, 100px)', zIndex: 2 },
  { opacity: 1, transform: 'translate3d(0, 0, 0)', zIndex: 2 }
]

const easeInOutCirc = 'cubic-bezier(0.785, 0.135, 0.150, 0.860)'

export class PushSegue extends WebAnimationsSegue {
  static get config () {
    return {
      keyframesA: pushKeyframesA,
      keyframesB: pushKeyframesB,
      keyframesAnimatedPages: { perspective: ['700px', '700px'] },
      optionsA: { easing: easeInOutCirc },
      optionsB: { easing: easeInOutCirc },
      duration: 200
    }
  }
}

export class PopSegue extends WebAnimationsSegue {
  static get config () {
    return {
      keyframesA: pushKeyframesB,
      keyframesB: pushKeyframesA,
      keyframesAnimatedPages: { perspective: ['700px', '700px'] },
      optionsA: { easing: easeInOutCirc, direction: 'reverse' },
      optionsB: { easing: easeInOutCirc, direction: 'reverse' },
      zIndexA: 1,
      zIndexB: 2,
      duration: 200
    }
  }
}
