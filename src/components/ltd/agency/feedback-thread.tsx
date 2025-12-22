"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { LtdButton } from "@/components/ltd/primitives/ltd-button"
import { LtdTextarea } from "@/components/ltd/primitives/ltd-textarea"
import { formatDate } from "@/lib/format/date"

export interface FeedbackMessage {
  id: string
  author: string
  message: string
  timestamp: string
  resolved?: boolean
  actionRequired?: boolean
}

interface FeedbackThreadProps {
  messages: FeedbackMessage[]
  onReply?: (message: string) => void
  onResolve?: (messageId: string) => void
}

export function FeedbackThread({ messages, onReply, onResolve }: FeedbackThreadProps) {
  const [replyText, setReplyText] = useState("")

  const handleReply = () => {
    if (replyText.trim() && onReply) {
      onReply(replyText)
      setReplyText("")
    }
  }

  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <Card
          key={message.id}
          className={`p-4 rounded-[var(--ltd-radius-lg)] ${
            message.resolved
              ? "bg-ltd-success-bg border-ltd-success"
              : message.actionRequired
                ? "bg-ltd-warning-bg border-ltd-warning"
                : "bg-ltd-surface-overlay border-ltd-border-1"
          }`}
        >
          <div className="flex items-start justify-between mb-2">
            <div>
              <span className="font-medium text-ltd-text-1">{message.author}</span>
              {message.actionRequired && !message.resolved && (
                <span className="ms-2 text-xs px-2 py-0.5 bg-ltd-warning text-ltd-text-1 rounded-full">
                  Action Required
                </span>
              )}
              {message.resolved && (
                <span className="ms-2 text-xs px-2 py-0.5 bg-ltd-success text-white rounded-full">Resolved</span>
              )}
            </div>
            <span className="text-xs text-ltd-text-3">{formatDate(message.timestamp, "relative")}</span>
          </div>
          <p className="text-sm text-ltd-text-1 mb-3">{message.message}</p>
          {!message.resolved && onResolve && (
            <LtdButton size="sm" variant="outline" onClick={() => onResolve(message.id)}>
              Mark Resolved
            </LtdButton>
          )}
        </Card>
      ))}

      {onReply && (
        <Card className="p-4 bg-ltd-surface-overlay border-ltd-border-1 rounded-[var(--ltd-radius-lg)]">
          <LtdTextarea
            placeholder="Add your feedback or response..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            rows={3}
            className="mb-3"
          />
          <LtdButton onClick={handleReply} disabled={!replyText.trim()}>
            Send Reply
          </LtdButton>
        </Card>
      )}
    </div>
  )
}
