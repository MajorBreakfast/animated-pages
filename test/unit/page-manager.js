import '../../../@polymer/polymer/polymer.js'
import './elements/wrapper-element.js'
import './elements/page-manager-element.js'
import { TemplateInstanceBase } from '../../../@polymer/polymer/lib/utils/templatize.js'
import pause from '../utils/pause.js'

describe('PageManager', () => {
  let wrapperElement, pageManagerElement, pageManager
  let getElement, getTextContent
  beforeEach(() => {
    wrapperElement = fixture('fixture1')
    pageManagerElement = wrapperElement.$['page-manager-element']
    pageManager = pageManagerElement.pageManager
    getElement = selector => pageManagerElement.querySelector(selector)
    getTextContent = x => getElement(x) ? getElement(x).textContent : undefined
  })

  describe('__getTemplate()', () =>{
    it('finds existing template', () => {
      const homeTemplate = pageManagerElement.querySelector('[name="home"]')
      expect(pageManager.__getTemplate('home')).to.equal(homeTemplate)
    })

    it('returns undefined when template does not exist', () => {
      expect(pageManager.__getTemplate('nonexistent')).to.be.undefined
    })
  })

  describe('__getTemplateConstructor()', () =>{
    it('creates a single constructor for each template', () => {
      const ctor = pageManager.__getTemplateConstructor('home')
      assert(TemplateInstanceBase.prototype.isPrototypeOf(ctor.prototype))

      expect(pageManager.__getTemplateConstructor('home')).to.equal(ctor)
      expect(pageManager.__getTemplateConstructor('post')).to.not.equal(ctor)
    })
  })

  it('can insert a simple page', () => {
    const homePage = pageManager.createPage('home')
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

    const postPage = pageManager.createPage('post')
    postPage.templateVariable = pageVar
    postPage.insertBefore(null)
    await pause()

    expect(getElement('.post-page')).to.exist
    expect(getTextContent('.post-page > h1')).to.equal(title)
    expect(getTextContent('.post-page > div')).to.equal(content)
    expect(getTextContent('.post-page > .comments > li:nth-child(1)'))
      .to.equal(comment1.author + ': ' + comment1.content)

    const comment2 = { author: 'MajorBreakfast', content: 'Perfect' }
    pageVar.data.comments.push(comment2)
    const change = { indexSplices: [{ index: 1, removed: [], addedCount: 1 }] }
    postPage.forwardTemplateVariableChange('data.comments.splices', change)
    await pause()

    expect(getTextContent('.post-page > .comments > li:nth-child(2)'))
      .to.equal(comment2.author + ': ' + comment2.content)
  })

  it('propagates a host property', () => {
    wrapperElement.testValue = 'value1'
    const page = pageManager.createPage('value')
    page.insertBefore(null)
    expect(getTextContent('.value-page')).to.equal('value1')

    wrapperElement.testValue = 'value2'
    expect(getTextContent('.value-page')).to.equal('value2')

    page.remove()
    wrapperElement.testValue = 'value3'
    expect(page.element.textContent).to.equal('value2')

    page.insertBefore(null)
    expect(getTextContent('.value-page')).to.equal('value3')
  })

  it('propagates a nested host property', () => {
    wrapperElement.testValue = { prop:  { subprop:  'value1' } }
    const page = pageManager.createPage('subproperty')
    page.insertBefore(null)
    const pageElement = page.element
    expect(getTextContent('.subproperty-page')).to.equal('value1')

    wrapperElement.set('testValue.prop.subprop', 'value2')
    expect(getTextContent('.subproperty-page')).to.equal('value2')

    page.remove() // Keep the element
    wrapperElement.set('testValue.prop.subprop', 'value3')
    expect(page.element.textContent).to.equal('value2')

    page.insertBefore(null)
    expect(page.element).to.equal(pageElement)
    expect(getTextContent('.subproperty-page')).to.equal('value3')
  })
})
