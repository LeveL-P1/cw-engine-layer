import express from "express"
import http from "http"
import { WebSocketServer } from "ws"
import { setupWebSocket } from "./websocket/connectionManager"
import { initTelemetry } from "./telemetry/telemetryEngine"
import { createSnapshot } from "./telemetry/metricsSnapshotService"
import { getAllSessionIds } from "./telemetry/telemetryEngine"
import { subscribe } from "./event-bus/eventBus"
import { persistEvent } from "./services/eventService"
import analyticsRoutes from "./routes/analyticsRoutes"
import sessionRoutes from "./routes/sessionRoutes"
import authRoutes from "./routes/authRoutes"
import { authMiddleware } from "./middleware/authMiddleware"
import cors from "cors"


const app = express()
const server = http.createServer(app)

const wss = new WebSocketServer({ server })

setupWebSocket(wss)
initTelemetry()
subscribe(persistEvent)


app.use(cors({
  origin: "http://localhost:3000"
}))

app.use(express.json())

app.use("/api/auth", authRoutes)

const authEnabled = Boolean(process.env.JWT_SECRET)

if (authEnabled) {
  app.use("/api", authMiddleware, analyticsRoutes)
  app.use("/api/sessions", authMiddleware, sessionRoutes)
} else {
  app.use("/api", analyticsRoutes)
  app.use("/api/sessions", sessionRoutes)
}

setInterval(async () => {
  const sessionIds = getAllSessionIds()
  for (const id of sessionIds) {
    await createSnapshot(id)
  }
}, 60000)

app.get("/health", (_, res) => {
  res.json({ status: "ok" })
})

server.listen(4000, () => {
  console.log("Server running on port 4000")
})

