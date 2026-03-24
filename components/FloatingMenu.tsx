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

    router.push("/login")
  }

  return (
    <>
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
          <a
            href="/"
            style={{ background: "white", padding: "10px", borderRadius: "10px", color: "black" }}
          >
            ホーム
          </a>
          <a
            href="/post"
            style={{ background: "white", padding: "10px", borderRadius: "10px", color: "black" }}
          >
            投稿
          </a>
          <a
            href="/profile"
            style={{ background: "white", padding: "10px", borderRadius: "10px", color: "black" }}
          >
            プロフィール
          </a>
          <a
            href="/search"
            style={{ background: "white", padding: "10px", borderRadius: "10px", color: "black" }}
          >
            検索
          </a>
          <a
            href="/setting"
            style={{ background: "white", padding: "10px", borderRadius: "10px", color: "black" }}
          >
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
            <a
              href="/login"
              style={{ background: "white", padding: "10px", borderRadius: "10px", color: "black" }}
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
    </>
  )
}