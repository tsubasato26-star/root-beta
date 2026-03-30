"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function VideoPlayer({
  url,
  title,
  likes,
  id,
  description,
  postType,
  showBackButton = true,
}: {
  url: string
  title: string
  likes: number
  id: string
  description?: string
  postType?: string
  showBackButton?: boolean
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [likeCount, setLikeCount] = useState(likes ?? 0)
  const [liked, setLiked] = useState(false)
  const [tags, setTags] = useState<any[]>([])
  const [ownerId, setOwnerId] = useState("")
  const [ownerName, setOwnerName] = useState("ユーザー")
  const [createdAt, setCreatedAt] = useState("")
  const router = useRouter()

  const likeVideo = async () => {
    if (!liked) {
      setLiked(true)
      setLikeCount(likeCount + 1)

      await supabase.from("likes").insert({
        video_id: id,
        user_id: "demo-user",
      })

      await supabase
        .from("videos")
        .update({ likes: likeCount + 1 })
        .eq("id", id)
    } else {
      setLiked(false)
      setLikeCount(likeCount - 1)

      await supabase
        .from("likes")
        .delete()
        .eq("video_id", id)
        .eq("user_id", "demo-user")

      await supabase
        .from("videos")
        .update({ likes: likeCount - 1 })
        .eq("id", id)
    }
  }

  const fetchTags = async () => {
    const { data: videoTagRows, error } = await supabase
      .from("video_tags")
      .select("tag_id")
      .eq("video_id", id)

    if (error) {
      console.log(error)
      return
    }

    if (!videoTagRows || videoTagRows.length === 0) {
      setTags([])
      return
    }

    const tagIds = videoTagRows.map((row) => row.tag_id)

    const { data: tagRows, error: tagError } = await supabase
      .from("tags")
      .select("id, name")
      .in("id", tagIds)

    if (tagError) {
      console.log(tagError)
      return
    }

    if (tagRows) {
      setTags(tagRows)
    }
  }

  const fetchOwner = async () => {
    const { data: videoRow, error: videoError } = await supabase
      .from("videos")
      .select("user_id, created_at")
      .eq("id", id)
      .single()

    if (videoError || !videoRow?.user_id) {
      return
    }

    setOwnerId(videoRow.user_id)
    setCreatedAt(videoRow.created_at || "")

    const { data: profileRow } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", videoRow.user_id)
      .maybeSingle()

    if (profileRow?.username) {
      setOwnerName(profileRow.username)
    }
  }

  useEffect(() => {
  const target = videoRef.current
  if (!target) return

  let cancelled = false

  const tryPlay = async () => {
    try {
      await target.play()
    } catch (error: any) {
      if (error?.name !== "AbortError") {
        console.log(error)
      }
    }
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.target !== target || cancelled) return

        if (entry.isIntersecting) {
          void tryPlay()
        } else {
          if (!target.paused) {
            target.pause()
          }
        }
      })
    },
    { threshold: 0.6 }
  )

  observer.observe(target)

  return () => {
    cancelled = true
    observer.disconnect()
    if (!target.paused) {
      target.pause()
    }
  }
}, [])

  useEffect(() => {
    fetchTags()
    fetchOwner()
  }, [id])

  const formatDate = (value?: string | null) => {
    if (!value) return ""
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return ""
    return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}`
  }

  return (
    <div
      style={{
        height: "100dvh",
        width: "100%",
        position: "relative",
        backgroundColor: "black",
        overflow: "hidden",
      }}
    >
      {postType && (
        <div
          style={{
            position: "absolute",
            top: "calc(env(safe-area-inset-top) + 60px)",
            left: "16px",
            background: postType === "complete"
              ? "linear-gradient(135deg, #3b82f6, #38bdf8)"
              : "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.18)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            boxShadow: postType === "complete"
              ? "0 8px 22px rgba(59,130,246,0.22), inset 0 1px 0 rgba(255,255,255,0.18)"
              : "0 6px 24px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.22)",
            padding: "4px 10px",
            borderRadius: "8px",
            fontSize: "12px",
            color: "white",
          }}
        >
          {postType === "complete" ? "完成" : "実験 / 仮定"}
        </div>
      )}
      <video
  ref={videoRef}
  src={url}
  loop
  muted
  playsInline
  preload="metadata"
        style={{
          height: "100%",
          width: "100%",
          objectFit: "cover",
        }}
      />

      {showBackButton ? (
        <button
          onClick={() => router.back()}
          style={{
            position: "absolute",
            top: "calc(env(safe-area-inset-top) + 16px)",
            left: "16px",
            border: "1px solid rgba(255,255,255,0.18)",
            borderRadius: "999px",
            padding: "8px 14px",
            background: "rgba(0,0,0,0.45)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            boxShadow: "0 6px 24px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.16)",
            color: "white",
            cursor: "pointer",
          }}
        >
          戻る
        </button>
      ) : null}

      <div
        onClick={() => ownerId && router.push(`/profile?user=${ownerId}`)}
        style={{
          position: "absolute",
          bottom: "calc(env(safe-area-inset-bottom) + 128px)",
          left: "20px",
          color: "white",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          cursor: "pointer",
        }}
      >
        <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "rgba(255,255,255,0.22)" }} />
        <div>{ownerName}</div>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: "calc(env(safe-area-inset-bottom) + 52px)",
          left: "20px",
          color: "rgba(255,255,255,0.78)",
          fontSize: "12px",
        }}
      >
        {formatDate(createdAt)}
      </div>
      <div
        style={{
          position: "absolute",
          bottom: "calc(env(safe-area-inset-bottom) + 100px)",
          left: "20px",
          color: "white",
          fontSize: "18px",
        }}
      >
        {title}
      </div>

      <div
        style={{
          position: "absolute",
          bottom: "calc(env(safe-area-inset-bottom) + 70px)",
          left: "20px",
          color: "white",
          fontSize: "14px",
          maxWidth: "70%",
        }}
      >
        {description}
      </div>

      <div
        style={{
          position: "absolute",
          bottom: "calc(env(safe-area-inset-bottom) + 28px)",
          left: "20px",
          display: "flex",
          gap: "8px",
          flexWrap: "wrap",
          maxWidth: "70%",
        }}
      >
        {tags.map((tag) => (
          <span
            key={tag.id}
            onClick={() => router.push(`/tag/${tag.id}`)}
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.18)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              boxShadow: "0 6px 24px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.18)",
              color: "white",
              padding: "4px 10px",
              borderRadius: "999px",
              fontSize: "12px",
              cursor: "pointer",
            }}
          >
            #{tag.name}
          </span>
        ))}
      </div>

      <div
        style={{
          position: "absolute",
          right: "20px",
          bottom: "calc(env(safe-area-inset-bottom) + 180px)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "20px",
        }}
      >
        <button
          onClick={likeVideo}
          style={{
            fontSize: "28px",
            background: "none",
            border: "none",
            color: "white",
            cursor: "pointer",
          }}
        >
          {liked ? "❤️" : "🤍"}
        </button>

        <div
          style={{
            color: "white",
            fontSize: "14px",
          }}
        >
          {likeCount}
        </div>
      </div>
    </div>
  )
}