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
          top: "calc(env(safe-area-inset-top) + 16px)",
          left: "16px",
          border: "1px solid rgba(255,255,255,0.18)",
          borderRadius: "999px",
          padding: "8px 14px",
          background: "rgba(0,0,0,0.45)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          boxShadow: "0 6px 24px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.16)",
          color: "white",
          cursor: "pointer",
          zIndex: 20,
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
                background: tag.level === 1
                  ? "linear-gradient(135deg, #2563eb, #38bdf8)"
                  : tag.level === 2
                  ? "linear-gradient(135deg, rgba(14,165,233,0.55), rgba(56,189,248,0.28))"
                  : "rgba(255,255,255,0.10)",
                color: "white",
                padding: "8px 14px",
                borderRadius: "999px",
                textDecoration: "none",
                fontSize: "14px",
                border: tag.level === 3 ? "1px solid rgba(255,255,255,0.18)" : "1px solid rgba(255,255,255,0.10)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                boxShadow: tag.level === 3
                  ? "0 6px 24px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.18)"
                  : tag.level === 1
                  ? "0 8px 22px rgba(37,99,235,0.28), inset 0 1px 0 rgba(255,255,255,0.18)"
                  : "0 8px 22px rgba(14,165,233,0.16), inset 0 1px 0 rgba(255,255,255,0.16)",
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