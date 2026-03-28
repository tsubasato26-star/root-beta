"use client"

import { useEffect, useRef, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import VideoPlayer from "@/components/VideoPlayer"
import FloatingMenu from "@/components/FloatingMenu"

export default function VideoDetailPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const videoId = Array.isArray(params?.id) ? params.id[0] : params?.id

  const [tagsByVideoId, setTagsByVideoId] = useState<Record<string, any[]>>({})
  const [relatedVideos, setRelatedVideos] = useState<any[]>([])
  const containerRef = useRef<HTMLDivElement | null>(null)
  const currentIndexRef = useRef(0)
  const isAnimatingRef = useRef(false)

  useEffect(() => {
    if (!videoId) return
    fetchRelatedVideos()
  }, [videoId])

  const fetchRelatedVideos = async () => {
    const { data: videoTagRows, error: videoTagError } = await supabase
      .from("video_tags")
      .select("tag_id")
      .eq("video_id", videoId)

    if (videoTagError) {
      console.log(videoTagError)
      return
    }

    if (!videoTagRows || videoTagRows.length === 0) return

    const tagIds = videoTagRows.map((row) => row.tag_id)

    const { data: relatedRows, error: relatedError } = await supabase
      .from("video_tags")
      .select("video_id, tag_id")
      .in("tag_id", tagIds)

    if (relatedError) {
      console.log(relatedError)
      return
    }

    if (!relatedRows || relatedRows.length === 0) return

    const uniqueVideoIds = [...new Set(relatedRows.map((row) => row.video_id))]

    const { data: vids, error: vidsError } = await supabase
      .from("videos")
      .select("*")
      .in("id", uniqueVideoIds)
      .order("created_at", { ascending: false })

    if (vidsError) {
      console.log(vidsError)
      return
    }

    if (!vids || vids.length === 0) return

    const tagMap: Record<string, any[]> = {}

    const { data: allTags, error: allTagsError } = await supabase
      .from("tags")
      .select("id, name")
      .in("id", tagIds)

    if (allTagsError) {
      console.log(allTagsError)
    }

    relatedRows.forEach((row) => {
      const tag = allTags?.find((t) => t.id === row.tag_id)
      if (!tag) return
      if (!tagMap[row.video_id]) tagMap[row.video_id] = []
      if (!tagMap[row.video_id].some((existing) => existing.id === tag.id)) {
        tagMap[row.video_id].push(tag)
      }
    })

    setTagsByVideoId(tagMap)
    setRelatedVideos(vids)

    const index = vids.findIndex((v) => v.id === videoId)
    const safeIndex = index >= 0 ? index : 0
    currentIndexRef.current = safeIndex

    window.setTimeout(() => {
      if (!containerRef.current) return
      containerRef.current.scrollTo({
        top: safeIndex * window.innerHeight,
        behavior: "auto",
      })
    }, 0)
  }

  const scrollToIndex = (index: number) => {
    if (!containerRef.current || relatedVideos.length === 0) return

    const clampedIndex = Math.max(0, Math.min(index, relatedVideos.length - 1))
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
        e.preventDefault()
        if (isAnimatingRef.current || relatedVideos.length === 0) return

        if (e.deltaY > 0) {
          scrollToIndex(currentIndexRef.current + 1)
        } else if (e.deltaY < 0) {
          scrollToIndex(currentIndexRef.current - 1)
        }
      }}
      style={{
        background: "black",
        minHeight: "100vh",
        height: "100vh",
        overflowY: "scroll",
        scrollSnapType: "y mandatory",
        overscrollBehavior: "none",
        position: "relative",
      }}
    >
      {relatedVideos.length === 0 ? (
        <div style={{ color: "white", background: "black", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          読み込み中...
        </div>
      ) : (
        relatedVideos.map((item) => (
          <div key={item.id} style={{ scrollSnapAlign: "start", height: "100vh", position: "relative" }}>
            <VideoPlayer
              url={item.video_url}
              title={item.title}
              likes={item.likes}
              id={item.id}
              description={item.description}
            />

            <div style={{ padding: "20px", color: "white", background: "black" }}>
              <h2>{item.title}</h2>
              <p>{item.description}</p>

              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {(tagsByVideoId[item.id] || []).map((tag) => (
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
          </div>
        ))
      )}

      <FloatingMenu />
    </div>
  )
}