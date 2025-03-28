"use client"

import { useState } from "react"
import { Button, type ButtonProps } from "@/components/ui/button"
import { MessagePopup } from "@/app/components/messaging/message-popup"
import { Send } from "lucide-react"
import api from "@/lib/api"
import { ShortUser } from "@/types/user"

interface MessageButtonProps extends ButtonProps {
  recipient: ShortUser
  messageType: "message" | "applying"
  initialContent?: string
  jobTitle?: string
  onMessageSent?: () => void
}

export function MessageButton({
  recipient,
  messageType = "message",
  initialContent = "",
  jobTitle,
  onMessageSent,
  children,
  ...props
}: MessageButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleSendMessage = async (data: {
    receiverId: string
    content: string
    type: "message" | "applying"
    jobTitle?: string | null
  }) => {
    try {
      await api.post("/messages", data)

      if (onMessageSent) {
        onMessageSent()
      }

      return Promise.resolve()
    } catch (error) {
      console.error("Error sending message:", error)
      return Promise.reject(error)
    }
  }

  return (
    <>
      <Button onClick={() => setIsOpen(true)} {...props}>
        {children || (
          <>
            <Send className="h-4 w-4 mr-2" />
            Message
          </>
        )}
      </Button> 

      <MessagePopup
        open={isOpen}
        onClose={() => setIsOpen(false)}
        recipient={recipient}
        messageType={messageType}
        initialContent={initialContent}
        metadata={{ jobTitle }}
        onSend={handleSendMessage}
      />
    </>
  )
}

