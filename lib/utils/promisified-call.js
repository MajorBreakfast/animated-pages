export default function promisifiedCall (fn, ...args) {
  let done
  const donePromise = new Promise((resolve, reject) => {
    done = (error, value) => {
      if (error) { reject(error) } else { resolve(value) }
    }
  })

  const fnPromise = fn(...args, done)
  if (fnPromise && fnPromise.then) {
    donePromise.then(
      () => { console.warn('Do not call done() if you return a promise') },
      () => { console.warn('Do not call done() if you return a promise') }
    )
    return fnPromise
  } else {
    return donePromise
  }
}
