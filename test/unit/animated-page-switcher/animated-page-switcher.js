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

  for (let restamp of [false, true]) {
    it(`can play a sequence of page animations ` +
       `(with${restamp ? '' : 'out'} restamp)`, async () => {
      function study (selector) {
        const el = getElement(selector)
        if (el) { return { text: el.textContent, hidden: el.hidden } }
      }

      const page1 = animatedPageSwitcher._createPage('1')
      const page2 = animatedPageSwitcher._createPage('2')
      for (let page of [page1, page2]) { page.restamp = restamp }

      let str = '';

      // First animation (Show page 1)
      class Animation1 {
        async play () { str += ',2'; await pause(); str += ',4' }
      }
      const promise1 = animatedPageSwitcher._enqueuePageChange(() => {
        str += '1'
        return { pageB: page1, animation: new Animation1() }
      })
      str += ',3';

      expect(str).to.equal('1,2,3')
      expect(animatedPageSwitcher.animating).to.be.true
      expect(study('div:nth-of-type(1)')).to.eql({ text: '1', hidden: false })
      expect(study('div:nth-of-type(2)')).to.not.exist

      const ret1 = await promise1 // Wait for animation to finish

      expect(str).to.equal('1,2,3,4')
      expect(animatedPageSwitcher.animating).to.be.false
      expect(ret1).to.eql({
        started: true,
        pageA: undefined,
        pageB: page1,
        canceled: false,
        animated: true,
        reverted: false,
        reverted: false
      })
      expect(study('div:nth-of-type(1)')).to.eql({ text: '1', hidden: false })
      expect(study('div:nth-of-type(2)')).to.not.exist

      // Second animation (page 1 -> page 2)
      class Animation2 {
        async play () { str += ',6'; await pause(); str += ',8' }
      }
      const promise2 = animatedPageSwitcher._enqueuePageChange(() => {
        str += ',5'
        return { pageB: page2, animation: new Animation2() }
      })
      str += ',7';

      expect(str).to.equal('1,2,3,4,5,6,7')
      expect(animatedPageSwitcher.animating).to.be.true
      expect(study('div:nth-of-type(1)')).to.eql({ text: '1', hidden: false })
      expect(study('div:nth-of-type(2)')).to.eql({ text: '2', hidden: false })

      const ret2 = await promise2 // Wait for animation to finish

      expect(str).to.equal('1,2,3,4,5,6,7,8')
      expect(animatedPageSwitcher.animating).to.be.false
      expect(ret2).to.eql({
        started: true,
        pageA: page1,
        pageB: page2,
        canceled: false,
        animated: true,
        reverted: false
      })
      if (restamp) {
        expect(study('div:nth-of-type(1)')).to.eql({ text: '2', hidden: false })
        expect(study('div:nth-of-type(2)')).to.not.exist
      } else {
        expect(study('div:nth-of-type(1)')).to.eql({ text: '1', hidden: true })
        expect(study('div:nth-of-type(2)')).to.eql({ text: '2', hidden: false })
      }

      // Third animation (page 2 -> page 1)
      class Animation3 {
        async play () { str += ',10'; await pause(); str += ',12' }
      }
      const promise3 = animatedPageSwitcher._enqueuePageChange(() => {
        str += ',9'
        return { pageB: page1, animation: new Animation3() }
      })
      str += ',11';

      expect(str).to.equal('1,2,3,4,5,6,7,8,9,10,11')
      expect(animatedPageSwitcher.animating).to.be.true
      if (restamp) {
        expect(study('div:nth-of-type(1)')).to.eql({ text: '2', hidden: false })
        expect(study('div:nth-of-type(2)')).to.eql({ text: '1', hidden: false })
      } else {
        expect(study('div:nth-of-type(1)')).to.eql({ text: '1', hidden: false })
        expect(study('div:nth-of-type(2)')).to.eql({ text: '2', hidden: false })
      }

      const ret3 = await promise3 // Wait for animation to finish

      expect(str).to.equal('1,2,3,4,5,6,7,8,9,10,11,12')
      expect(animatedPageSwitcher.animating).to.be.false
      expect(ret3).to.eql({
        started: true,
        pageA: page2,
        pageB: page1,
        canceled: false,
        animated: true,
        reverted: false
      })
      if (restamp) {
        expect(study('div:nth-of-type(1)')).to.eql({ text: '1', hidden: false })
        expect(study('div:nth-of-type(2)')).to.not.exist
      } else {
        expect(study('div:nth-of-type(1)')).to.eql({ text: '1', hidden: false })
        expect(study('div:nth-of-type(2)')).to.eql({ text: '2', hidden: true })
      }
    })

    it(`enqueues a page change while an animation is already playing ` +
       `(with${restamp ? '' : 'out'} restamp)`, async () => {
      function study (selector) {
        const el = getElement(selector)
        if (el) { return { text: el.textContent, hidden: el.hidden } }
      }

      const page1 = animatedPageSwitcher._createPage('1')
      const page2 = animatedPageSwitcher._createPage('2')
      const page3 = animatedPageSwitcher._createPage('3')
      for (let page of [page1, page2, page3]) { page.restamp = restamp }

      let str = '';

      // Setup: Show page 1
      class SetupAnimation { async play () {} }
      await animatedPageSwitcher._enqueuePageChange(() => {
        return { pageB: page1, animation: new SetupAnimation() }
      })
      expect(animatedPageSwitcher.animating).to.be.false
      expect(study('div:nth-of-type(1)')).to.eql({ text: '1', hidden: false })
      expect(study('div:nth-of-type(2)')).to.not.exist

      // Animation 1: To page 2
      class Animation1 {
        async play () { str += ',2'; await pause(); str += ',4' }
      }
      const promise1 = animatedPageSwitcher._enqueuePageChange(() => {
        str += '1'
        return { pageB: page2, animation: new Animation1() }
      })

      // Animation 2: To page 3, enqueued while animation 1 is still playing
      class Animation2 {
        async play () { str += ',6'; await pause(); str += ',7' }
      }
      const promise2 = animatedPageSwitcher._enqueuePageChange(() => {
        str += ',5'
        return { pageB: page3, animation: new Animation2() }
      })
      str += ',3';

      expect(str).to.equal('1,2,3')
      expect(animatedPageSwitcher.animating).to.be.true
      expect(study('div:nth-of-type(1)')).to.eql({ text: '1', hidden: false })
      expect(study('div:nth-of-type(2)')).to.eql({ text: '2', hidden: false })
      expect(study('div:nth-of-type(3)')).to.not.exist

      const ret1 = await promise1

      expect(str).to.equal('1,2,3,4,5,6')
      expect(animatedPageSwitcher.animating).to.be.true
      expect(ret1).to.eql({
        started: true,
        pageA: page1,
        pageB: page2,
        canceled: false,
        animated: true,
        reverted: false
      })
      if (restamp) {
        expect(study('div:nth-of-type(1)')).to.eql({ text: '2', hidden: false })
        expect(study('div:nth-of-type(2)')).to.eql({ text: '3', hidden: false })
        expect(study('div:nth-of-type(3)')).to.not.exist
      } else {
        expect(study('div:nth-of-type(1)')).to.eql({ text: '1', hidden: true })
        expect(study('div:nth-of-type(2)')).to.eql({ text: '2', hidden: false })
        expect(study('div:nth-of-type(3)')).to.eql({ text: '3', hidden: false })
        expect(study('div:nth-of-type(4)')).to.not.exist
      }

      const ret2 = await promise2

      expect(str).to.equal('1,2,3,4,5,6,7')
      expect(animatedPageSwitcher.animating).to.be.false
      expect(ret2).to.eql({
        started: true,
        pageA: page2,
        pageB: page3,
        canceled: false,
        animated: true,
        reverted: false
      })
      if (restamp) {
        expect(study('div:nth-of-type(1)')).to.eql({ text: '3', hidden: false })
        expect(study('div:nth-of-type(3)')).to.not.exist
      } else {
        expect(study('div:nth-of-type(1)')).to.eql({ text: '1', hidden: true })
        expect(study('div:nth-of-type(2)')).to.eql({ text: '2', hidden: true })
        expect(study('div:nth-of-type(3)')).to.eql({ text: '3', hidden: false })
        expect(study('div:nth-of-type(4)')).to.not.exist
      }
    })

    it(`enqueues only one page change while an animation is already playing ` +
       `(with${restamp ? '' : 'out'} restamp)`, async () => {
      function study (selector) {
        const el = getElement(selector)
        if (el) { return { text: el.textContent, hidden: el.hidden } }
      }

      const page1 = animatedPageSwitcher._createPage('1')
      const page2 = animatedPageSwitcher._createPage('2')
      const page3 = animatedPageSwitcher._createPage('3')
      const page4 = animatedPageSwitcher._createPage('4')
      for (let page of [page1, page2, page3, page4]) { page.restamp = restamp }

      let str = '';

      // Setup: Show page 1
      class SetupAnimation { async play () {} }
      await animatedPageSwitcher._enqueuePageChange(() => {
        return { pageB: page1, animation: new SetupAnimation() }
      })
      expect(animatedPageSwitcher.animating).to.be.false
      expect(study('div:nth-of-type(1)')).to.eql({ text: '1', hidden: false })
      expect(study('div:nth-of-type(2)')).to.not.exist

      // Animation 1: To page 2
      class Animation1 {
        async play () { str += ',2'; await pause(); str += ',4' }
      }
      const promise1 = animatedPageSwitcher._enqueuePageChange(() => {
        str += '1'
        return { pageB: page2, animation: new Animation1() }
      })

      // Animation 2: To page 3, enqueued while animation 1 is still playing
      class Animation2 {
        async play () { str += ',x2'; await pause(); str += ',x3' }
      }
      const promise2 = animatedPageSwitcher._enqueuePageChange(() => {
        str += ',x1'
        return { pageB: page3, animation: new Animation2() }
      })

      // Animation 3: To page 4, enqueued while animation 1 is still playing
      class Animation3 {
        async play () { str += ',6'; await pause(); str += ',7' }
      }
      const promise3 = animatedPageSwitcher._enqueuePageChange(() => {
        str += ',5'
        return { pageB: page4, animation: new Animation3() }
      })
      str += ',3';

      expect(str).to.equal('1,2,3')
      expect(animatedPageSwitcher.animating).to.be.true
      expect(study('div:nth-of-type(1)')).to.eql({ text: '1', hidden: false })
      expect(study('div:nth-of-type(2)')).to.eql({ text: '2', hidden: false })
      expect(study('div:nth-of-type(3)')).to.not.exist

      const ret1 = await promise1

      expect(str).to.equal('1,2,3,4,5,6')
      expect(animatedPageSwitcher.animating).to.be.true
      expect(ret1).to.eql({
        started: true,
        pageA: page1,
        pageB: page2,
        canceled: false,
        animated: true,
        reverted: false
      })
      if (restamp) {
        expect(study('div:nth-of-type(1)')).to.eql({ text: '2', hidden: false })
        expect(study('div:nth-of-type(2)')).to.eql({ text: '4', hidden: false })
        expect(study('div:nth-of-type(3)')).to.not.exist
      } else {
        expect(study('div:nth-of-type(1)')).to.eql({ text: '1', hidden: true })
        expect(study('div:nth-of-type(2)')).to.eql({ text: '2', hidden: false })
        expect(study('div:nth-of-type(3)')).to.eql({ text: '4', hidden: false })
        expect(study('div:nth-of-type(4)')).to.not.exist
      }

      const race2and3 = Promise.race([promise2, promise3])
      const ret3 = await promise3

      expect(str).to.equal('1,2,3,4,5,6,7')
      expect(animatedPageSwitcher.animating).to.be.false
      expect(ret3).to.eql({
        started: true,
        pageA: page2,
        pageB: page4,
        canceled: false,
        animated: true,
        reverted: false
      })
      if (restamp) {
        expect(study('div:nth-of-type(1)')).to.eql({ text: '4', hidden: false })
        expect(study('div:nth-of-type(3)')).to.not.exist
      } else {
        expect(study('div:nth-of-type(1)')).to.eql({ text: '1', hidden: true })
        expect(study('div:nth-of-type(2)')).to.eql({ text: '2', hidden: true })
        expect(study('div:nth-of-type(3)')).to.eql({ text: '4', hidden: false })
        expect(study('div:nth-of-type(4)')).to.not.exist
      }

      const ret2 = await promise2
      expect(ret2).to.eql({
        started: false,
        pageA: undefined,
        pageB: undefined,
        canceled: undefined,
        animated: undefined,
        reverted: undefined
      })
      expect(await race2and3).to.equal(ret2)
    })
  }

  for (let scenario of ['via property', 'via "display: none"']) {
    it(`can disable animations (${scenario})`, async () => {
      function study (selector) {
        const el = getElement(selector)
        if (el) { return { text: el.textContent, hidden: el.hidden } }
      }

      switch (scenario) {
        case 'via property':
          animatedPageSwitcher.noAnimations = true
          break
        case 'via "display: none"':
          animatedPageSwitcher.style.display = 'none'
          break
      }

      const page1 = animatedPageSwitcher._createPage('1')

      const rafSpy = sinon.spy()
      requestAnimationFrame(rafSpy)

      // First animation (Show page 1)
      let input1
      const promise1 = animatedPageSwitcher._enqueuePageChange((i1) => {
        input1 = i1
        return { pageB: page1, animation: { async play () {} } }
      })

      expect(input1).to.eql({ pageA: undefined, animated: false })
      expect(animatedPageSwitcher.animating).to.be.true
      expect(study('div:nth-of-type(1)')).to.eql({ text: '1', hidden: false })
      expect(study('div:nth-of-type(2)')).to.not.exist

      const ret1 = await promise1 // Wait for animation to finish

      expect(animatedPageSwitcher.animating).to.be.false
      expect(ret1).to.eql({
        started: true,
        pageA: undefined,
        pageB: page1,
        canceled: false,
        animated: false,
        reverted: false
      })
      expect(study('div:nth-of-type(1)')).to.eql({ text: '1', hidden: false })
      expect(study('div:nth-of-type(2)')).to.not.exist
      expect(rafSpy).to.not.have.been.calledOnce
      await pause('requestAnimationFrame')
      expect(rafSpy).to.have.been.calledOnce
    })
  }
})

