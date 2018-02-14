import '../../../../@polymer/polymer/polymer.js'
import './elements/x-wrapper.js'
import pause from '../../utils/pause.js'

describe('AnimatedPageSwitcher', () => {
  let wrapperElement, animatedPageSwitcher, getElement
  let getTextContent, getShadowTextContent
  beforeEach(() => {
    wrapperElement = fixture('my-fixture')
    animatedPageSwitcher = wrapperElement.$['animated-page-switcher']
    getElement = selector => animatedPageSwitcher.querySelector(selector)
    getTextContent = selector => {
      const element = getElement(selector);
      if (element) { return element.textContent }
    }
    getShadowTextContent = selector => {
      const element = getElement(selector);
      if (element) { return element.shadowRoot.textContent }
    }
  })

  it('bla', () => {

  })
})

