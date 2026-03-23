"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const mode = searchParams.get("mode") === "signup" ? "signup" : "login"

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [username, setUsername] = useState("")

  useEffect(() => {
    setPassword("")
    setConfirmPassword("")
  }, [mode])

  const signUp = async () => {
    if (!username.trim()) {
      alert("ユーザーネームを入力してください")
      return
    }

    if (password !== confirmPassword) {
      alert("確認用パスワードが一致しません")
      return
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      console.log(error)
      alert("新規登録失敗")
      return
    }

    const newUserId = data.user?.id

    if (newUserId) {
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: newUserId,
        username,
        bio: "",
      })

      if (profileError) {
        console.log(profileError)
      }
    }

    alert("新規登録成功。確認メールから認証してください")
    router.push("/login")
  }

  const signIn = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.log(error)
      alert("ログイン失敗")
      return
    }

    alert("ログイン成功")
    router.push("/")
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: "12px",
        background: "black",
        color: "white",
        padding: "24px",
      }}
    >
      <div style={{ fontSize: "36px", fontWeight: 800, marginBottom: "8px" }}>
        Root
      </div>

      <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
        <button
          onClick={() => router.push("/login")}
          style={{
            padding: "8px 14px",
            borderRadius: "999px",
            border: "none",
            cursor: "pointer",
            background: mode === "login" ? "#ff2d55" : "#333",
            color: "white",
          }}
        >
          ログイン
        </button>
        <button
          onClick={() => router.push("/login?mode=signup")}
          style={{
            padding: "8px 14px",
            borderRadius: "999px",
            border: "none",
            cursor: "pointer",
            background: mode === "signup" ? "#ff2d55" : "#333",
            color: "white",
          }}
        >
          新規登録
        </button>
      </div>

      <input
        type="email"
        placeholder="メールアドレス"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ width: "300px", padding: "10px", borderRadius: "8px", border: "none" }}
      />

      <input
        type="password"
        placeholder="パスワード"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ width: "300px", padding: "10px", borderRadius: "8px", border: "none" }}
      />

      {mode === "signup" ? (
        <>
          <input
            type="password"
            placeholder="確認用パスワード"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={{ width: "300px", padding: "10px", borderRadius: "8px", border: "none" }}
          />
          <input
            type="text"
            placeholder="ユーザーネーム"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ width: "300px", padding: "10px", borderRadius: "8px", border: "none" }}
          />
          <button
            onClick={signUp}
            style={{ width: "300px", padding: "10px", borderRadius: "10px", border: "none", cursor: "pointer" }}
          >
            新規登録する
          </button>
        </>
      ) : (
        <button
          onClick={signIn}
          style={{ width: "300px", padding: "10px", borderRadius: "10px", border: "none", cursor: "pointer" }}
        >
          ログインする
        </button>
      )}
    </div>
  )
}