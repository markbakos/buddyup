"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { ChevronLeft, Plus, X, Tag, MapPin, Briefcase, Eye, Save, Trash2 } from "lucide-react"
import Header from "@/app/components/Header"
import api from "@/lib/api"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"

const adFormSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters." }),
  summary: z
    .string()
    .min(10, { message: "Summary must be at least 10 characters." })
    .max(200, { message: "Summary must not exceed 200 characters." }),
  description: z.string().min(30, { message: "Description must be at least 30 characters." }),
  location: z.string().min(2, { message: "Location is required." }),
  tags: z.array(z.string()).min(1, { message: "At least one tag is required." }),
  roles: z
    .array(
      z.object({
        name: z.string().min(2, { message: "Role name is required." }),
        isOpen: z.boolean().default(true),
      }),
    )
    .min(1, { message: "At least one role is required." }),
  metadata: z
    .object({
      prerequisites: z.string().optional(),
    })
    .optional(),
})

type AdFormValues = z.infer<typeof adFormSchema>

export default function CreateAdPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [newTag, setNewTag] = useState("")
  const [activeTab, setActiveTab] = useState("edit")

  const { data: session, status } = useSession()
  const router = useRouter()

  const form = useForm<AdFormValues>({
    resolver: zodResolver(adFormSchema),
    defaultValues: {
      title: "",
      summary: "",
      description: "",
      location: "",
      tags: [],
      roles: [{ name: "", isOpen: true }],
      metadata: {
        prerequisites: "",
      },
    },
  })

  useEffect(() => {
    if (status === "loading") {
      return
    }

    if (!session) {
      router.push("/auth/signin")
      return
    }
  }, [session, status, router])

  const onSubmit = async (data: AdFormValues) => {
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      await api.post("/ads", data)
      setSuccess("Advertisement created successfully!")
      setTimeout(() => {
        router.push("/ads")
      }, 1500)
    } catch (e) {
      console.error("Error creating advertisement: ", e)
      setError(e instanceof Error ? e.message : "Failed to create advertisement")
    } finally {
      setLoading(false)
    }
  }

  const addTag = () => {
    if (!newTag.trim()) return

    const currentTags = form.getValues("tags") || []
    if (!currentTags.includes(newTag)) {
      form.setValue("tags", [...currentTags, newTag])
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    const currentTags = form.getValues("tags") || []
    form.setValue(
      "tags",
      currentTags.filter((tag) => tag !== tagToRemove),
    )
  }

  const addRole = () => {
    const currentRoles = form.getValues("roles") || []
    form.setValue("roles", [...currentRoles, { name: "", isOpen: true }])
  }

  const removeRole = (index: number) => {
    const currentRoles = form.getValues("roles") || []
    form.setValue(
      "roles",
      currentRoles.filter((_, i) => i !== index),
    )
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 pt-16">
        <Header />
        <main className="container mx-auto px-4 py-8 mt-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Loading...</h1>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 pt-16">
      <Header />
      <main className="container mx-auto px-4 py-8 mt-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/ads">
                  <ChevronLeft className="h-5 w-5" />
                </Link>
              </Button>
              <h1 className="text-2xl font-bold">Create New Advertisement</h1>
            </div>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-6 border-green-200 bg-green-50 text-green-800">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="edit">Edit</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>

            <TabsContent value="edit" className="mt-4">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  <Card>
                    <CardHeader>
                      <CardTitle>Basic Information</CardTitle>
                      <CardDescription>Provide the essential details about your advertisement.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. AI-Powered Chatbot Development" {...field} />
                            </FormControl>
                            <FormDescription>
                              A clear, concise title that describes the project or opportunity.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="summary"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Summary</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Brief overview of the project"
                                className="resize-none"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              A short summary (max 200 characters) that will appear in search results.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Detailed description of the project, requirements, and goals"
                                className="min-h-32 resize-none"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Provide a comprehensive description of the project, including goals, requirements, and
                              expectations.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input placeholder="e.g. Remote, New York, London" {...field} />
                                <MapPin className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                              </div>
                            </FormControl>
                            <FormDescription>Specify the location or indicate if the work is remote.</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Tags & Categories</CardTitle>
                      <CardDescription>Add relevant tags to help others find your advertisement.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <Input
                              placeholder="Add a tag (e.g. JavaScript, Design, Marketing)"
                              value={newTag}
                              onChange={(e) => setNewTag(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault()
                                  addTag()
                                }
                              }}
                            />
                            <Tag className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                          </div>
                          <Button type="button" onClick={addTag} variant="secondary">
                            Add
                          </Button>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-4">
                          {form.watch("tags")?.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="px-3 py-1.5">
                              {tag}
                              <button
                                type="button"
                                className="ml-2 text-muted-foreground hover:text-foreground"
                                onClick={() => removeTag(tag)}
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                          {form.watch("tags")?.length === 0 && (
                            <p className="text-sm text-muted-foreground">No tags added yet.</p>
                          )}
                        </div>

                        {form.formState.errors.tags && (
                          <p className="text-sm font-medium text-destructive">{form.formState.errors.tags.message}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <CardTitle>Roles Needed</CardTitle>
                        <CardDescription>Specify the roles you&apos;re looking to fill for this project.</CardDescription>
                      </div>
                      <Button
                        type="button"
                        onClick={addRole}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1"
                      >
                        <Plus className="h-4 w-4" />
                        Add Role
                      </Button>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {form.watch("roles")?.map((_, index) => (
                        <div key={index} className="space-y-4">
                          {index > 0 && <Separator className="my-6" />}
                          <div className="flex justify-between items-center">
                            <h3 className="text-lg font-medium">Role {index + 1}</h3>
                            {index > 0 && (
                              <Button
                                type="button"
                                onClick={() => removeRole(index)}
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Remove
                              </Button>
                            )}
                          </div>

                          <div className="flex gap-4 items-start">
                            <div className="flex-1">
                              <FormField
                                control={form.control}
                                name={`roles.${index}.name`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Role Title</FormLabel>
                                    <FormControl>
                                      <div className="relative">
                                        <Input placeholder="e.g. Frontend Developer, UX Designer" {...field} />
                                        <Briefcase className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                                      </div>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <div className="pt-8">
                              <FormField
                                control={form.control}
                                name={`roles.${index}.isOpen`}
                                render={({ field }) => (
                                  <FormItem className="flex flex-row items-center justify-between space-x-3 space-y-0">
                                    <FormLabel>Open</FormLabel>
                                    <FormControl>
                                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>
                        </div>
                      ))}

                      {form.formState.errors.roles && (
                        <p className="text-sm font-medium text-destructive">{form.formState.errors.roles.message}</p>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Additional Information</CardTitle>
                      <CardDescription>Provide any prerequisites or additional details.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <FormField
                        control={form.control}
                        name="metadata.prerequisites"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Prerequisites</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="e.g. Prior experience with NLP frameworks, 3+ years of React development"
                                className="resize-none"
                                {...field}
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormDescription>List any prerequisites or requirements for applicants.</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>

                  <div className="flex justify-end gap-4">
                    <Button variant="outline" asChild>
                      <Link href="/ads">Cancel</Link>
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setActiveTab("preview")}
                      className="flex items-center gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      Preview
                    </Button>
                    <Button type="submit" disabled={loading} className="flex items-center gap-2">
                      <Save className="h-4 w-4" />
                      {loading ? "Creating..." : "Create Advertisement"}
                    </Button>
                  </div>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="preview" className="mt-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">{form.watch("title") || "Advertisement Title"}</CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {form.watch("location") || "Location"}
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab("edit")}>
                    Edit
                  </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Summary</h3>
                    <p className="text-muted-foreground">{form.watch("summary") || "No summary provided."}</p>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-medium mb-2">Description</h3>
                    <div className="prose prose-gray max-w-none">
                      <p className="text-muted-foreground whitespace-pre-line">
                        {form.watch("description") || "No description provided."}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-medium mb-2">Roles Needed</h3>
                    <div className="space-y-3">
                      {form.watch("roles")?.length > 0 ? (
                        form.watch("roles").map((role, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Briefcase className="h-4 w-4 text-muted-foreground" />
                              <span>{role.name || "Unnamed Role"}</span>
                            </div>
                            <Badge variant={role.isOpen ? "default" : "secondary"}>
                              {role.isOpen ? "Open" : "Closed"}
                            </Badge>
                          </div>
                        ))
                      ) : (
                        <p className="text-muted-foreground">No roles specified.</p>
                      )}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-medium mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {form.watch("tags")?.length > 0 ? (
                        form.watch("tags").map((tag, index) => (
                          <Badge key={index} variant="secondary">
                            {tag}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-muted-foreground">No tags specified.</p>
                      )}
                    </div>
                  </div>

                  {form.watch("metadata.prerequisites") && (
                    <>
                      <Separator />
                      <div>
                        <h3 className="text-lg font-medium mb-2">Prerequisites</h3>
                        <p className="text-muted-foreground">{form.watch("metadata.prerequisites")}</p>
                      </div>
                    </>
                  )}
                </CardContent>
                <CardFooter className="flex justify-end gap-4">
                  <Button variant="outline" onClick={() => setActiveTab("edit")}>
                    Back to Edit
                  </Button>
                  <Button onClick={form.handleSubmit(onSubmit)} disabled={loading} className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    {loading ? "Creating..." : "Create Advertisement"}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}

