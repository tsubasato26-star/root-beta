"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import VideoPlayer from "@/components/VideoPlayer"

export default function TagPage() {
  const [videos, setVideos] = useState<any[]>([])
  const [tagName, setTagName] = useState("")

  const params = useParams<{ id: string }>()
  const tagId = Array.isArray(params?.id) ? params.id[0] : params?.id

  useEffect(() => {
    if (!tagId) return
    fetchTagName()
    fetchTagVideos()
  }, [tagId])

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
      }}
    >
      <div
        style={{
          position: "fixed",
          top: "10px",
          left: "20px",
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
    </div>
  )
}