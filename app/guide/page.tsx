"use client"

import { useRouter } from "next/navigation"

const sections = [
  { id: "about", title: "Rootとは" },
  { id: "basic", title: "基本の使い方" },
  { id: "scroll", title: "縦と横の見方" },
  { id: "posting", title: "投稿の考え方" },
  { id: "tags", title: "タグの意味" },
  { id: "projects", title: "プロジェクトの意味" },
  { id: "profile", title: "プロフィールの見方" },
  { id: "rs", title: "RSについて" },
  { id: "faq", title: "よくある疑問" },
]

export default function GuidePage() {
  const router = useRouter()

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (!element) return

    element.scrollIntoView({
      behavior: "smooth",
      block: "start",
    })
  }

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "black",
        color: "white",
        padding: "20px",
        paddingTop: "72px",
      }}
    >
      <button
        onClick={() => router.back()}
        style={{
          position: "fixed",
          top: "calc(env(safe-area-inset-top) + 16px)",
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

      <h1 style={{ fontSize: "32px", marginBottom: "12px" }}>Rootガイド</h1>
      <p style={{ color: "rgba(255,255,255,0.75)", lineHeight: 1.8, marginBottom: "24px" }}>
        ここでは、Rootの使い方と考え方をまとめる。
        まずは項目だけ置いてあるから、あとで文章を足していけるようにしてある。
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "10px",
          marginBottom: "28px",
        }}
      >
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => scrollToSection(section.id)}
            style={{
              textAlign: "left",
              padding: "12px 14px",
              borderRadius: "14px",
              border: "none",
              background: "rgba(255,255,255,0.08)",
              color: "white",
              cursor: "pointer",
            }}
          >
            {section.title}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
        <section id="about" style={{ background: "rgba(255,255,255,0.06)", borderRadius: "18px", padding: "18px" }}>
          <h2 style={{ marginTop: 0 }}>Rootとは</h2>
          <p>
            Rootは、ユーザーの趣味や探求を記録し、それが将来仕事につながる可能性を持つ場所です。<br/>
            完成された作品を見せる場ではなく、「過程」や「成長」そのものに価値があるSNSです。
          </p>
        </section>

        <section id="basic" style={{ background: "rgba(255,255,255,0.06)", borderRadius: "18px", padding: "18px" }}>
          <h2 style={{ marginTop: 0 }}>基本の使い方</h2>
          <p>
            （投稿する側）<br/>
            自分の趣味、やりたいこと、探求したいことを「プロジェクト」として作ります。<br/>
            そしてその中で、進んだ過程を動画として投稿していきます。<br/>
            完成していなくても大丈夫です。むしろ途中の過程こそが大事です。<br/><br/>
            （見る側）<br/>
            動画をスライドするだけで様々な探求を見ることができます。<br/>
            気になる分野があればタグを押すことで、その分野だけを見ることもできます。
          </p>
        </section>

        <section id="scroll" style={{ background: "rgba(255,255,255,0.06)", borderRadius: "18px", padding: "18px" }}>
          <h2 style={{ marginTop: 0 }}>縦と横の見方</h2>
          <p>
            縦にスライドすると動画が切り替わります。<br/>
            ホームではおすすめ、タグページでは同じタグの動画が流れます。<br/><br/>
            横にスライドすると、少し広い分野や関連する内容の動画に移動します。<br/>
            これによって自然に新しい分野へ広がっていきます。
          </p>
        </section>

        <section id="posting" style={{ background: "rgba(255,255,255,0.06)", borderRadius: "18px", padding: "18px" }}>
          <h2 style={{ marginTop: 0 }}>投稿の考え方</h2>
          <p>
            Rootで大事なのは「完成」ではなく「過程」です。<br/>
            試したこと、失敗したこと、途中の状態などをそのまま投稿してください。<br/>
            それがあなたの価値になります。
          </p>
        </section>

        <section id="tags" style={{ background: "rgba(255,255,255,0.06)", borderRadius: "18px", padding: "18px" }}>
          <h2 style={{ marginTop: 0 }}>タグの意味</h2>
          <p>
            タグは動画を分類するためのものです。<br/>
            見る人が探しやすくなり、自分でも後から見返しやすくなります。<br/>
            できるだけ内容に合った、わかりやすいタグをつけましょう。
          </p>
        </section>

        <section id="projects" style={{ background: "rgba(255,255,255,0.06)", borderRadius: "18px", padding: "18px" }}>
          <h2 style={{ marginTop: 0 }}>プロジェクトの意味</h2>
          <p>
            プロジェクトは「一つの目的に向かって続いている活動のまとまり」です。<br/>
            複数の投稿を通して成長や変化を見せることができます。<br/>
            完成したとき、そのプロジェクトに意味が生まれます。
          </p>
        </section>

        <section id="profile" style={{ background: "rgba(255,255,255,0.06)", borderRadius: "18px", padding: "18px" }}>
          <h2 style={{ marginTop: 0 }}>プロフィールの見方</h2>
          <p>
            プロフィールでは、その人の投稿を確認できます。<br/>
            新しい順で見ることも、プロジェクトごとに見ることもできます。<br/>
            その人がどんなことをしているのかが分かる場所です。
          </p>
        </section>

        <section id="rs" style={{ background: "rgba(255,255,255,0.06)", borderRadius: "18px", padding: "18px" }}>
          <h2 style={{ marginTop: 0 }}>RSについて</h2>
          <p>
            RS（RootStone）はRoot内で使われるポイントのようなものです。<br/>
            投稿や活動を通して集めることができ、今後さまざまな用途に使われる予定です。
          </p>
        </section>

        <section id="faq" style={{ background: "rgba(255,255,255,0.06)", borderRadius: "18px", padding: "18px" }}>
          <h2 style={{ marginTop: 0 }}>よくある疑問</h2>
          <p>
            今後よくある疑問をここに追加していきます。
          </p>
        </section>
      </div>
    </div>
  )
}