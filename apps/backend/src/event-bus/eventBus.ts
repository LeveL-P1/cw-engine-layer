export type SystemEvent = {
  type: "CANVAS_EVENT"
  sessionId: string
  userId: string
  payload: any
  timestamp: number
}

type Subscriber = (event: SystemEvent) => void

const subscribers: Subscriber[] = []

export function subscribe(handler: Subscriber) {
  subscribers.push(handler)
}

export function publishEvent(event: SystemEvent) {
  subscribers.forEach((handler) => handler(event))
}
