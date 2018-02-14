import { Element, html } from '../../../../../@polymer/polymer/polymer-element.js'
import AnimatedPageSwitcherMixin from '../../../../lib/mixins/animated-page-switcher/animated-page-switcher.js'

const SuperClass = AnimatedPageSwitcherMixin(Element)

export default class AnimatedPageSwitcher extends SuperClass {
  static get is () { return 'animated-page-swicher' }
}

customElements.define(AnimatedPageSwitcher.is, AnimatedPageSwitcher)
