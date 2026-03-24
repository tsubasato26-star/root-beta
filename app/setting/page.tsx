"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function SettingPage() {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data } = await supabase.auth.getUser()
    setIsLoggedIn(!!data.user)
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
          zIndex: 20,
        }}
      >
        戻る
      </button>

      <h1>設定</h1>

      <div style={{ marginTop: "24px", display: "flex", flexDirection: "column", gap: "12px" }}>
        <div
          style={{
            padding: "14px 16px",
            borderRadius: "12px",
            background: "rgba(255,255,255,0.08)",
          }}
        >
          アカウント設定はこれから追加
        </div>

        <div
          style={{
            padding: "14px 16px",
            borderRadius: "12px",
            background: "rgba(255,255,255,0.08)",
          }}
        >
          通知設定はこれから追加
        </div>

        <div
          style={{
            padding: "14px 16px",
            borderRadius: "12px",
            background: "rgba(255,255,255,0.08)",
          }}
        >
          デザイン設定はこれから追加
        </div>
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
            zIndex: 30,
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
              style={{ background: "white", padding: "10px", borderRadius: "10px", color: "black", border: "none", cursor: "pointer" }}
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
          zIndex: 30,
        }}
      >
        +
      </button>
    </div>
  )
}
