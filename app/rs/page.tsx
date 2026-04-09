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
          marginBottom: "16px",
        }}
      >
        <div style={{ fontWeight: 700, marginBottom: "8px" }}>RSの仕組み（予定）</div>
        <div style={{ color: "rgba(255,255,255,0.75)", lineHeight: 1.7, fontSize: "14px" }}>
          ・投稿によるRS付与<br />
          ・継続活動による加算<br />
          ・完成によるボーナス<br />
          ・プロジェクト単位での評価
        </div>
      </div>

      <div
        style={{
          padding: "16px",
          borderRadius: "16px",
          background: "rgba(59,130,246,0.12)",
          border: "1px solid rgba(59,130,246,0.28)",
          marginBottom: "16px",
        }}
      >
        <div style={{ fontWeight: 700, marginBottom: "8px" }}>使い道（予定）</div>
        <div style={{ color: "rgba(255,255,255,0.85)", lineHeight: 1.7, fontSize: "14px" }}>
          ・プロフィールの拡張<br />
          ・特別な表示 / カスタム<br />
          ・団体とのマッチング強化<br />
          ・機能解放
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
        <div style={{ fontWeight: 700, marginBottom: "8px" }}>サブスク（予定）</div>
        <div style={{ color: "rgba(255,255,255,0.75)", lineHeight: 1.7, fontSize: "14px" }}>
          Rootでは将来的にサブスク機能を追加予定です。<br />
          RSと連動した特典や機能が利用できるようになります。
        </div>
      </div>
    </div>
  )
}