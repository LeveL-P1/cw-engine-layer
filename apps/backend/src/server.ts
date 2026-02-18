import express from "express"
import http from "http"
import { WebSocketServer } from "ws"
import { setupWebSocket } from "./websocket/connectionManager"
import { initTelemetry } from "./telemetry/telemetryEngine"
import { createSnapshot } from "./telemetry/metricsSnapshotService"
import analyticsRoutes from "./routes/analyticsRoutes"
import cors from "cors"


const app = express()
const server = http.createServer(app)

const wss = new WebSocketServer({ server })

setupWebSocket(wss)
initTelemetry()

app.use(cors({
  origin: "http://localhost:3000"
}))

app.use("/api", analyticsRoutes)

setInterval(async () => {
  await createSnapshot("session-1")
}, 60000)

app.get("/health", (_, res) => {
  res.json({ status: "ok" })
})

server.listen(4000, () => {
  console.log("Server running on port 4000")
})
