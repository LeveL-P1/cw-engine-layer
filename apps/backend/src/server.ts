import express from "express"
import http from "http"
import { WebSocketServer } from "ws"
import { setupWebSocket } from "./websocket/connectionManager"
import { subscribe } from "./event-bus/eventBus"
import { persistEvent } from "./services/eventService"


const app = express()
const server = http.createServer(app)

const wss = new WebSocketServer({ server })

setupWebSocket(wss)

subscribe(async (event) => {
  await persistEvent(event)
})

app.get("/health", (_, res) => {
  res.json({ status: "ok" })
})

server.listen(4000, () => {
  console.log("Server running on port 4000")
})
