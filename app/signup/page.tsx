"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [username, setUsername] = useState("")
  const [isOrg, setIsOrg] = useState(false)

  const signUp = async () => {
    if (!username.trim()) {
      alert(isOrg ? "団体名を入力してください" : "ユーザーネームを入力してください")
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
        account_type: isOrg ? "organization" : "personal",
      })

      if (profileError) {
        console.log(profileError)
      }
    }

    alert("新規登録成功。続けてRootの説明を見てください")
    router.push("/onboarding")
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

      <input
        type="password"
        placeholder="確認用パスワード"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        style={{ width: "300px", padding: "10px", borderRadius: "8px", border: "none" }}
      />

      <input
        type="text"
        placeholder={isOrg ? "団体名" : "ユーザーネーム"}
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

      <button
        onClick={() => router.push("/login")}
        style={{ width: "300px", padding: "10px", borderRadius: "10px", border: "none", cursor: "pointer", background: "#333", color: "white" }}
      >
        ログインへ戻る
      </button>

      <div style={{ fontSize: "13px", marginTop: "8px" }}>
        {isOrg ? (
          <>
            個人アカウントに戻る
            <span
              onClick={() => setIsOrg(false)}
              style={{ color: "#3b82f6", cursor: "pointer", marginLeft: "6px" }}
            >
              こちら
            </span>
          </>
        ) : (
          <>
            団体の方は
            <span
              onClick={() => setIsOrg(true)}
              style={{ color: "#3b82f6", cursor: "pointer", marginLeft: "6px" }}
            >
              こちら
            </span>
          </>
        )}
      </div>
    </div>
  )
}