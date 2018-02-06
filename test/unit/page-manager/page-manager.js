import '../../../../@polymer/polymer/polymer.js'
import './elements/x-wrapper.js'
import { TemplateInstanceBase } from '../../../../@polymer/polymer/lib/utils/templatize.js'
import pause from '../../utils/pause.js'

describe('PageManager', () => {
  let wrapperElement, pageManagerElement, getElement
  let getTextContent, getShadowTextContent
  beforeEach(() => {
    wrapperElement = fixture('my-fixture')
    pageManagerElement = wrapperElement.$['page-manager-element']
    getElement = selector => pageManagerElement.querySelector(selector)
    getTextContent = selector => {
      const element = getElement(selector);
      if (element) { return element.textContent }
    }
    getShadowTextContent = selector => {
      const element = getElement(selector);
      if (element) { return element.shadowRoot.textContent }
    }
  })

  describe('__getTemplate()', () =>{
    it('finds existing template', () => {
      const homeTemplate = pageManagerElement.querySelector('[name="home"]')
      expect(pageManagerElement.__getTemplate('home')).to.equal(homeTemplate)
    })

    it('returns undefined when template does not exist', () => {
      expect(pageManagerElement.__getTemplate('nonexistent')).to.be.undefined
    })
  })

  describe('__getTemplateConstructor()', () =>{
    it('creates a single constructor for each template', () => {
      const ctor = pageManagerElement.__getTemplateConstructor('home')
      assert(TemplateInstanceBase.prototype.isPrototypeOf(ctor.prototype))

      expect(pageManagerElement.__getTemplateConstructor('home')).to.equal(ctor)
      expect(pageManagerElement.__getTemplateConstructor('post')).to.not.equal(ctor)
    })
  })

  it('can insert a simple page', () => {
    const homePage = pageManagerElement._createPage('home')
    homePage.insertBefore(null)
    expect(getElement('.home-page')).to.exist
    expect(getElement('.home-page > h1').textContent).to.equal('Home')
    homePage.remove()
    expect(getElement('.home-page')).to.be.null
  })

  it('change to template variable while page is attached', async () => {
    const title = 'My Post'
    const content = 'Uh... content, yo'
    const comment1 = { author: 'Josef', content: 'Awesome' }
    const pageVar = { data: { title, content, comments: [comment1] } }

    const page = pageManagerElement._createPage('post')
    page.pageVar = pageVar
    page.insertBefore(null)
    await pause()

    expect(getElement('.post-page')).to.exist
    expect(getTextContent('.post-page > h1')).to.equal(title)
    expect(getTextContent('.post-page > div')).to.equal(content)
    expect(getTextContent('.post-page > .comments > li:nth-child(1)'))
      .to.equal(comment1.author + ': ' + comment1.content)

    const comment2 = { author: 'MajorBreakfast', content: 'Perfect' }
    pageVar.data.comments.push(comment2)
    const change = { indexSplices: [{ index: 1, removed: [], addedCount: 1 }] }
    page.forwardPageVarChange('data.comments.splices', change)
    await pause()

    expect(getTextContent('.post-page > .comments > li:nth-child(2)'))
      .to.equal(comment2.author + ': ' + comment2.content)
  })

  it('syncs host properties (host → page)', () => {
    // Set value, create and insert page
    wrapperElement.prop = 'v1'
    const page = pageManagerElement._createPage('value')
    page.insertBefore(null)
    const pageElement = page.element
    expect(getElement('.value-page').prop).to.equal('v1')

    // Change value
    wrapperElement.prop = 'v2'
    expect(getElement('.value-page').prop).to.equal('v2')

    // Change value while page is removed => Expect property to NOT sync!
    page.remove()
    wrapperElement.prop = 'v3'
    expect(page.element.prop).to.equal('v2')

    // Insert page, property should now be synced now
    page.insertBefore(null)
    expect(page.element).to.equal(pageElement) // Same element is reused
    expect(getElement('.value-page').prop).to.equal('v3')
  })

  it('syncs nested host properties (host → page)', async () => {
    // Set value, create and insert page
    const obj1 = { a: { b: 'v1' } }
    wrapperElement.prop = obj1
    const page = pageManagerElement._createPage('subproperty')
    page.insertBefore(null)
    const pageElement = page.element
    expect(getShadowTextContent('.subproperty-page x-prop')).to.equal('v1')
    expect(getShadowTextContent('.subproperty-page x-subprop')).to.equal('v1')

    // Change value
    wrapperElement.set('prop.a.b', 'v2')
    expect(getShadowTextContent('.subproperty-page x-prop')).to.equal('v2')
    expect(getShadowTextContent('.subproperty-page x-subprop')).to.equal('v2')

    // Non-deep change value while page is removed => Expect NO sync
    page.remove()
    const obj2 = { a: { b: 'v3' } }
    wrapperElement.prop = obj2
    expect(page.element.querySelector('x-prop').shadowRoot.textContent).to.equal('v2')
    expect(page.element.querySelector('x-subprop').prop).to.equal(obj1)
    expect(page.element.querySelector('x-subprop').shadowRoot.textContent).to.equal('v2')

    // Deep change while page is removed => Expect sync
    wrapperElement.set('prop.a.b', 'v4')
    expect(page.element.querySelector('x-prop').shadowRoot.textContent).to.equal('v4')
    expect(page.element.querySelector('x-subprop').prop).to.equal(obj2)
    expect(page.element.querySelector('x-subprop').shadowRoot.textContent).to.equal('v4')

    // Deep change while page is removed (again) => Expect sync
    // There's an internal difference if a non-deep change was delayed previously
    wrapperElement.set('prop.a.b', 'v5')
    expect(page.element.querySelector('x-prop').shadowRoot.textContent).to.equal('v5')
    expect(page.element.querySelector('x-subprop').prop).to.equal(obj2)
    expect(page.element.querySelector('x-subprop').shadowRoot.textContent).to.equal('v5')

    // Insert page
    page.insertBefore(null)
    expect(page.element).to.equal(pageElement) // Same element is reused
    expect(getShadowTextContent('.subproperty-page x-prop')).to.equal('v5')
    expect(getShadowTextContent('.subproperty-page x-subprop')).to.equal('v5')
  }).timeout(100000)

  it('syncs host properties (host ← page)', () => {
    // Create and insert page, set value on page
    const page = pageManagerElement._createPage('value')
    page.insertBefore(null)
    page.element.prop = 'v1'
    const pageElement = page.element
    expect(wrapperElement.prop).to.equal('v1')

    // Change page value while page is removed (should sync as well)
    page.remove()
    page.element.prop = 'v2'
    expect(wrapperElement.prop).to.equal('v2')
  })

  it('syncs nested host properties (host ← page)', () => {
    // Create and insert page
    const obj1 = { a: { b: 'v1' } }
    wrapperElement.prop = obj1
    const page = pageManagerElement._createPage('subproperty')
    page.insertBefore(null)
    expect(wrapperElement.prop).to.equal(obj1)
    expect(wrapperElement.prop.a.b).to.equal('v1')

    // Set value on page and expect sync
    page.element.querySelector('x-prop').prop = 'v2'
    expect(wrapperElement.prop).to.equal(obj1)
    expect(wrapperElement.prop.a.b).to.equal('v2')

    // Set value on page and expect sync
    page.element.querySelector('x-subprop').prop.a.b = 'v3'
    expect(wrapperElement.prop).to.equal(obj1)
    expect(wrapperElement.prop.a.b).to.equal('v3')

    // Set value on page and expect sync
    const obj2 = { a: { b: 'v4' } }
    page.element.querySelector('x-subprop').prop = obj2
    expect(wrapperElement.prop).to.equal(obj2)
    expect(wrapperElement.prop.a.b).to.equal('v4')

    page.remove()

    // Set value on page and expect sync
    page.element.querySelector('x-prop').prop = 'v5'
    expect(wrapperElement.prop).to.equal(obj2)
    expect(wrapperElement.prop.a.b).to.equal('v5')

    // Set value on page and expect sync
    page.element.querySelector('x-subprop').prop.a.b = 'v6'
    expect(wrapperElement.prop).to.equal(obj2)
    expect(wrapperElement.prop.a.b).to.equal('v6')

    // Set value on page and expect sync
    const obj3 = { a: { b: 'v7' } }
    page.element.querySelector('x-subprop').prop = obj3
    expect(wrapperElement.prop).to.equal(obj3)
    expect(wrapperElement.prop.a.b).to.equal('v7')
  })

  it('syncs host properties (page1 ↔ host ↔ page2)', () => {
    // Set value on host, create and insert page
    wrapperElement.prop = 'v1'
    const page1 = pageManagerElement._createPage('value')
    const page2 = pageManagerElement._createPage('value')
    page1.insertBefore(null)
    page2.insertBefore(null)
    expect(wrapperElement.prop).to.equal('v1')
    expect(getElement(':nth-last-child(2)').prop).to.equal('v1')
    expect(getElement(':nth-last-child(1)').prop).to.equal('v1')

    // Change page1's value
    page1.element.set('prop', 'v2')
    expect(wrapperElement.prop).to.equal('v2')
    expect(getElement(':nth-last-child(2)').prop).to.equal('v2')
    expect(getElement(':nth-last-child(1)').prop).to.equal('v2')

    // Change page2's value
    page2.element.set('prop', 'v3')
    expect(wrapperElement.prop).to.equal('v3')
    expect(getElement(':nth-last-child(2)').prop).to.equal('v3')
    expect(getElement(':nth-last-child(1)').prop).to.equal('v3')
  })

  it('syncs nested host properties (page1 ↔ host ↔ page2)', () => {
    // Set value on host, create and insert page
    wrapperElement.prop = { a: { b: 'v1' } }
    const page1 = pageManagerElement._createPage('subproperty')
    const page2 = pageManagerElement._createPage('subproperty')
    page1.insertBefore(null)
    page2.insertBefore(null)
    expect(getShadowTextContent(':nth-last-child(2) x-prop')).to.equal('v1')
    expect(getShadowTextContent(':nth-last-child(1) x-prop')).to.equal('v1')
    expect(wrapperElement.prop.a.b).to.equal('v1')

    // Change page1's value
    page2.element.querySelector('x-prop').prop = 'v2'
    expect(getShadowTextContent(':nth-last-child(2) x-prop')).to.equal('v2')
    expect(getShadowTextContent(':nth-last-child(1) x-prop')).to.equal('v2')
    expect(wrapperElement.prop.a.b).to.equal('v2')

    // Change page2's value
    page2.element.querySelector('x-prop').prop = 'v3'
    expect(getShadowTextContent(':nth-last-child(2) x-prop')).to.equal('v3')
    expect(getShadowTextContent(':nth-last-child(1) x-prop')).to.equal('v3')
    expect(wrapperElement.prop.a.b).to.equal('v3')
  })
})
