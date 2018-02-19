export default function pause (duration = 0) {
  if (duration === 'requestAnimationFrame') {
    return new Promise(resolve => { requestAnimationFrame(resolve) })
  } else {
    return new Promise(resolve => { setTimeout(resolve, duration) })
  }
}
