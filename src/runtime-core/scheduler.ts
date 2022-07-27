const queue: any = []
const p = Promise.resolve()
let isFlushPending = false

export function nextTick(fn) {
  return fn ? p.then(fn) : p
}

export function queueJobs(job) {
  if (!queue.includes(job))
    queue.push(job)

  queueFlush()
}

export function queueFlush() {
  if (isFlushPending) return

  isFlushPending = true

  nextTick(flushJobs)
}

export function flushJobs() {
  isFlushPending = false
  let job
  // eslint-disable-next-line no-cond-assign
  while (job = queue.shift())
    job && job()
}
