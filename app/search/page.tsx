"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import FloatingMenu from "@/components/FloatingMenu"

export default function SearchPage() {
  const router = useRouter()
  const [tags, setTags] = useState<any[]>([])
  const [query, setQuery] = useState("")
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null)
  const [searchMode, setSearchMode] = useState<"both" | "title" | "tag">("both")

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

  const runSearch = () => {
    const params = new URLSearchParams()

    if (query.trim()) {
      params.set("q", query.trim())
    }

    if (selectedTagId) {
      params.set("tag", selectedTagId)
    }

    params.set("mode", searchMode)

    router.push(`/search/results?${params.toString()}`)
  }

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

      <div style={{ display: "flex", gap: "10px", marginTop: "14px", marginBottom: "14px", flexWrap: "wrap", alignItems: "center" }}>
        <button
          onClick={() => setSearchMode("both")}
          style={{
            padding: "8px 14px",
            borderRadius: "999px",
            border: "1px solid rgba(255,255,255,0.18)",
            background: searchMode === "both" ? "linear-gradient(135deg, #2563eb, #38bdf8)" : "rgba(255,255,255,0.10)",
            color: "white",
            cursor: "pointer",
          }}
        >
          両方
        </button>

        <button
          onClick={() => setSearchMode("title")}
          style={{
            padding: "8px 14px",
            borderRadius: "999px",
            border: "1px solid rgba(255,255,255,0.18)",
            background: searchMode === "title" ? "linear-gradient(135deg, #2563eb, #38bdf8)" : "rgba(255,255,255,0.10)",
            color: "white",
            cursor: "pointer",
          }}
        >
          タイトル
        </button>

        <button
          onClick={() => setSearchMode("tag")}
          style={{
            padding: "8px 14px",
            borderRadius: "999px",
            border: "1px solid rgba(255,255,255,0.18)",
            background: searchMode === "tag" ? "linear-gradient(135deg, #2563eb, #38bdf8)" : "rgba(255,255,255,0.10)",
            color: "white",
            cursor: "pointer",
          }}
        >
          タグ
        </button>

        <button
          onClick={runSearch}
          style={{
            marginLeft: "auto",
            width: "44px",
            height: "44px",
            borderRadius: "999px",
            border: "1px solid rgba(255,255,255,0.18)",
            background: "linear-gradient(135deg, #2563eb, #38bdf8)",
            color: "white",
            cursor: "pointer",
            fontSize: "18px",
            boxShadow: "0 8px 22px rgba(37,99,235,0.28), inset 0 1px 0 rgba(255,255,255,0.18)",
          }}
        >
          🔍
        </button>
      </div>

      <div style={{ color: "rgba(255,255,255,0.72)", fontSize: "14px", marginBottom: "12px" }}>
        {selectedTagId ? "タグを1つ選択中。虫眼鏡ボタンで検索できます。" : "文字検索だけでも、タグを選んでからでも検索できます。"}
      </div>

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
            <button
              key={tag.id}
              onClick={() => setSelectedTagId(selectedTagId === tag.id ? null : tag.id)}
              style={{
                background: selectedTagId === tag.id
                  ? "linear-gradient(135deg, #1d4ed8, #2563eb)"
                  : tag.level === 1
                  ? "linear-gradient(135deg, #2563eb, #38bdf8)"
                  : tag.level === 2
                  ? "linear-gradient(135deg, rgba(14,165,233,0.55), rgba(56,189,248,0.28))"
                  : "rgba(255,255,255,0.10)",
                color: "white",
                padding: "8px 14px",
                borderRadius: "999px",
                fontSize: "14px",
                border: selectedTagId === tag.id
                  ? "1px solid rgba(255,255,255,0.22)"
                  : tag.level === 3
                  ? "1px solid rgba(255,255,255,0.18)"
                  : "1px solid rgba(255,255,255,0.10)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                boxShadow: selectedTagId === tag.id
                  ? "inset 0 4px 10px rgba(0,0,0,0.35), inset 0 -1px 3px rgba(255,255,255,0.10), 0 2px 8px rgba(37,99,235,0.18)"
                  : tag.level === 3
                  ? "0 6px 24px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.18)"
                  : tag.level === 1
                  ? "0 8px 22px rgba(37,99,235,0.28), inset 0 1px 0 rgba(255,255,255,0.18)"
                  : "0 8px 22px rgba(14,165,233,0.16), inset 0 1px 0 rgba(255,255,255,0.16)",
                transform: selectedTagId === tag.id ? "translateY(1px) scale(0.98)" : "translateY(0) scale(1)",
                cursor: "pointer",
              }}
            >
              #{tag.name}
            </button>
          ))
        )}
      </div>

      <FloatingMenu />
    </div>
  )
}