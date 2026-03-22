"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export default function SearchPage() {
  const [tags, setTags] = useState<any[]>([])

  useEffect(() => {
    fetchTags()
  }, [])

  const fetchTags = async () => {
    const { data, error } = await supabase
      .from("tags")
      .select("*")
      .order("level", { ascending: true })
      .order("name", { ascending: true })

    if (error) {
      console.log(error)
      return
    }

    if (data) {
      setTags(data)
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "black",
        color: "white",
        padding: "20px",
      }}
    >
      <h1>検索</h1>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "10px",
          marginTop: "20px",
        }}
      >
        {tags.length === 0 ? (
          <div
            style={{
              color: "rgba(255,255,255,0.7)",
              marginTop: "20px",
            }}
          >
            まだタグがありません
          </div>
        ) : (
          tags.map((tag) => (
            <a
              key={tag.id}
              href={`/tag/${tag.id}`}
              style={{
                background: tag.level === 1 ? "#ff2d55" : tag.level === 2 ? "#333" : "#555",
                color: "white",
                padding: "8px 14px",
                borderRadius: "999px",
                textDecoration: "none",
                fontSize: "14px",
              }}
            >
              #{tag.name}
            </a>
          ))
        )}
      </div>
    </div>
  )
}