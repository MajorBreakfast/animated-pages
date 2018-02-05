import '../../../../@polymer/polymer/polymer.js'
import './elements/x-wrapper.js'
import { TemplateInstanceBase } from '../../../../@polymer/polymer/lib/utils/templatize.js'
import pause from '../../utils/pause.js'

describe('PageManager', () => {
  let wrapperElement, pageManagerElement, getElement, getTextContent
  beforeEach(() => {
    wrapperElement = fixture('my-fixture')
    document.body.appendChild(wrapperElement)
    pageManagerElement = wrapperElement.$['page-manager-element']
    getElement = selector => pageManagerElement.querySelector(selector)
    getTextContent = x => getElement(x) ? getElement(x).textContent : undefined
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
    wrapperElement.prop = 'value1'
    const page = pageManagerElement._createPage('value')
    page.insertBefore(null)
    const pageElement = page.element
    expect(getElement('.value-page').prop).to.equal('value1')

    // Change value
    wrapperElement.prop = 'value2'
    expect(getElement('.value-page').prop).to.equal('value2')

    // Change value while page is removed => Expect property to NOT sync!
    page.remove()
    wrapperElement.prop = 'value3'
    expect(page.element.prop).to.equal('value2')

    // Insert page, property should now be synced now
    page.insertBefore(null)
    expect(page.element).to.equal(pageElement) // Same element is reused
    expect(getElement('.value-page').prop).to.equal('value3')
  })

  it('syncs nested host properties (host → page)', () => {
    // Set value, create and insert page
    wrapperElement.prop = { a: { b: 'value1' } }
    const page = pageManagerElement._createPage('subproperty')
    page.insertBefore(null)
    const pageElement = page.element
    expect(getElement('.subproperty-page').prop).to.equal('value1')

    // Change value
    wrapperElement.set('prop.a.b', 'value2')
    expect(getElement('.subproperty-page').prop).to.equal('value2')

    // Change value while page is removed => Expect property to NOT sync!
    page.remove()
    wrapperElement.set('prop.a.b', 'value3')
    expect(page.element.prop).to.equal('value2')

    // Insert page, property should now be synced now
    page.insertBefore(null)
    expect(page.element).to.equal(pageElement) // Same element is reused
    expect(getElement('.subproperty-page').prop).to.equal('value3')
  })

  it('syncs host properties (host ← page)', () => {
    // Create and insert page, set value on page
    const page = pageManagerElement._createPage('value')
    page.insertBefore(null)
    page.element.prop = 'value1'
    const pageElement = page.element
    expect(wrapperElement.prop).to.equal('value1')

    // Change page value while page is removed (should sync as well)
    page.remove()
    page.element.prop = 'value2'
    expect(wrapperElement.prop).to.equal('value2')
  })

  it('syncs nested host properties (host ← page)', () => {
    // Create and insert page, set value on page
    wrapperElement.prop = { a: { b: 'initial value' } }
    const page = pageManagerElement._createPage('subproperty')
    page.insertBefore(null)
    page.element.prop = 'value1'
    const pageElement = page.element
    expect(wrapperElement.prop.a.b).to.equal('value1')

    // Change page value while page is removed (should sync as well)
    page.remove()
    page.element.prop = 'value2'
    expect(wrapperElement.prop.a.b).to.equal('value2')
  })

  it('syncs host properties (page1 ↔ host ↔ page2)', () => {
    // Set value, create and insert page
    wrapperElement.prop = 'value1'
    const page1 = pageManagerElement._createPage('value')
    const page2 = pageManagerElement._createPage('value')
    page1.insertBefore(null)
    page2.insertBefore(null)
    expect(wrapperElement.prop).to.equal('value1')
    expect(getElement(':nth-last-child(2)').prop).to.equal('value1')
    expect(getElement(':nth-last-child(1)').prop).to.equal('value1')

    // Change value
    page1.element.set('prop', 'value2')
    expect(wrapperElement.prop).to.equal('value2')
    expect(getElement(':nth-last-child(2)').prop).to.equal('value2')
    expect(getElement(':nth-last-child(1)').prop).to.equal('value2')

    // Change value
    page2.element.set('prop', 'value3')
    expect(wrapperElement.prop).to.equal('value3')
    expect(getElement(':nth-last-child(2)').prop).to.equal('value3')
    expect(getElement(':nth-last-child(1)').prop).to.equal('value3')
  })

  it('syncs nested host properties (page1 ↔ host ↔ page2)', () => {
    // Set value, create and insert page
    wrapperElement.prop = { a: { b: 'value1' } }
    const page1 = pageManagerElement._createPage('subproperty')
    const page2 = pageManagerElement._createPage('subproperty')
    page1.insertBefore(null)
    page2.insertBefore(null)
    expect(getElement(':nth-last-child(2)').prop).to.equal('value1')
    expect(getElement(':nth-last-child(1)').prop).to.equal('value1')
    expect(wrapperElement.prop.a.b).to.equal('value1')

    // Change value
    page1.element.set('prop', 'value2')
    expect(getElement(':nth-last-child(2)').prop).to.equal('value2')
    expect(getElement(':nth-last-child(1)').prop).to.equal('value2')
    expect(wrapperElement.prop.a.b).to.equal('value2')

    // Change value
    page2.element.set('prop', 'value3')
    expect(getElement(':nth-last-child(2)').prop).to.equal('value3')
    expect(getElement(':nth-last-child(1)').prop).to.equal('value3')
    expect(wrapperElement.prop.a.b).to.equal('value3')
  })
})
