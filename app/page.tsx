"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "../lib/supabase"
import VideoPlayer from "../components/VideoPlayer"
import FloatingMenu from "../components/FloatingMenu"

export default function Home() {
  const router = useRouter()
  const [videos, setVideos] = useState<any[]>([])
  const containerRef = useRef<HTMLDivElement | null>(null)
  const currentIndexRef = useRef(0)
  const isAnimatingRef = useRef(false)

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

  const scrollToIndex = (index: number) => {
    if (!containerRef.current) return

    const clampedIndex = Math.max(0, Math.min(index, videos.length - 1))
    currentIndexRef.current = clampedIndex

    containerRef.current.scrollTo({
      top: clampedIndex * window.innerHeight,
      behavior: "smooth",
    })

    isAnimatingRef.current = true
    window.setTimeout(() => {
      isAnimatingRef.current = false
    }, 450)
  }

  return (
    <div
      ref={containerRef}
      onWheel={(e) => {
        const isDesktop = window.innerWidth >= 768
        if (!isDesktop) return

        e.preventDefault()
        if (isAnimatingRef.current || videos.length === 0) return

        if (e.deltaY > 0) {
          scrollToIndex(currentIndexRef.current + 1)
        } else if (e.deltaY < 0) {
          scrollToIndex(currentIndexRef.current - 1)
        }
      }}
      style={{
        height: "100vh",
        overflowY: "scroll",
        scrollSnapType: "y mandatory",
        overscrollBehavior: "none",
      }}
    >
      {videos.length === 0 ? (
        <div
  style={{
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "rgba(255,255,255,0.85)",
    textAlign: "center",
    padding: "24px",
    lineHeight: 1.8,
    whiteSpace: "pre-line",
  }}
>
  {"最初の一歩を投稿しよう\n\n・思いつきでもOK\n・途中でもOK\n・実験でもOK\n\nRootは「完成前」を見せる場所"}
</div>
      ) : (
        videos.map((video) => (
          <div key={video.id} style={{ scrollSnapAlign: "start", height: "100vh" }}>
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