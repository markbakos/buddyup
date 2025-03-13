"use client"

import React, {useEffect, useState} from 'react'
import { useRouter } from 'next/navigation'
import {useSession} from "next-auth/react";
import axios from "axios";

export default function RegisterPage () {
    const router = useRouter()
    const {data:session} = useSession()
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (!passwordRegex.test(password)) {
            setError("Password must be 8 characters or more, contain at least one uppercase letter and one number.")
            return
        }

        setLoading(true)

        try {
            await axios.post('http://localhost:4000/users/register', {
                name,
                email,
                password,
            })

            router.push('/')
        } catch (e) {
            setError('An error occured. Please try again.')
        }
        setLoading(false)
    }

    useEffect(() => {
        if (session) {
            router.push("/")
        }
    }, [session, router])

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 text-gray-500">
            <div className="w-full max-w-md p-8 bg-white rounded shadow">
                <h1 className="text-2xl font-bold mb-6 text-gray-800">Register</h1>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="mt-1 p-2 border rounded w-full"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
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
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 p-2 border rounded w-full"
                            required
                        />
                    </div>
                    {error && <p className="text-red-600 mb-4 text-sm">{error}</p>}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        {loading ? 'Registering...' : 'Register'}
                    </button>
                </form>
                <p className="text-gray-800 text-center text-xl">Already have an account?<a href="http://localhost:3000/auth/signin" className="text-blue-600 font-semibold cursor-pointer"> Sign in</a></p>
            </div>
        </div>
    )
}