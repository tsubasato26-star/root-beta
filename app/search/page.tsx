"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function SearchPage() {
  const router = useRouter()
  const [tags, setTags] = useState<any[]>([])
  const [query, setQuery] = useState("")
  const [menuOpen, setMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    fetchTags()
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data } = await supabase.auth.getUser()
    setIsLoggedIn(!!data.user)
  }

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

  const logout = async () => {
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.log(error)
      alert("ログアウト失敗")
      return
    }

    router.push("/login")
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

      {menuOpen ? (
        <div
          style={{
            position: "fixed",
            bottom: "100px",
            right: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          <a href="/" style={{ background: "white", padding: "10px", borderRadius: "10px", color: "black" }}>
            ホーム
          </a>
          <a href="/post" style={{ background: "white", padding: "10px", borderRadius: "10px", color: "black" }}>
            投稿
          </a>
          <a href="/profile" style={{ background: "white", padding: "10px", borderRadius: "10px", color: "black" }}>
            プロフィール
          </a>
          <a href="/search" style={{ background: "white", padding: "10px", borderRadius: "10px", color: "black" }}>
            検索
          </a>
          <a href="/setting" style={{ background: "white", padding: "10px", borderRadius: "10px", color: "black" }}>
            設定
          </a>
          {isLoggedIn ? (
            <button
              onClick={logout}
              style={{
                background: "white",
                padding: "10px",
                borderRadius: "10px",
                color: "black",
                border: "none",
                cursor: "pointer",
              }}
            >
              ログアウト
            </button>
          ) : (
            <a href="/login" style={{ background: "white", padding: "10px", borderRadius: "10px", color: "black" }}>
              ログイン
            </a>
          )}
        </div>
      ) : null}

      <button
        onClick={() => setMenuOpen(!menuOpen)}
        style={{
          position: "fixed",
          bottom: "30px",
          right: "20px",
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          backgroundColor: "#ff2d55",
          color: "white",
          fontSize: "30px",
          border: "none",
          cursor: "pointer",
        }}
      >
        +
      </button>
    </div>
  )
}