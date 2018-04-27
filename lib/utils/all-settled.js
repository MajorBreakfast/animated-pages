export default function allSettled (promises) {
  return Promise.all(promises.map(promise => promise.then(
    value => { return { value, state: 'fulfilled' } },
    reason => { return { reason, state: 'rejected' } }
  )))
}
