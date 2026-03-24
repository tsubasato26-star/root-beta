"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "../lib/supabase"
import VideoPlayer from "../components/VideoPlayer"

export default function Home() {
  const router = useRouter()
  const [videos, setVideos] = useState<any[]>([])
  const [menuOpen, setMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    fetchVideos()
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data } = await supabase.auth.getUser()
    setIsLoggedIn(!!data.user)
  }

  const fetchVideos = async () => {
    const { data } = await supabase
      .from("videos")
      .select("*")
      .order("created_at", { ascending: false })

    if (data) {
      setVideos(data)
    }
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
    <div style={{ height: "100vh", overflowY: "scroll", scrollSnapType: "y mandatory" }}>
      {videos.length === 0 ? (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "rgba(255,255,255,0.7)",
          }}
        >
          まだ動画がありません
        </div>
      ) : (
        videos.map((video) => (
          <div key={video.id} style={{ scrollSnapAlign: "start" }}>
            <VideoPlayer
              url={video.video_url}
              title={video.title}
              likes={video.likes}
              id={video.id}
              description={video.description}
              showBackButton={false}
            />
          </div>
        ))
      )}

      {menuOpen ? (
        <div
          style={{
            position: "fixed",
            bottom: "100px",
            right: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          <a href="/" style={{ background: "white", padding: "10px", borderRadius: "10px", color: "black" }}>
            ホーム
          </a>
          <a href="/post" style={{ background: "white", padding: "10px", borderRadius: "10px", color: "black" }}>
            投稿
          </a>
          <a href="/profile" style={{ background: "white", padding: "10px", borderRadius: "10px", color: "black" }}>
            プロフィール
          </a>
          <a href="/search" style={{ background: "white", padding: "10px", borderRadius: "10px", color: "black" }}>
            検索
          </a>
          <a href="/setting" style={{ background: "white", padding: "10px", borderRadius: "10px", color: "black" }}>
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
            <a href="/login" style={{ background: "white", padding: "10px", borderRadius: "10px", color: "black" }}>
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
        }}
      >
        +
      </button>
    </div>
  )
}