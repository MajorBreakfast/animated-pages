import '../../../../@polymer/polymer/polymer.js'
import './elements/x-wrapper.js'
import pause from '../../../lib/utils/pause.js'

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

  it('can select a page via a string literal', async () => {
    let createAnimationInput
    animatedPages.createAnimation = (x) => { createAnimationInput = x }
    animatedPages.selected = '1'
    await animatedPages.finished
    expect(getTextContent('div:nth-of-type(1)')).to.equal('1')
    expect(createAnimationInput).to.eql({
      elementA: undefined,
      elementB: getElement('div:nth-of-type(1)'),
      templateNameA: undefined,
      templateNameB: '1',
      idA: undefined,
      idB: '1',
      dataA: undefined,
      dataB: undefined
    })
  })
})
