"use client"

import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import FloatingMenu from "@/components/FloatingMenu"

export default function SettingPage() {
  const router = useRouter()

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

      <FloatingMenu />
    </div>
  )
}
