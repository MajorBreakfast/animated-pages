import '../../../../@polymer/polymer/polymer.js'
import './elements/x-wrapper.js'
import pause from '../../../lib/utils/pause.js'

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
    it(`can play a sequence of page segues ` +
       `(with${restamp ? '' : 'out'} restamp)`, async () => {
      function study (selector) {
        const el = getElement(selector)
        if (el) { return { text: el.textContent, hidden: el.hidden } }
      }

      const page1 = animatedPageSwitcher._createPage('1')
      const page2 = animatedPageSwitcher._createPage('2')
      for (let page of [page1, page2]) { page.restamp = restamp }

      // Page change 1: Show page 1
      let str1 = '';
      class Segue1 {
        async start () { str1 += ',3'; await pause(); str1 += ',5' }
        stop () { str1 += ',6' }
      }
      const promise1 = animatedPageSwitcher._enqueuePageChange({
        getPageB: () => { str1 += '1'; return page1 },
        createSegue: () => { str1 += ',2'; return new Segue1() },
        output: x => { str1 += ',7'; return x }
      })
      str1 += ',4';

      expect(str1).to.equal('1,2,3,4')
      expect(animatedPageSwitcher.animating).to.be.true
      expect(study('div:nth-of-type(1)')).to.eql({ text: '1', hidden: false })
      expect(study('div:nth-of-type(2)')).to.not.exist

      const ret1 = await promise1 // Wait for segue to finish

      expect(str1).to.equal('1,2,3,4,5,6,7')
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

      // Page change 2: Show page 2
      let str2 = '';
      class Segue2 {
        async start () { str2 += ',3'; await pause(); str2 += ',5' }
        stop () { str2 += ',6' }
      }
      const promise2 = animatedPageSwitcher._enqueuePageChange({
        getPageB: () => { str2 += '1'; return page2 },
        createSegue: () => { str2 += ',2'; return new Segue2() },
        output: x => { str2 += ',7'; return x }
      })
      str2 += ',4';

      expect(str2).to.equal('1,2,3,4')
      expect(animatedPageSwitcher.animating).to.be.true
      expect(study('div:nth-of-type(1)')).to.eql({ text: '1', hidden: false })
      expect(study('div:nth-of-type(2)')).to.eql({ text: '2', hidden: false })

      const ret2 = await promise2 // Wait for segue to finish

      expect(str2).to.equal('1,2,3,4,5,6,7')
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

      // Page change 3: Show page 1 (again)
      let str3 = '';
      class Segue3 {
        async start () { str3 += ',3'; await pause(); str3 += ',5' }
        stop () { str3 += ',6' }
      }
      const promise3 = animatedPageSwitcher._enqueuePageChange({
        getPageB: () => { str3 += '1'; return page1 },
        createSegue: () => { str3 += ',2'; return new Segue3() },
        output: x => { str3 += ',7'; return x }
      })
      str3 += ',4';

      expect(str3).to.equal('1,2,3,4')
      expect(animatedPageSwitcher.animating).to.be.true
      if (restamp) {
        expect(study('div:nth-of-type(1)')).to.eql({ text: '2', hidden: false })
        expect(study('div:nth-of-type(2)')).to.eql({ text: '1', hidden: false })
      } else {
        expect(study('div:nth-of-type(1)')).to.eql({ text: '1', hidden: false })
        expect(study('div:nth-of-type(2)')).to.eql({ text: '2', hidden: false })
      }

      const ret3 = await promise3 // Wait for segue to finish

      expect(str3).to.equal('1,2,3,4,5,6,7')
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

      // Page change 4: Hide page
      let str4 = '';
      class Segue4 {
        async start () { str4 += ',3'; await pause(); str4 += ',5' }
        stop () { str4 += ',6' }
      }
      const promise4 = animatedPageSwitcher._enqueuePageChange({
        getPageB: () => { str4 += '1'; return undefined },
        createSegue: () => { str4 += ',2'; return new Segue4() },
        output: x => { str4 += ',7'; return x }
      })
      str4 += ',4';

      expect(str4).to.equal('1,2,3,4')
      expect(animatedPageSwitcher.animating).to.be.true
      if (restamp) {
        expect(study('div:nth-of-type(1)')).to.eql({ text: '1', hidden: false })
        expect(study('div:nth-of-type(2)')).to.not.exist
      } else {
        expect(study('div:nth-of-type(1)')).to.eql({ text: '1', hidden: false })
        expect(study('div:nth-of-type(2)')).to.eql({ text: '2', hidden: true })
      }

      const ret4 = await promise4 // Wait for segue to finish

      expect(str1).to.equal('1,2,3,4,5,6,7')
      expect(animatedPageSwitcher.animating).to.be.false
      expect(ret4).to.eql({
        started: true,
        pageA: page1,
        pageB: undefined,
        canceled: false,
        animated: true,
        reverted: false
      })
      if (restamp) {
        expect(study('div:nth-of-type(1)')).to.not.exist
        expect(study('div:nth-of-type(2)')).to.not.exist
      } else {
        expect(study('div:nth-of-type(1)')).to.eql({ text: '1', hidden: true })
        expect(study('div:nth-of-type(2)')).to.eql({ text: '2', hidden: true })
      }
    })

    it(`enqueues a segue while another segue is already playing ` +
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

      // Setup page change: Show page 1
      await animatedPageSwitcher._enqueuePageChange({ getPageB: () => page1 })
      expect(animatedPageSwitcher.animating).to.be.false
      expect(study('div:nth-of-type(1)')).to.eql({ text: '1', hidden: false })
      expect(study('div:nth-of-type(2)')).to.not.exist

      // Page change 1: Show page 2
      class Segue1 {
        async start () { str += ',3'; await pause(); str += ',5' }
        stop () { str += ',6' }
      }
      const promise1 = animatedPageSwitcher._enqueuePageChange({
        getPageB: () => { str += '1'; return page2 },
        createSegue: () => { str += ',2'; return new Segue1() },
        output: x => { str += ',7'; return x }
      })

      // Page change 2: Show page 3 (Page change 1 is still running)
      class Segue2 {
        async start () { str += ',10'; await pause(); str += ',11' }
        stop () { str += ',12' }
      }
      const promise2 = animatedPageSwitcher._enqueuePageChange({
        getPageB: () => { str += ',8'; return page3 },
        createSegue: () => { str += ',9'; return new Segue2() },
        output: x => { str += ',13'; return x }
      })
      str += ',4';

      expect(str).to.equal('1,2,3,4')
      expect(animatedPageSwitcher.animating).to.be.true
      expect(study('div:nth-of-type(1)')).to.eql({ text: '1', hidden: false })
      expect(study('div:nth-of-type(2)')).to.eql({ text: '2', hidden: false })
      expect(study('div:nth-of-type(3)')).to.not.exist

      const ret1 = await promise1

      expect(str).to.equal('1,2,3,4,5,6,7,8,9,10')
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

      expect(str).to.equal('1,2,3,4,5,6,7,8,9,10,11,12,13')
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

    it(`enqueues only one segue while another segue is already playing ` +
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

      // Setup page change: Show page 1
      class SetupSegue { async start () {} stop () {} }
      await animatedPageSwitcher._enqueuePageChange({ getPageB: () => page1 })
      expect(animatedPageSwitcher.animating).to.be.false
      expect(study('div:nth-of-type(1)')).to.eql({ text: '1', hidden: false })
      expect(study('div:nth-of-type(2)')).to.not.exist

      // Page change 1: Show page 2
      class Segue1 {
        async start () { str += ',3'; await pause(); str += ',6' }
        stop () { str += ',7' }
      }
      const promise1 = animatedPageSwitcher._enqueuePageChange({
        getPageB: () => { str += '1'; return page2 },
        createSegue: () => { str += ',2'; return new Segue1() },
        output: x => { str += ',8'; return x }
      })

      // Page change 2: Show page 3 (Page change 1 is still running)
      class Segue2 {
        async start () { str += ',x3'; await pause(); str += ',x4' }
        stop () { str += ',x5' }
      }
      const promise2 = animatedPageSwitcher._enqueuePageChange({
        getPageB: () => { str += ',x1'; return page3 },
        createSegue: () => { str += ',x2'; return new Segue2() },
        output: x => { str += ',4'; return x }
      })

      // Page change 3: Show page 4 (Page change 1 is still running)
      // => Page change 2 is skipped
      class Segue3 {
        async start () { str += ',11'; await pause(); str += ',12' }
        stop () { str += ',13' }
      }
      const promise3 = animatedPageSwitcher._enqueuePageChange({
        getPageB: () => { str += ',9'; return page4 },
        createSegue: () => { str += ',10'; return new Segue3() },
        output: x => { str += ',14'; return x }
      })
      str += ',5'

      expect(str).to.equal('1,2,3,4,5')
      expect(animatedPageSwitcher.animating).to.be.true
      expect(study('div:nth-of-type(1)')).to.eql({ text: '1', hidden: false })
      expect(study('div:nth-of-type(2)')).to.eql({ text: '2', hidden: false })
      expect(study('div:nth-of-type(3)')).to.not.exist

      const ret1 = await promise1

      expect(str).to.equal('1,2,3,4,5,6,7,8,9,10,11')
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

      const racePromise2and3 = Promise.race([promise2, promise3])
      const ret3 = await promise3

      expect(str).to.equal('1,2,3,4,5,6,7,8,9,10,11,12,13,14')
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
      expect(await racePromise2and3).to.equal(ret2)
    })
  }

  for (let scenario of ['noAnimations property', '"display: none"']) {
    it(`can disable animations (via ${scenario})`, async () => {
      function study (selector) {
        const el = getElement(selector)
        if (el) { return { text: el.textContent, hidden: el.hidden } }
      }

      switch (scenario) {
        case 'noAnimations property':
          animatedPageSwitcher.noAnimations = true
          break
        case '"display: none"':
          animatedPageSwitcher.style.display = 'none'
          break
      }

      const page1 = animatedPageSwitcher._createPage('1')
      const page2 = animatedPageSwitcher._createPage('2')

      const rafSpy = sinon.spy()
      requestAnimationFrame(rafSpy)

      // Page change 1: Show page 1
      const animSpy1 = sinon.spy()
      const promise1 = animatedPageSwitcher._enqueuePageChange({
        getPageB: () => page1,
        createSegue: animSpy1
      })

      // Page change 2: Show page 2
      const animSpy2 = sinon.spy()
      const promise2 = animatedPageSwitcher._enqueuePageChange({
        getPageB: () => page2,
        createSegue: animSpy2
      })

      expect(animatedPageSwitcher.animating).to.be.true
      expect(study('div:nth-of-type(1)')).to.eql({ text: '1', hidden: false })
      expect(study('div:nth-of-type(2)')).to.not.exist

      // Wait for segues to finish
      const ret1 = await promise1
      const ret2 = await promise2

      expect(animatedPageSwitcher.animating).to.be.false
      expect(ret1).to.eql({
        started: true,
        pageA: undefined,
        pageB: page1,
        canceled: false,
        animated: false,
        reverted: false
      })
      expect(ret2).to.eql({
        started: true,
        pageA: page1,
        pageB: page2,
        canceled: false,
        animated: false,
        reverted: false
      })
      expect(study('div:nth-of-type(1)')).to.eql({ text: '1', hidden: true })
      expect(study('div:nth-of-type(2)')).to.eql({ text: '2', hidden: false })
      expect(animSpy1).to.not.have.been.called
      expect(animSpy2).to.not.have.been.called

      expect(rafSpy).to.not.have.been.called
      await pause('requestAnimationFrame')
      expect(rafSpy).to.have.been.called
    })
  }

  it(`can accept no segue`, async () => {
    function study (selector) {
      const el = getElement(selector)
      if (el) { return { text: el.textContent, hidden: el.hidden } }
    }

    const page1 = animatedPageSwitcher._createPage('1')

    const rafSpy = sinon.spy()
    requestAnimationFrame(rafSpy)

    // Page change 1: Show page 1
    const promise1 = animatedPageSwitcher._enqueuePageChange({
      getPageB: () => page1,
      createSegue: () => undefined
    })

    expect(animatedPageSwitcher.animating).to.be.true
    expect(study('div:nth-of-type(1)')).to.eql({ text: '1', hidden: false })
    expect(study('div:nth-of-type(2)')).to.not.exist

    const ret1 = await promise1 // Wait for segue to finish

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

    expect(rafSpy).to.not.have.been.called
    await pause('requestAnimationFrame')
    expect(rafSpy).to.have.been.called
  })
})

