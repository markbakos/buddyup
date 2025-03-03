"use client"

import {Ad} from "@/types/ads";

export default function AdPosting({title, description, metadata, tags, adRoles, createdAt, updatedAt}: Ad) {
    return (
        <div className="w-72 h-96 bg-white rounded-md">
            <h1>{title}</h1>
            <h1>{description}</h1>
            {adRoles && adRoles.length > 0 && (
                <ul>
                    {adRoles.map((adRole) => (
                        <li key={adRole.id}>
                            {adRole.role.name}{" "}
                            {adRole.isOpen ? (
                                <span>Open</span>
                            ) : (
                              <span>Closed</span>
                            )}
                        </li>
                    ))}
                </ul>
            )}
            <div>
                Created at: {new Date(createdAt).toLocaleString()}
            </div>
        </div>
    )
}