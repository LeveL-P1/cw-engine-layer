export type SystemEvent = {
  type: "CANVAS_EVENT"
  sessionId: string
  userId: string
  payload: any
  timestamp: number
}

type Subscriber = (event: SystemEvent) => void

const subscribers: Subscriber[] = []

export function publishEvent(event: SystemEvent) {
  for (const sub of subscribers) {
    sub(event)
  }
}

export function subscribe(handler: Subscriber) {
  subscribers.push(handler)
}
