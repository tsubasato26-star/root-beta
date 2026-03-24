"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "../lib/supabase"
import VideoPlayer from "../components/VideoPlayer"
import FloatingMenu from "../components/FloatingMenu"

export default function Home() {
  const router = useRouter()
  const [videos, setVideos] = useState<any[]>([])

  useEffect(() => {
    fetchVideos()
  }, [])

  const fetchVideos = async () => {
    const { data } = await supabase
      .from("videos")
      .select("*")
      .order("created_at", { ascending: false })

    if (data) {
      setVideos(data)
    }
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

      <FloatingMenu />
    </div>
  )
}