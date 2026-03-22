"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const signUp = async () => {
    const { error } = await supabase.auth.signUp({ email, password })

    if (error) {
      alert("新規登録失敗")
      return
    }

    alert("新規登録成功")
  }

  const signIn = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      alert("ログイン失敗")
      return
    }

    alert("ログイン成功")
    router.push("/")
  }

  return (
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",gap:"10px"}}>

      <h1>ログイン</h1>

      <input type="email" placeholder="メール" value={email} onChange={(e)=>setEmail(e.target.value)} />
      <input type="password" placeholder="パスワード" value={password} onChange={(e)=>setPassword(e.target.value)} />

      <button onClick={signIn}>ログイン</button>
      <button onClick={signUp}>新規登録</button>

    </div>
  )
}