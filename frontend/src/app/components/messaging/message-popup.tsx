"use client"

import { useState, useEffect } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Send, Eye, ArrowLeft, Briefcase, Loader2, AlertCircle } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {ShortUser} from "@/types/user"

const messageSchema = z.object({
  content: z
    .string()
    .min(1, { message: "Message content is required." })
    .max(2000, { message: "Message content must not exceed 2000 characters." }),
  type: z.enum(["message", "applying"]).default("message"),
  jobTitle: z.string().optional(),
})

type MessageFormValues = z.infer<typeof messageSchema>

export interface MessagePopupProps {
  /**
   * Whether the popup is open
   */
  open: boolean

  /**
   * Function to call when the popup is closed
   */
  onClose: () => void

  /**
   * The type of message being sent
   * @default "message"
   */
  messageType?: "message" | "applying"

  /**
   * Information about the recipient
   */
  recipient: ShortUser

  /**
   * Pre-populated content for the message
   */
  initialContent?: string

  /**
   * Additional metadata for the message
   */
  metadata?: Record<string, any>

  /**
   * Function to call when the message is sent
   * @param data The message data
   */
  onSend: (data: {
    receiverId: string
    content: string
    type: "message" | "applying"
    jobTitle?: string | null
  }) => Promise<void>

  /**
   * Title for the popup
   * @default "Send Message"
   */
  title?: string

  /**
   * Description for the popup
   */
  description?: string
}

export function MessagePopup({
  open,
  onClose,
  messageType = "message",
  recipient,
  initialContent = "",
  metadata = {},
  onSend,
  title = "Send Message",
  description,
}: MessagePopupProps) {
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<MessageFormValues>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      content: initialContent,
      type: messageType,
      jobTitle: metadata.jobTitle || recipient.jobTitle || "",
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        content: initialContent,
        type: messageType,
        jobTitle: metadata.jobTitle || recipient.jobTitle || "",
      })
      setIsPreviewMode(false)
      setError(null)
    }
  }, [open, initialContent, messageType, metadata, recipient, form])

  const onSubmit = async (data: MessageFormValues) => {
    try {
      setIsSending(true)
      setError(null)

      const messageData = {
        receiverId: recipient.id,
        content: data.content,
        type: data.type,
        jobTitle: data.jobTitle || null,
      }

      await onSend(messageData)

      onClose()
    } catch (e) {
      console.error("Error sending message:", e)
      setError(e instanceof Error ? e.message : "Failed to send message. Please try again.")
    } finally {
      setIsSending(false)
    }
  }

  const togglePreview = () => {
    setIsPreviewMode(!isPreviewMode)
  }

  const defaultDescription = description || `Send a message to ${recipient.name}`

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isPreviewMode ? (
              <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={togglePreview}>
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back to edit</span>
              </Button>
            ) : null}
            {isPreviewMode ? "Message Preview" : title}
          </DialogTitle>
          <DialogDescription>{defaultDescription}</DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-4 py-2">
          <Avatar className="h-12 w-12 border-2 border-white shadow">
            <AvatarFallback className="bg-primary text-white">{recipient.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium">{recipient.name}</h3>
            <p className="text-sm text-muted-foreground">{recipient.email}</p>
            {recipient.jobTitle && (
              <div className="flex items-center gap-1 mt-1">
                <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{recipient.jobTitle}</span>
              </div>
            )}
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isPreviewMode ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="capitalize">
                {form.getValues("type")}
              </Badge>
              {form.getValues("type") === "applying" && form.getValues("jobTitle") && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Briefcase className="h-3.5 w-3.5" />
                  {form.getValues("jobTitle")}
                </Badge>
              )}
            </div>
            <div className="border rounded-md p-4 bg-muted/20 whitespace-pre-wrap">{form.getValues("content")}</div>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Write your message here..." className="min-h-32 resize-none" {...field} />
                    </FormControl>
                    <FormDescription className="flex justify-between">
                      <span>Your message can be up to 2000 characters.</span>
                      <span className={field.value.length > 2000 ? "text-destructive" : ""}>
                        {field.value.length}/2000
                      </span>
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        )}

        <DialogFooter className="flex justify-between sm:justify-between">
          <div>
            {!isPreviewMode && (
              <Button
                type="button"
                variant="outline"
                onClick={togglePreview}
                disabled={!form.getValues("content") || isSending}
                className="flex items-center gap-1"
              >
                <Eye className="h-4 w-4" />
                Preview
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSending}>
              Cancel
            </Button>
            {isPreviewMode ? (
              <Button
                type="button"
                onClick={form.handleSubmit(onSubmit)}
                disabled={isSending}
                className="flex items-center gap-1"
              >
                {isSending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Send
                  </>
                )}
              </Button>
            ) : (
              <Button
                type="button"
                onClick={togglePreview}
                disabled={!form.getValues("content") || isSending}
                className="flex items-center gap-1"
              >
                Next
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

