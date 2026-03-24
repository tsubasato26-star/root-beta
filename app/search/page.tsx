"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import FloatingMenu from "@/components/FloatingMenu"

export default function SearchPage() {
  const router = useRouter()
  const [tags, setTags] = useState<any[]>([])
  const [query, setQuery] = useState("")

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

  const filteredTags = useMemo(() => {
    const trimmed = query.trim().toLowerCase()
    if (!trimmed) return tags
    return tags.filter((tag) => String(tag.name).toLowerCase().includes(trimmed))
  }, [tags, query])

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "black",
        color: "white",
        padding: "20px",
        paddingTop: "70px",
      }}
    >
      <button
        onClick={() => router.back()}
        style={{
          position: "fixed",
          top: "16px",
          left: "16px",
          border: "none",
          borderRadius: "999px",
          padding: "8px 14px",
          background: "rgba(0,0,0,0.75)",
          color: "white",
          cursor: "pointer",
        }}
      >
        戻る
      </button>

      <h1>検索</h1>

      <input
        type="text"
        placeholder="タグを検索"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{
          width: "100%",
          maxWidth: "420px",
          padding: "10px 12px",
          borderRadius: "10px",
          border: "none",
          marginTop: "8px",
        }}
      />

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "10px",
          marginTop: "20px",
        }}
      >
        {filteredTags.length === 0 ? (
          <div
            style={{
              color: "rgba(255,255,255,0.7)",
              marginTop: "20px",
            }}
          >
            該当するタグがありません
          </div>
        ) : (
          filteredTags.map((tag) => (
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

      <FloatingMenu />
    </div>
  )
}