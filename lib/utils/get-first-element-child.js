/**
 * Returns the first element child of a node. Also works on `DocumentFragment`s
 * (No `firstElementChild` property in Internet Explorer).
 * @param {*} node
 */
export default function getFirstElementChild (node) {
  for (let child = node.firstChild; child; child = child.nextSibling) {
    if (child.nodeType === Node.ELEMENT_NODE) { return child }
  }
}
