"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [canNext, setCanNext] = useState(false)

  const slides = useMemo(
    () => [
      {
        title: "Rootへようこそ",
        text: "思想と作品が集まる場所",
        sub: "ただ完成品を並べるだけじゃない。何を考えて、どう作っているかまで伝える。",
        image: "🧠",
      },
      {
        title: "完成じゃなくていい",
        text: "途中・過程・成長を投稿する",
        sub: "思いつきでも、試作でも、失敗の途中でもいい。Rootは過程を見る場所。",
        image: "🌱",
      },
      {
        title: "Root Stone（RS）",
        text: "相談・依頼・活動で流れる",
        sub: "作品から相談や依頼につながり、Rootの中で価値が動く。その流れを作っていく。",
        image: "💎",
      },
      {
        title: "最後にメールを確認しよう",
        text: "Rootにログインしよう。これが最初の一歩だ",
        sub: "確認メールを開いて認証したら、ログインして始めよう。",
        image: "📩",
      },
    ],
    []
  )

  useEffect(() => {
    setCanNext(false)
    const timer = setTimeout(() => {
      setCanNext(true)
    }, 2000)

    return () => clearTimeout(timer)
  }, [step])

  const current = slides[step]
  const isLast = step === slides.length - 1

  const nextStep = () => {
    if (!canNext) return

    if (isLast) {
      localStorage.setItem("root_onboarding_done", "true")
      router.push("/login")
      return
    }

    setStep(step + 1)
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "black",
        color: "white",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "24px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: "28px", fontWeight: 800 }}>Root</div>

        <div />
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          gap: "24px",
          maxWidth: "520px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            width: "120px",
            height: "120px",
            borderRadius: "24px",
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.18)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            boxShadow: "0 6px 24px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.18)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "56px",
          }}
        >
          {current.image}
        </div>

        <div style={{ fontSize: "30px", fontWeight: 800 }}>{current.title}</div>

        <div style={{ fontSize: "20px", fontWeight: 600, color: "rgba(255,255,255,0.92)" }}>
          {current.text}
        </div>

        <div
          style={{
            fontSize: "15px",
            lineHeight: 1.8,
            color: "rgba(255,255,255,0.72)",
          }}
        >
          {current.sub}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "18px",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", gap: "10px" }}>
          {slides.map((_, index) => (
            <div
              key={index}
              style={{
                width: index === step ? "28px" : "10px",
                height: "10px",
                borderRadius: "999px",
                background: index === step ? "linear-gradient(135deg, #3b82f6, #38bdf8)" : "rgba(255,255,255,0.24)",
                transition: "0.2s",
              }}
            />
          ))}
        </div>

        <button
          onClick={nextStep}
          disabled={!canNext}
          style={{
            width: "100%",
            maxWidth: "360px",
            background: canNext
              ? "linear-gradient(135deg, #3b82f6, #38bdf8)"
              : "rgba(59,130,246,0.35)",
            border: "1px solid rgba(255,255,255,0.18)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            boxShadow: canNext
              ? "0 10px 30px rgba(59,130,246,0.28), inset 0 1px 0 rgba(255,255,255,0.22)"
              : "0 6px 18px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.12)",
            color: "white",
            padding: "14px 18px",
            borderRadius: "14px",
            fontSize: "16px",
            fontWeight: 700,
            cursor: canNext ? "pointer" : "default",
            opacity: canNext ? 1 : 0.7,
          }}
        >
          {isLast ? "ログインへ" : "次へ"}
        </button>
      </div>
    </div>
  )
}