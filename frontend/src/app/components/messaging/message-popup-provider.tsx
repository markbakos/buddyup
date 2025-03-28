"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import { MessagePopup, type MessagePopupProps } from "./message-popup"

interface MessagePopupContextType {
  /**
   * Open the message popup with the given props
   */
  openMessagePopup: (props: Omit<MessagePopupProps, "open" | "onClose">) => void

  /**
   * Close the message popup
   */
  closeMessagePopup: () => void
}

const MessagePopupContext = createContext<MessagePopupContextType | undefined>(undefined)
export function MessagePopupProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [popupProps, setPopupProps] = useState<Omit<MessagePopupProps, "open" | "onClose"> | null>(null)

  const openMessagePopup = (props: Omit<MessagePopupProps, "open" | "onClose">) => {
    setPopupProps(props)
    setIsOpen(true)
  }

  const closeMessagePopup = () => {
    setIsOpen(false)
  }

  return (
    <MessagePopupContext.Provider value={{ openMessagePopup, closeMessagePopup }}>
      {children}
      {popupProps && <MessagePopup open={isOpen} onClose={closeMessagePopup} {...popupProps} />}
    </MessagePopupContext.Provider>
  )
}

export function useMessagePopup() {
  const context = useContext(MessagePopupContext)

  if (context === undefined) {
    throw new Error("useMessagePopup must be used within a MessagePopupProvider")
  }

  return context
}

