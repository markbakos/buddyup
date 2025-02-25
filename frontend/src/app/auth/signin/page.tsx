"use client"

import React, { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function SignInPage() {
    const router = useRouter()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSubmit = async(e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setLoading(true)

        const res = await signIn("credentials", {
            email,
            password,
            redirect: false,
        })

        if (res?.error) {
            setError(res.error)
            setLoading(false)
        } else {
            router.push("/")
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 text-gray-800">
            <div className="w-full max-w-md p-8 bg-white rounded shadow">
                <h1 className="text-2xl font-bold mb-6">Sign In</h1>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 p-2 border rounded w-full"
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 p-2 border rounded w-full"
                            required
                        />
                    </div>
                    {error && <p className="text-red-600 text-sm text-center my-2">{error}</p>}
                    <button type="submit" disabled={loading}
                            className="w-full py-2 px-4 bg-blue-600 text-white rounded cursor-pointer hover:bg-blue-700">
                        {!loading ? "Sign in" : "Signing in"}
                    </button>
                    <p className="text-gray-800 text-center text-xl mt-1">Don't have an account yet?<a href="http://localhost:3000/register" className="text-blue-600 font-semibold cursor-pointer"> Sign Up</a></p>
                </form>
            </div>
        </div>
    )
}