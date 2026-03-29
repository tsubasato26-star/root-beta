"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function FloatingMenu() {
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

    setIsLoggedIn(false)
    setMenuOpen(false)
    router.replace("/login")
    router.refresh()
  }

  return (
    <>
      {menuOpen ? (
        <div
          style={{
            position: "fixed",
            bottom: "calc(env(safe-area-inset-bottom) + 100px)",
            right: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            zIndex: 30,
          }}
        >
          <a
            href="/"
            style={{
              padding: "10px 14px",
              borderRadius: "12px",
              color: "white",
              textDecoration: "none",
              background: "rgba(0,0,0,0.45)",
              border: "1px solid rgba(255,255,255,0.18)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              boxShadow: "0 6px 24px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.16)",
            }}
          >
            ホーム
          </a>
          <a
            href="/post"
            style={{
              padding: "10px 14px",
              borderRadius: "12px",
              color: "white",
              textDecoration: "none",
              background: "rgba(0,0,0,0.45)",
              border: "1px solid rgba(255,255,255,0.18)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              boxShadow: "0 6px 24px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.16)",
            }}
          >
            投稿
          </a>
          <a
            href="/profile"
            style={{
              padding: "10px 14px",
              borderRadius: "12px",
              color: "white",
              textDecoration: "none",
              background: "rgba(0,0,0,0.45)",
              border: "1px solid rgba(255,255,255,0.18)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              boxShadow: "0 6px 24px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.16)",
            }}
          >
            プロフィール
          </a>
          <a
            href="/search"
            style={{
              padding: "10px 14px",
              borderRadius: "12px",
              color: "white",
              textDecoration: "none",
              background: "rgba(0,0,0,0.45)",
              border: "1px solid rgba(255,255,255,0.18)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              boxShadow: "0 6px 24px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.16)",
            }}
          >
            検索
          </a>
          <a
            href="/setting"
            style={{
              padding: "10px 14px",
              borderRadius: "12px",
              color: "white",
              textDecoration: "none",
              background: "rgba(0,0,0,0.45)",
              border: "1px solid rgba(255,255,255,0.18)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              boxShadow: "0 6px 24px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.16)",
            }}
          >
            設定
          </a>

          {isLoggedIn ? (
            <button
              onClick={logout}
              style={{
                padding: "10px 14px",
                borderRadius: "12px",
                color: "white",
                border: "1px solid rgba(255,255,255,0.18)",
                background: "rgba(0,0,0,0.45)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                boxShadow: "0 6px 24px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.16)",
                cursor: "pointer",
              }}
            >
              ログアウト
            </button>
          ) : (
            <a
              href="/login"
              style={{
                padding: "10px 14px",
                borderRadius: "12px",
                color: "white",
                textDecoration: "none",
                background: "rgba(0,0,0,0.45)",
                border: "1px solid rgba(255,255,255,0.18)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                boxShadow: "0 6px 24px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.16)",
              }}
            >
              ログイン
            </a>
          )}
        </div>
      ) : null}

      <button
        onClick={() => setMenuOpen(!menuOpen)}
        style={{
          position: "fixed",
          bottom: "calc(env(safe-area-inset-bottom) + 30px)",
          right: "20px",
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          border: "1px solid rgba(255,255,255,0.18)",
          background: "linear-gradient(135deg, #3b82f6, #38bdf8)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.25)",
          color: "white",
          fontSize: "30px",
          cursor: "pointer",
          zIndex: 30,
        }}
      >
        +
      </button>
    </>
  )
}