"use client"

import { Tldraw, useEditor } from "tldraw"
import "tldraw/tldraw.css"
import { useEffect } from "react"
import { connectWebSocket } from "@/lib/websocket"
import { handleCanvasChange } from "./CanvasAdapter"

interface Props {
  sessionId: string
  userId: string
}

export default function Whiteboard({ sessionId, userId }: Props) {

  useEffect(() => {
    connectWebSocket(sessionId, userId)
  }, [sessionId, userId])

  return (
    <div className="w-screen h-screen">
      <Tldraw
        onMount={(editor) => {
          editor.store.listen((update) => {
            handleCanvasChange(update, sessionId, userId)
          })
        }}
      />
    </div>
  )
}
