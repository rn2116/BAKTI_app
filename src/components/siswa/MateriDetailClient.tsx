"use client"

interface MateriDetailClientProps {
  material: { title: string; description: string | null }
}

export default function MateriDetailClient({
  material,
}: MateriDetailClientProps) {
  const content = (
    <div className="space-y-6">
      <h1>{material.title}</h1>
      <p>{material.description}</p>
    </div>
  )

  return content
}
