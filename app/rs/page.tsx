"use client"

import { useRouter } from "next/navigation"

export default function RSPage() {
  const router = useRouter()

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "black",
        color: "white",
        padding: "24px 16px",
      }}
    >
      <button
        onClick={() => router.back()}
        style={{
          marginBottom: "20px",
          border: "1px solid rgba(255,255,255,0.18)",
          borderRadius: "999px",
          padding: "8px 14px",
          background: "rgba(0,0,0,0.45)",
          color: "white",
          cursor: "pointer",
        }}
      >
        戻る
      </button>

      <h1 style={{ marginTop: 0 }}>RS</h1>

      <div
        style={{
          padding: "16px",
          borderRadius: "16px",
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.14)",
          marginBottom: "16px",
        }}
      >
        <div style={{ fontSize: "28px", fontWeight: 700, marginBottom: "6px" }}>--</div>
        <div style={{ color: "rgba(255,255,255,0.72)", fontSize: "14px" }}>
          β版ではまだRSは計算・付与されません
        </div>
      </div>

      <div
        style={{
          padding: "16px",
          borderRadius: "16px",
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.14)",
        }}
      >
        <div style={{ fontWeight: 700, marginBottom: "8px" }}>今後追加予定</div>
        <div style={{ color: "rgba(255,255,255,0.75)", lineHeight: 1.7, fontSize: "14px" }}>
          ・投稿によるRS付与<br />
          ・継続活動による加算<br />
          ・完成や達成によるボーナス<br />
          ・サブスク関連の機能
        </div>
      </div>
    </div>
  )
}