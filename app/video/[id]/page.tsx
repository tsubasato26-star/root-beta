"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import VideoPlayer from "@/components/VideoPlayer"
import FloatingMenu from "@/components/FloatingMenu"

export default function VideoDetailPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const videoId = Array.isArray(params?.id) ? params.id[0] : params?.id

  const [video, setVideo] = useState<any>(null)
  const [tags, setTags] = useState<any[]>([])

  useEffect(() => {
    if (!videoId) return
    fetchVideo()
    fetchTags()
  }, [videoId])

  const fetchVideo = async () => {
    const { data, error } = await supabase
      .from("videos")
      .select("*")
      .eq("id", videoId)
      .single()

    if (error) {
      console.log(error)
      return
    }

    if (data) {
      setVideo(data)
    }
  }

  const fetchTags = async () => {
    const { data: videoTagRows, error } = await supabase
      .from("video_tags")
      .select("tag_id")
      .eq("video_id", videoId)

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

  if (!video) {
    return <div style={{ color: "white", background: "black", minHeight: "100vh" }}>読み込み中...</div>
  }

  return (
    <div style={{ background: "black", minHeight: "100vh" }}>
      <VideoPlayer
        url={video.video_url}
        title={video.title}
        likes={video.likes}
        id={video.id}
        description={video.description}
      />

      <div style={{ padding: "20px", color: "white" }}>
        <h2>{video.title}</h2>
        <p>{video.description}</p>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {tags.map((tag) => (
            <span
              key={tag.id}
              style={{
                background: "rgba(255,255,255,0.15)",
                padding: "6px 10px",
                borderRadius: "999px",
                fontSize: "12px",
              }}
            >
              #{tag.name}
            </span>
          ))}
        </div>
      </div>

      <FloatingMenu />
    </div>
  )
}