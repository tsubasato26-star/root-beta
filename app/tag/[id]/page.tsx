"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import VideoPlayer from "@/components/VideoPlayer"

export default function TagPage() {
  const router = useRouter()

  const [videos, setVideos] = useState<any[]>([])
  const [tagName, setTagName] = useState("")
  const [menuOpen, setMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const params = useParams<{ id: string }>()
  const tagId = Array.isArray(params?.id) ? params.id[0] : params?.id

  useEffect(() => {
    if (!tagId) return
    fetchTagName()
    fetchTagVideos()
    checkUser()
  }, [tagId])

  const checkUser = async () => {
    const { data } = await supabase.auth.getUser()
    setIsLoggedIn(!!data.user)
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

  const fetchTagName = async () => {
    const { data, error } = await supabase
      .from("tags")
      .select("name")
      .eq("id", tagId)
      .single()

    if (error) {
      console.log(error)
      return
    }

    if (data) {
      setTagName(data.name)
    }
  }

  const fetchTagVideos = async () => {
    const { data: videoTagRows, error } = await supabase
      .from("video_tags")
      .select("video_id")
      .eq("tag_id", tagId)

    if (error) {
      console.log(error)
      return
    }

    if (!videoTagRows || videoTagRows.length === 0) {
      setVideos([])
      return
    }

    const videoIds = videoTagRows.map((row) => row.video_id)

    const { data: videosData, error: videosError } = await supabase
      .from("videos")
      .select("*")
      .in("id", videoIds)
      .order("created_at", { ascending: false })

    if (videosError) {
      console.log(videosError)
      return
    }

    if (videosData) {
      setVideos(videosData)
    }
  }

  return (
    <div
      style={{
        height: "100vh",
        overflowY: "scroll",
        scrollSnapType: "y mandatory",
        backgroundColor: "black",
        position: "relative",
      }}
    >
      <button
        onClick={() => router.back()}
        style={{
          position: "fixed",
          top: "16px",
          left: "16px",
          zIndex: 20,
          border: "none",
          borderRadius: "999px",
          padding: "8px 14px",
          background: "rgba(0,0,0,0.75)",
          color: "white",
          cursor: "pointer",
        }}
      >
        戻る
      </button>

      <div
        style={{
          position: "fixed",
          top: "16px",
          left: "90px",
          zIndex: 10,
          color: "white",
          background: "rgba(0,0,0,0.5)",
          padding: "8px 12px",
          borderRadius: "12px",
        }}
      >
        #{tagName}
      </div>

      {videos.map((video) => (
        <div
          key={video.id}
          style={{
            scrollSnapAlign: "start",
          }}
        >
          <VideoPlayer
            url={video.video_url}
            title={video.title}
            likes={video.likes}
            id={video.id}
            description={video.description}
          />
        </div>
      ))}

      {menuOpen ? (
        <div
          style={{
            position: "fixed",
            bottom: "100px",
            right: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            zIndex: 20,
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
              style={{ background: "white", padding: "10px", borderRadius: "10px", color: "black", border: "none", cursor: "pointer" }}
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
          zIndex: 20,
        }}
      >
        +
      </button>
    </div>
  )
}