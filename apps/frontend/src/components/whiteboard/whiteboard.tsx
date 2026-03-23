/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { Tldraw } from "tldraw"
import "tldraw/tldraw.css"
import { useEffect, useState } from "react"
import { setCanvasEventHandler } from "@/lib/websocket"
import { handleCanvasChange } from "./CanvasAdapter"
import { useSession, type ModeType } from "@/context/session-context"

interface Props {
  sessionId: string
  userId: string
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"

export default function Whiteboard({ sessionId, userId }: Props) {
  // Mode is owned by SessionProvider — no local duplicate state
  const { mode, setMode } = useSession()
  const [editorInstance, setEditorInstance] = useState<any>(null)

  // Sync the actual session mode from the backend once on mount.
  // SessionProvider keeps it live via WS after this.
  useEffect(() => {
    fetch(`${API_URL}/api/mode/${sessionId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.mode) setMode(data.mode as ModeType)
      })
      .catch(() => {})
  }, [sessionId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Apply remote canvas changes sent by other peers.
  // Uses mergeRemoteChanges so Tldraw marks them as remote and
  // the { source: 'user' } store listener below won't re-broadcast them.
  useEffect(() => {
    if (!editorInstance) return

    setCanvasEventHandler((payload) => {
      if (!payload?.changes) return
      const { added, updated, removed } = payload.changes

      editorInstance.store.mergeRemoteChanges(() => {
        const toPut = [
          ...Object.values(added ?? {}),
          // updated is Record<id, [fromRecord, toRecord]> — we only need "to"
          ...Object.values(updated ?? {}).map(([, to]: [any, any]) => to),
        ]
        const toRemove = Object.keys(removed ?? {})

        if (toPut.length > 0) editorInstance.store.put(toPut)
        if (toRemove.length > 0) editorInstance.store.remove(toRemove)
      })
    })

    return () => {
      // Unregister on unmount so stale closures don't hold the editor ref
      setCanvasEventHandler(null)
    }
  }, [editorInstance])

  // Keep Tldraw read-only state in sync with governance mode
  useEffect(() => {
    if (!editorInstance) return
    editorInstance.updateInstanceState({ isReadonly: mode === "LOCKED" })
  }, [mode, editorInstance])

  return (
    <div className="relative w-full h-full">
      {mode === "LOCKED" && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-500 text-white px-6 py-2 rounded-lg z-50">
          Session Locked
        </div>
      )}

      <Tldraw
        onMount={(editor) => {
          setEditorInstance(editor)

          // Only listen to user-initiated changes to avoid re-broadcasting
          // changes that came in from remote peers via mergeRemoteChanges.
          editor.store.listen(
            (update) => {
              handleCanvasChange(update, sessionId, userId)
            },
            { source: "user" },
          )
        }}
      />
    </div>
  )
}
