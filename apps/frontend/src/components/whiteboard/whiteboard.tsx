/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { Tldraw } from "tldraw"
import "tldraw/tldraw.css"
import { useEffect, useState } from "react"
import { connectWebSocket, setModeListener } from "@/lib/websocket"
import { handleCanvasChange } from "./CanvasAdapter"

interface Props {
  sessionId: string
  userId: string
}

export default function Whiteboard({ sessionId, userId }: Props) {

  const [mode, setMode] = useState<string>("FREE")
  const [editorInstance, setEditorInstance] = useState<any>(null)

  useEffect(() => {
    connectWebSocket(sessionId, userId)

    // Load initial mode
    fetch(`http://localhost:4000/api/mode/${sessionId}`)
      .then(res => res.json())
      .then(data => setMode(data.mode))

    setModeListener((newMode) => {
      setMode(newMode)
    })

  }, [sessionId, userId])

  // 🔹 Disable editing when LOCKED
  useEffect(() => {
    if (!editorInstance) return

    editorInstance.updateInstanceState({
      isReadonly: mode === "LOCKED"
    })

  }, [mode, editorInstance])

  return (
    <div className="relative w-screen h-screen">

      {mode === "LOCKED" && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-500 text-white px-6 py-2 rounded-lg z-50">
          Session Locked
        </div>
      )}

      <Tldraw
        onMount={(editor) => {
          setEditorInstance(editor)

          editor.store.listen((update) => {
            handleCanvasChange(update, sessionId, userId)
          })
        }}
      />
    </div>
  )
}