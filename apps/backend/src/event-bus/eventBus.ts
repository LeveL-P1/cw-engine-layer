type Event = {
  type: string
  sessionId: string
  userId: string
  payload: any
}

const subscribers: ((event: Event) => void)[] = []

export function publishEvent(event: Event) {
  for (const sub of subscribers) {
    sub(event)
  }
}

export function subscribe(handler: (event: Event) => void) {
  subscribers.push(handler)
}
