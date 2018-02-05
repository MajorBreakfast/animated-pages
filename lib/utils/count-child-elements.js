/**
 * Returns the number of child elements of the specified node. Also works
 * on `DocumentFragment`s (No `firstElementChild` property in Internet
 * Explorer).
 * @param {*} node
 */
export default function countChildElements (node) {
  let count = 0
  for (let child = node.firstChild; child; child = child.nextSibling) {
    if (child.nodeType === Node.ELEMENT_NODE) { count += 1 }
  }
  return count
}
