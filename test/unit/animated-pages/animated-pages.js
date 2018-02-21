import '../../../../@polymer/polymer/polymer.js'
import './elements/x-wrapper.js'
import pause from '../../utils/pause.js'

describe('<animated-pages>', () => {
  let wrapperElement, animatedPages, getElement
  let getTextContent, getShadowTextContent
  beforeEach(() => {
    wrapperElement = fixture('my-fixture')
    animatedPages = wrapperElement.$['animated-pages']
    getElement = selector => animatedPages.querySelector(selector)
    getTextContent = selector => {
      const element = getElement(selector);
      if (element) { return element.textContent }
    }
    getShadowTextContent = selector => {
      const element = getElement(selector);
      if (element) { return element.shadowRoot.textContent }
    }
  })

  it('Select page via string literal', async () => {
    animatedPages.selected = '1'
    await animatedPages.finished
    expect(getTextContent('div:nth-of-type(1)')).to.equal('1')
  })
})
