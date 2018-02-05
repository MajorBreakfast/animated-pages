/**
 * Checks wether the specified element is visible. An element is for example
 * invisible if it or one of its anchestors has `display: none` set.
 * @param {*} element Element whose visibility is checked
 */
export default function isVisible (element) { // From jQuery source
  const e = element
  return !!(e.offsetWidth || e.offsetHeight || e.getClientRects().length)
}
