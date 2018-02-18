*Currently in development: Not ready for use (February 2018)*

# Animated Pages
The `<animated-pages>` element provides a flexible mechanism for animating
between different pages of a web app.

## Installation
**Polymer 3 only at the moment**
```
npm i animated-pages
```

## Documentation
Read the usage guide on the page for the [`<animated-pages>` Element](https://www.webcomponents.org/element/MajorBreakfast/animated-pages/elements/animated-pages).

## Comparison to other solutions
`<iron-pages>`:
- Not animated
- Pages aren't created lazily when they're needed

`<neon-animated-pages>`
- Animations are elements. This is a strange design decision
- Pages aren't created lazily when they're needed

`<iron-lazy-pages>`
- Not animated
- Lazy creation of pages is done through `<dom-if>`, thus a single template cannot be shared by multiple pages.

## Development
To get your development environment set up, clone this repository and run `npm install`.

Bug reports, feature proposals and pull requests are welcome!

### Visual Studio Code
Install the `lit-html` extension to get syntax highlighting for the `` html`...` `` templates strings in JavaScript. (Note that this project does not use lit-html itself)

### Tests
This project uses Web Component Tester to verify correct behavior across different browsers.
You can run the tests via `npm test`.

**Development tip:** You can also use `npx wct --npm --persistent`: `npx wct --npm` is the same command that runs on `npm test`. However, the `--persistent` option keeps the browser windows open - which means you can rerun the tests by refreshing the page.
