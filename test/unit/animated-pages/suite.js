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

  it('can switch between pages sequentially', async () => {
    function study (selector) {
      const el = getElement(selector)
      if (el) { return { text: el.textContent, hidden: el.hidden } }
    }

    let createAnimationInput1
    animatedPages.createAnimation = (x) => { createAnimationInput1 = x }
    animatedPages.selected = '1'
    await animatedPages.finished
    expect(study('div:nth-of-type(1)')).to.eql({ text: '1', hidden: false })
    expect(createAnimationInput1).to.eql({
      elementA: undefined,
      elementB: getElement('div:nth-of-type(1)'),
      templateNameA: undefined,
      templateNameB: '1',
      idA: undefined,
      idB: '1',
      dataA: undefined,
      dataB: undefined
    })

    let createAnimationInput2
    animatedPages.createAnimation = (x) => { createAnimationInput2 = x }
    animatedPages.selected = '2'
    await animatedPages.finished
    expect(study('div:nth-of-type(1)')).to.eql({ text: '1', hidden: true })
    expect(study('div:nth-of-type(2)')).to.eql({ text: '2', hidden: false })
    expect(createAnimationInput2).to.eql({
      elementA: getElement('div:nth-of-type(1)'),
      elementB: getElement('div:nth-of-type(2)'),
      templateNameA: '1',
      templateNameB: '2',
      idA: '1',
      idB: '2',
      dataA: undefined,
      dataB: undefined
    })

    let createAnimationInput3
    animatedPages.createAnimation = (x) => { createAnimationInput3 = x }
    animatedPages.selected = '1'
    await animatedPages.finished
    expect(study('div:nth-of-type(1)')).to.eql({ text: '1', hidden: false })
    expect(study('div:nth-of-type(2)')).to.eql({ text: '2', hidden: true })
    expect(createAnimationInput3).to.eql({
      elementA: getElement('div:nth-of-type(2)'),
      elementB: getElement('div:nth-of-type(1)'),
      templateNameA: '2',
      templateNameB: '1',
      idA: '2',
      idB: '1',
      dataA: undefined,
      dataB: undefined
    })
  })
})
