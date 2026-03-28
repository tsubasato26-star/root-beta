"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

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

      <button
        onClick={signIn}
        style={{ width: "300px", padding: "10px", borderRadius: "10px", border: "none", cursor: "pointer" }}
      >
        ログインする
      </button>

      <button
        onClick={() => router.push("/signup")}
        style={{ width: "300px", padding: "10px", borderRadius: "10px", border: "none", cursor: "pointer", background: "#333", color: "white" }}
      >
        新規登録へ
      </button>
    </div>
  )
}