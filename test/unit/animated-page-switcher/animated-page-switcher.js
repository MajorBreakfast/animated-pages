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

      const pageA = animatedPageSwitcher._createPage('a')
      const pageB = animatedPageSwitcher._createPage('b')

      let str = '';

      // First animation (Show page A)
      class Animation1 {
        async play () { str += ',2'; await pause(); str += ',4' }
      }
      const animationPromise1 = animatedPageSwitcher._animateToPage(pageA, {
        createAnimation () { str += '1'; return new Animation1() },
        shouldRestampA () { str += ',5'; return restamp }
      })
      str += ',3';

      expect(str).to.equal('1,2,3')
      expect(animatedPageSwitcher.animating).to.be.true
      expect(study('div:nth-of-type(1)')).to.eql({ text: 'A', hidden: false })
      expect(study('div:nth-of-type(2)')).to.not.exist

      const ret1 = await animationPromise1 // Wait for animation to finish

      expect(str).to.equal('1,2,3,4,5')
      expect(animatedPageSwitcher.animating).to.be.false
      expect(ret1).to.eql({
        started: true,
        canceled: false,
        animated: true
      })
      expect(study('div:nth-of-type(1)')).to.eql({ text: 'A', hidden: false })
      expect(study('div:nth-of-type(2)')).to.not.exist

      // Second animation (Page A -> Page B)
      class Animation2 {
        async play () { str += ',7'; await pause(); str += ',9' }
      }
      const animationPromise2 = animatedPageSwitcher._animateToPage(pageB, {
        createAnimation () { str += ',6'; return new Animation2() },
        shouldRestampA () { str += ',10'; return restamp }
      })
      str += ',8';

      expect(str).to.equal('1,2,3,4,5,6,7,8')
      expect(animatedPageSwitcher.animating).to.be.true
      expect(study('div:nth-of-type(1)')).to.eql({ text: 'A', hidden: false })
      expect(study('div:nth-of-type(2)')).to.eql({ text: 'B', hidden: false })

      const ret2 = await animationPromise2 // Wait for animation to finish

      expect(str).to.equal('1,2,3,4,5,6,7,8,9,10')
      expect(animatedPageSwitcher.animating).to.be.false
      expect(ret2).to.eql({
        started: true,
        canceled: false,
        animated: true
      })
      if (restamp) {
        expect(study('div:nth-of-type(1)')).to.eql({ text: 'B', hidden: false })
        expect(study('div:nth-of-type(2)')).to.not.exist
      } else {
        expect(study('div:nth-of-type(1)')).to.eql({ text: 'A', hidden: true })
        expect(study('div:nth-of-type(2)')).to.eql({ text: 'B', hidden: false })
      }

      // Third animation (Page B -> Page A)
      class Animation3 {
        async play () { str += ',12'; await pause(); str += ',14' }
      }
      const animationPromise3 = animatedPageSwitcher._animateToPage(pageA, {
        createAnimation () { str += ',11'; return new Animation3() },
        shouldRestampA () { str += ',15'; return restamp }
      })
      str += ',13';

      expect(str).to.equal('1,2,3,4,5,6,7,8,9,10,11,12,13')
      expect(animatedPageSwitcher.animating).to.be.true
      if (restamp) {
        expect(study('div:nth-of-type(1)')).to.eql({ text: 'B', hidden: false })
        expect(study('div:nth-of-type(2)')).to.eql({ text: 'A', hidden: false })
      } else {
        expect(study('div:nth-of-type(1)')).to.eql({ text: 'A', hidden: false })
        expect(study('div:nth-of-type(2)')).to.eql({ text: 'B', hidden: false })
      }

      const ret3 = await animationPromise3 // Wait for animation to finish

      expect(str).to.equal('1,2,3,4,5,6,7,8,9,10,11,12,13,14,15')
      expect(animatedPageSwitcher.animating).to.be.false
      expect(ret3).to.eql({
        started: true,
        canceled: false,
        animated: true
      })
      if (restamp) {
        expect(study('div:nth-of-type(1)')).to.eql({ text: 'A', hidden: false })
        expect(study('div:nth-of-type(2)')).to.not.exist
      } else {
        expect(study('div:nth-of-type(1)')).to.eql({ text: 'A', hidden: false })
        expect(study('div:nth-of-type(2)')).to.eql({ text: 'B', hidden: true })
      }
    })

    it(`enqueues a page change while an animation is already playing ` +
       `(with${restamp ? '' : 'out'} restamp)`, async () => {
      function study (selector) {
        const el = getElement(selector)
        if (el) { return { text: el.textContent, hidden: el.hidden } }
      }

      const pageA = animatedPageSwitcher._createPage('a')
      const pageB = animatedPageSwitcher._createPage('b')
      const pageC = animatedPageSwitcher._createPage('c')

      let str = '';

      // Setup: Show page A
      class SetupAnimation { async play () {} }
      await animatedPageSwitcher._animateToPage(pageA, {
        createAnimation () { return new SetupAnimation() }
      })
      expect(animatedPageSwitcher.animating).to.be.false
      expect(study('div:nth-of-type(1)')).to.eql({ text: 'A', hidden: false })
      expect(study('div:nth-of-type(2)')).to.not.exist

      // Animation 1: To page B
      class Animation1 {
        async play () { str += ',2'; await pause(); str += ',4' }
      }
      const animationPromise1 = animatedPageSwitcher._animateToPage(pageB, {
        createAnimation () { str += '1'; return new Animation1() },
        shouldRestampA () { str += ',5'; return restamp }
      })

      // Animation 2: To page C, enqueued while animation 1 is still playing
      class Animation2 {
        async play () { str += ',7'; await pause(); str += ',8' }
      }
      const animationPromise2 = animatedPageSwitcher._animateToPage(pageC, {
        createAnimation () { str += ',6'; return new Animation2() },
        shouldRestampA () { str += ',9'; return restamp }
      })
      str += ',3';

      expect(str).to.equal('1,2,3')
      expect(animatedPageSwitcher.animating).to.be.true
      expect(study('div:nth-of-type(1)')).to.eql({ text: 'A', hidden: false })
      expect(study('div:nth-of-type(2)')).to.eql({ text: 'B', hidden: false })
      expect(study('div:nth-of-type(3)')).to.not.exist

      const ret1 = await animationPromise1

      expect(str).to.equal('1,2,3,4,5,6,7')
      expect(animatedPageSwitcher.animating).to.be.true
      expect(ret1).to.eql({
        started: true,
        canceled: false,
        animated: true
      })
      if (restamp) {
        expect(study('div:nth-of-type(1)')).to.eql({ text: 'B', hidden: false })
        expect(study('div:nth-of-type(2)')).to.eql({ text: 'C', hidden: false })
        expect(study('div:nth-of-type(3)')).to.not.exist
      } else {
        expect(study('div:nth-of-type(1)')).to.eql({ text: 'A', hidden: true })
        expect(study('div:nth-of-type(2)')).to.eql({ text: 'B', hidden: false })
        expect(study('div:nth-of-type(3)')).to.eql({ text: 'C', hidden: false })
        expect(study('div:nth-of-type(4)')).to.not.exist
      }

      const ret2 = await animationPromise2

      expect(str).to.equal('1,2,3,4,5,6,7,8,9')
      expect(animatedPageSwitcher.animating).to.be.false
      expect(ret2).to.eql({
        started: true,
        canceled: false,
        animated: true
      })
      if (restamp) {
        expect(study('div:nth-of-type(1)')).to.eql({ text: 'C', hidden: false })
        expect(study('div:nth-of-type(3)')).to.not.exist
      } else {
        expect(study('div:nth-of-type(1)')).to.eql({ text: 'A', hidden: true })
        expect(study('div:nth-of-type(2)')).to.eql({ text: 'B', hidden: true })
        expect(study('div:nth-of-type(3)')).to.eql({ text: 'C', hidden: false })
        expect(study('div:nth-of-type(4)')).to.not.exist
      }
    })

    it(`enqueues only one page change while an animation is already playing ` +
       `(with${restamp ? '' : 'out'} restamp)`, async () => {
      function study (selector) {
        const el = getElement(selector)
        if (el) { return { text: el.textContent, hidden: el.hidden } }
      }

      const pageA = animatedPageSwitcher._createPage('a')
      const pageB = animatedPageSwitcher._createPage('b')
      const pageC = animatedPageSwitcher._createPage('c')
      const pageD = animatedPageSwitcher._createPage('d')

      let str = '';

      // Setup: Show page A
      class SetupAnimation { async play () {} }
      await animatedPageSwitcher._animateToPage(pageA, {
        createAnimation () { return new SetupAnimation() }
      })
      expect(animatedPageSwitcher.animating).to.be.false
      expect(study('div:nth-of-type(1)')).to.eql({ text: 'A', hidden: false })
      expect(study('div:nth-of-type(2)')).to.not.exist

      // Animation 1: To page B
      class Animation1 {
        async play () { str += ',2'; await pause(); str += ',4' }
      }
      const animationPromise1 = animatedPageSwitcher._animateToPage(pageB, {
        createAnimation () { str += '1'; return new Animation1() },
        shouldRestampA () { str += ',5'; return restamp }
      })

      // Animation 2: To page C, enqueued while animation 1 is still playing
      class Animation2 {
        async play () { str += ',x2'; await pause(); str += ',x3' }
      }
      const animationPromise2 = animatedPageSwitcher._animateToPage(pageC, {
        createAnimation () { str += ',x1'; return new Animation2() },
        shouldRestampA () { str += ',x4'; return restamp }
      })

      // Animation 3: To page D, enqueued while animation 1 is still playing
      class Animation3 {
        async play () { str += ',7'; await pause(); str += ',8' }
      }
      const animationPromise3 = animatedPageSwitcher._animateToPage(pageD, {
        createAnimation () { str += ',6'; return new Animation3() },
        shouldRestampA () { str += ',9'; return restamp }
      })
      str += ',3';

      expect(str).to.equal('1,2,3')
      expect(animatedPageSwitcher.animating).to.be.true
      expect(study('div:nth-of-type(1)')).to.eql({ text: 'A', hidden: false })
      expect(study('div:nth-of-type(2)')).to.eql({ text: 'B', hidden: false })
      expect(study('div:nth-of-type(3)')).to.not.exist

      const ret1 = await animationPromise1

      expect(str).to.equal('1,2,3,4,5,6,7')
      expect(animatedPageSwitcher.animating).to.be.true
      expect(ret1).to.eql({
        started: true,
        canceled: false,
        animated: true
      })
      if (restamp) {
        expect(study('div:nth-of-type(1)')).to.eql({ text: 'B', hidden: false })
        expect(study('div:nth-of-type(2)')).to.eql({ text: 'D', hidden: false })
        expect(study('div:nth-of-type(3)')).to.not.exist
      } else {
        expect(study('div:nth-of-type(1)')).to.eql({ text: 'A', hidden: true })
        expect(study('div:nth-of-type(2)')).to.eql({ text: 'B', hidden: false })
        expect(study('div:nth-of-type(3)')).to.eql({ text: 'D', hidden: false })
        expect(study('div:nth-of-type(4)')).to.not.exist
      }

      const race2and3 = Promise.race([animationPromise2, animationPromise3])
      const ret3 = await animationPromise3

      expect(str).to.equal('1,2,3,4,5,6,7,8,9')
      expect(animatedPageSwitcher.animating).to.be.false
      expect(ret3).to.eql({
        started: true,
        canceled: false,
        animated: true
      })
      if (restamp) {
        expect(study('div:nth-of-type(1)')).to.eql({ text: 'D', hidden: false })
        expect(study('div:nth-of-type(3)')).to.not.exist
      } else {
        expect(study('div:nth-of-type(1)')).to.eql({ text: 'A', hidden: true })
        expect(study('div:nth-of-type(2)')).to.eql({ text: 'B', hidden: true })
        expect(study('div:nth-of-type(3)')).to.eql({ text: 'D', hidden: false })
        expect(study('div:nth-of-type(4)')).to.not.exist
      }

      const ret2 = await animationPromise2
      expect(ret2).to.eql({
        started: false,
        canceled: false,
        animated: false
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
          animatedPageSwitcher.disableAnimations = true
          break
        case 'via "display: none"':
          animatedPageSwitcher.style.display = 'none'
          break
      }

      const pageA = animatedPageSwitcher._createPage('a')
      const pageB = animatedPageSwitcher._createPage('b')

      let str = '';

      // First animation (Show page A)
      class Animation1 {
        async play () { str += ',x2'; await pause(); str += ',x3' }
      }
      const animationPromise1 = animatedPageSwitcher._animateToPage(pageA, {
        createAnimation () { str += ',x1'; return new Animation1() },
        shouldRestampA () { str += ',2'; return false }
      })
      str += '1';

      expect(str).to.equal('1')
      expect(animatedPageSwitcher.animating).to.be.true
      expect(study('div:nth-of-type(1)')).to.eql({ text: 'A', hidden: false })
      expect(study('div:nth-of-type(2)')).to.not.exist

      const ret1 = await animationPromise1 // Wait for animation to finish

      expect(str).to.equal('1,2')
      expect(animatedPageSwitcher.animating).to.be.false
      expect(ret1).to.eql({
        started: true,
        canceled: false,
        animated: false
      })
      expect(study('div:nth-of-type(1)')).to.eql({ text: 'A', hidden: false })
      expect(study('div:nth-of-type(2)')).to.not.exist
    })
  }
})

