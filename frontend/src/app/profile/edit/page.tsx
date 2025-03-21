"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { ChevronLeft, Save, Plus, Trash2, Calendar, X } from "lucide-react"
import Header from "@/app/components/Header"
import type { UserStats } from "@/types/user"
import api from "@/lib/api"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"

const profileFormSchema = z.object({
  profession: z.string().min(2, { message: "Profession is required." }),
  location: z.string().min(2, { message: "Location is required." }),
  aboutMe: z.string().optional(),
  skills: z.array(z.string()).optional(),
  experience: z.array(
    z.object({
      position: z.string().min(2, { message: "Job title is required." }),
      company: z.string().min(2, { message: "Company name is required." }),
      startDate: z.string(),
      endDate: z.string().optional(),
      description: z.string().optional(),
      current: z.boolean().default(false),
    })
  ).optional(),
  education: z.array(
    z.object({
      institution: z.string().min(2, { message: "Institution name is required." }),
      degree: z.string().min(2, { message: "Degree is required." }),
      field: z.string().min(2, { message: "Field of study is required." }),
      startDate: z.string(),
      endDate: z.string().optional(),
      current: z.boolean().default(false),
    })
  ).optional(),
  socialLinks: z.array(
    z.object({
      platform: z.string(),
      url: z.string().url({ message: "Please enter a valid URL" }),
    })
  ).optional(),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

export default function EditProfile() {
  const [user, setUser] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [newSkill, setNewSkill] = useState("")

  const { data: session, status } = useSession()
  const router = useRouter()

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      profession: "",
      location: "",
      aboutMe: "",
      skills: [],
      experience: [
        {
          position: "",
          company: "",
          startDate: new Date().toISOString().split("T")[0],
          endDate: "",
          description: "",
          current: false,
        },
      ],
      education: [
        {
          institution: "",
          degree: "",
          field: "",
          startDate: new Date().toISOString().split("T")[0],
          endDate: "",
          current: false,
        },
      ],
      socialLinks: [],
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

    async function fetchUser() {
      try {
        const response = await api.get("/profile")
        setUser(response.data)

        form.reset({
          profession: response.data.profile?.profession || "",
          location: response.data.profile?.location || "",
          aboutMe: response.data.profile?.aboutMe || "",
          skills: response.data.profile?.skills || [],
          experience: response.data.profile?.experience?.length
            ? response.data.profile.experience
            : [{  position: "", company: "", startDate: new Date().toISOString().split("T")[0], endDate: "", description: "", current: false }],
          education: response.data.profile?.education?.length
            ? response.data.profile.education
            : [{ institution: "", degree: "", field: "", startDate: new Date().toISOString().split("T")[0], endDate: "", current: false }],
          socialLinks: response.data.profile?.socialLinks || [],
        })
      } catch (e) {
        console.error("Error fetching user: ", e)
        setError(e instanceof Error ? e.message : "Failed to fetch user")
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [session, status, router, form])

  const onSubmit = async (data: ProfileFormValues) => {
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const { ...profileData } = data

      const formattedExperience = profileData.experience?.map(exp => ({
        ...exp,
        current: !exp.endDate,
      }))

      const formattedEducation = profileData.education?.map(edu => ({
        ...edu,
        current: !edu.endDate,
      }))

      const updateData = {
        ...profileData,
        experience: formattedExperience,
        education: formattedEducation,
        socialLinks: profileData.socialLinks || [],
      }

      await api.put("/profile", updateData)
      setSuccess("Profile updated successfully!")
      setTimeout(() => {
        router.push("/profile")
      }, 1500)
    } catch (e) {
      console.error("Error updating profile: ", e)
      setError(e instanceof Error ? e.message : "Failed to update profile")
    } finally {
      setSaving(false)
    }
  }

  const addSkill = () => {
    if (!newSkill.trim()) return

    const currentSkills = form.getValues("skills") || []
    if (!currentSkills.includes(newSkill)) {
      form.setValue("skills", [...currentSkills, newSkill])
      setNewSkill("")
    }
  }

  const removeSkill = (skillToRemove: string) => {
    const currentSkills = form.getValues("skills") || []
    form.setValue(
      "skills",
      currentSkills.filter((skill) => skill !== skillToRemove),
    )
  }

  const addExperience = () => {
    const currentExperience = form.getValues("experience") || []
    form.setValue("experience", [
      ...currentExperience,
      {
        position: "",
        company: "",
        startDate: new Date().toISOString().split("T")[0],
        description: "",
        current: false,
      },
    ])
  }

  const removeExperience = (index: number) => {
    const currentExperience = form.getValues("experience") || []
    form.setValue(
      "experience",
      currentExperience.filter((_, i) => i !== index),
    )
  }

  const addEducation = () => {
    const currentEducation = form.getValues("education") || []
    form.setValue("education", [
      ...currentEducation,
      {
        institution: "",
        degree: "",
        field: "",
        startDate: new Date().toISOString().split("T")[0],
        current: false,
      },
    ])
  }

  const removeEducation = (index: number) => {
    const currentEducation = form.getValues("education") || []
    form.setValue(
      "education",
      currentEducation.filter((_, i) => i !== index),
    )
  }

  if (loading) {
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
                <Link href="/profile">
                  <ChevronLeft className="h-5 w-5" />
                </Link>
              </Button>
              <h1 className="text-2xl font-bold">Edit Profile</h1>
            </div>
            <Button onClick={form.handleSubmit(onSubmit)} disabled={saving} className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
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

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>Update your basic profile information.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="profession"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Profession</FormLabel>
                          <FormControl>
                            <Input placeholder="Your profession" {...field} />
                          </FormControl>
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
                            <Input placeholder="Your location" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="aboutMe"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>About Me</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Tell us about yourself" className="min-h-32 resize-none" {...field} />
                        </FormControl>
                        <FormDescription>
                          Write a short bio about yourself, your background, and what you're interested in.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Skills</CardTitle>
                  <CardDescription>Add skills that showcase your expertise.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a skill"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            addSkill()
                          }
                        }}
                      />
                      <Button type="button" onClick={addSkill} variant="secondary">
                        Add
                      </Button>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-4">
                      {form.watch("skills")?.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="px-3 py-1.5">
                          {skill}
                          <button
                            type="button"
                            className="ml-2 text-muted-foreground hover:text-foreground"
                            onClick={() => removeSkill(skill)}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                      {form.watch("skills")?.length === 0 && (
                        <p className="text-sm text-muted-foreground">No skills added yet.</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Tabs defaultValue="experience" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="experience">Experience</TabsTrigger>
                  <TabsTrigger value="education">Education</TabsTrigger>
                </TabsList>

                <TabsContent value="experience" className="mt-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <CardTitle>Work Experience</CardTitle>
                        <CardDescription>
                          Add your work experience to showcase your professional background.
                        </CardDescription>
                      </div>
                      <Button
                        type="button"
                        onClick={addExperience}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1"
                      >
                        <Plus className="h-4 w-4" />
                        Add Experience
                      </Button>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {form.watch("experience")?.map((_, index) => (
                        <div key={index} className="space-y-4">
                          {index > 0 && <Separator className="my-6" />}
                          <div className="flex justify-between items-center">
                            <h3 className="text-lg font-medium">Experience {index + 1}</h3>
                            {index > 0 && (
                              <Button
                                type="button"
                                onClick={() => removeExperience(index)}
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Remove
                              </Button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name={`experience.${index}.position`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Job Title</FormLabel>
                                  <FormControl>
                                    <Input placeholder="e.g. Product Designer" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`experience.${index}.company`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Company</FormLabel>
                                  <FormControl>
                                    <Input placeholder="e.g. BuddyUp" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name={`experience.${index}.startDate`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Start Date</FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <Input type="date" {...field} />
                                      <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`experience.${index}.endDate`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>End Date (leave empty if current)</FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <Input type="date" {...field} value={field.value || ""} />
                                      <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={form.control}
                            name={`experience.${index}.description`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Describe your responsibilities and achievements"
                                    className="resize-none"
                                    {...field}
                                    value={field.value || ""}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="education" className="mt-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <CardTitle>Education</CardTitle>
                        <CardDescription>Add your educational background.</CardDescription>
                      </div>
                      <Button
                        type="button"
                        onClick={addEducation}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1"
                      >
                        <Plus className="h-4 w-4" />
                        Add Education
                      </Button>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {form.watch("education")?.map((_, index) => (
                        <div key={index} className="space-y-4">
                          {index > 0 && <Separator className="my-6" />}
                          <div className="flex justify-between items-center">
                            <h3 className="text-lg font-medium">Education {index + 1}</h3>
                            {index > 0 && (
                              <Button
                                type="button"
                                onClick={() => removeEducation(index)}
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Remove
                              </Button>
                            )}
                          </div>

                          <FormField
                            control={form.control}
                            name={`education.${index}.institution`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Institution</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g. University of Design" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name={`education.${index}.degree`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Degree</FormLabel>
                                  <FormControl>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select degree" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="Bachelor">Bachelor's</SelectItem>
                                        <SelectItem value="Master">Master's</SelectItem>
                                        <SelectItem value="PhD">PhD</SelectItem>
                                        <SelectItem value="Associate">Associate</SelectItem>
                                        <SelectItem value="Diploma">Diploma</SelectItem>
                                        <SelectItem value="Certificate">Certificate</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`education.${index}.field`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Field of Study</FormLabel>
                                  <FormControl>
                                    <Input placeholder="e.g. Computer Science" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name={`education.${index}.startDate`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Start Date</FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <Input type="date" {...field} />
                                      <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`education.${index}.endDate`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>End Date (leave empty if current)</FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <Input type="date" {...field} value={field.value || ""} />
                                      <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end gap-4">
                <Button variant="outline" asChild>
                  <Link href="/profile">Cancel</Link>
                </Button>
                <Button type="submit" disabled={saving} className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </main>
    </div>
  )
}

