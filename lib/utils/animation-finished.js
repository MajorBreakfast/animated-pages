/**
 * Makes a promise from an animation.
 * Similar to `Animation#finished` which is still experimental.
 */
export default function animationFinished (animation) {
  if (animation.finished) { return animation.finished }

  return new Promise((resolve, reject) => {
    animation.onfinish = resolve
    animation.oncancel = reject
  })
}
