"use client"

import { useEffect, useRef, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import VideoPlayer from "@/components/VideoPlayer"
import FloatingMenu from "@/components/FloatingMenu"

export default function TagPage() {
  const router = useRouter()

  const [videos, setVideos] = useState<any[]>([])
  const [tagName, setTagName] = useState("")
  const [siblingTags, setSiblingTags] = useState<any[]>([])
  const [currentTagIndex, setCurrentTagIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const currentIndexRef = useRef(0)
  const isAnimatingRef = useRef(false)

  const params = useParams<{ id: string }>()
  const tagId = Array.isArray(params?.id) ? params.id[0] : params?.id

  useEffect(() => {
    if (!tagId) return
    fetchTagName()
    fetchTagVideos()
    fetchSiblingTags()
    currentIndexRef.current = 0
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

  const fetchSiblingTags = async () => {
    const { data: currentTag, error: currentTagError } = await supabase
      .from("tags")
      .select("id, parent_id, level")
      .eq("id", tagId)
      .single()

    if (currentTagError) {
      console.log(currentTagError)
      return
    }

    if (!currentTag) {
      setSiblingTags([])
      setCurrentTagIndex(-1)
      return
    }

    let query = supabase
      .from("tags")
      .select("id, name, parent_id, level")
      .eq("level", currentTag.level)

    if (currentTag.parent_id) {
      query = query.eq("parent_id", currentTag.parent_id)
    } else {
      query = query.is("parent_id", null)
    }

    const { data: siblings, error: siblingsError } = await query

    if (siblingsError) {
      console.log(siblingsError)
      return
    }

    if (siblings) {
      const siblingIds = siblings.map((tag) => tag.id)

      const { data: videoTagRows, error: videoTagError } = await supabase
        .from("video_tags")
        .select("tag_id")
        .in("tag_id", siblingIds)

      if (videoTagError) {
        console.log(videoTagError)
      }

      const countMap: Record<string, number> = {}
      siblingIds.forEach((id) => {
        countMap[id] = 0
      })

      videoTagRows?.forEach((row) => {
        countMap[row.tag_id] = (countMap[row.tag_id] || 0) + 1
      })

      const sortedSiblings = [...siblings].sort((a, b) => {
        const countA = countMap[a.id] || 0
        const countB = countMap[b.id] || 0

        if (countA !== countB) {
          return countB - countA
        }

        return a.name.localeCompare(b.name, "ja")
      })

      setSiblingTags(sortedSiblings)
      const index = sortedSiblings.findIndex((tag) => tag.id === tagId)
      setCurrentTagIndex(index)
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

  const scrollToIndex = (index: number) => {
    if (!containerRef.current) return

    const clampedIndex = Math.max(0, Math.min(index, videos.length - 1))
    currentIndexRef.current = clampedIndex

    containerRef.current.scrollTo({
      top: clampedIndex * window.innerHeight,
      behavior: "smooth",
    })
  }

  return (
    <div
      ref={containerRef}
      onWheel={(e) => {
        const isDesktop = window.innerWidth >= 768
        if (!isDesktop) return

        e.preventDefault()

        if (isAnimatingRef.current || videos.length === 0) return

        isAnimatingRef.current = true

        if (e.deltaY > 0) {
          scrollToIndex(currentIndexRef.current + 1)
        } else if (e.deltaY < 0) {
          scrollToIndex(currentIndexRef.current - 1)
        }

        window.setTimeout(() => {
          isAnimatingRef.current = false
        }, 700)
      }}
      style={{
        height: "100dvh",
        overflowY: "scroll",
        overflowX: "hidden",
        scrollSnapType: "y mandatory",
        backgroundColor: "black",
        position: "relative",
        overscrollBehavior: "none",
      }}
    >
      <button
        onClick={() => router.push("/guide")}
        style={{
          position: "fixed",
          top: "calc(env(safe-area-inset-top) + 16px)",
          right: "16px",
          zIndex: 20,
          border: "none",
          borderRadius: "999px",
          padding: "8px 14px",
          background: "rgba(0,0,0,0.6)",
          color: "white",
          fontSize: "16px",
          cursor: "pointer",
        }}
      >
        ?
      </button>

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

      {siblingTags.length > 1 ? (
        <>
          <button
            onClick={() => {
              if (currentTagIndex > 0) {
                router.push(`/tag/${siblingTags[currentTagIndex - 1].id}`)
              }
            }}
            style={{
              position: "fixed",
              left: "16px",
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 20,
              border: "none",
              borderRadius: "999px",
              width: "42px",
              height: "42px",
              background: "rgba(0,0,0,0.65)",
              color: "white",
              cursor: currentTagIndex > 0 ? "pointer" : "default",
              opacity: currentTagIndex > 0 ? 1 : 0.35,
            }}
          >
            ←
          </button>

          <button
            onClick={() => {
              if (currentTagIndex < siblingTags.length - 1) {
                router.push(`/tag/${siblingTags[currentTagIndex + 1].id}`)
              }
            }}
            style={{
              position: "fixed",
              right: "16px",
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 20,
              border: "none",
              borderRadius: "999px",
              width: "42px",
              height: "42px",
              background: "rgba(0,0,0,0.65)",
              color: "white",
              cursor: currentTagIndex < siblingTags.length - 1 ? "pointer" : "default",
              opacity: currentTagIndex < siblingTags.length - 1 ? 1 : 0.35,
            }}
          >
            →
          </button>
        </>
      ) : null}

      {videos.length === 0 ? (
        <div
          style={{
            minHeight: "100dvh",
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
          {"このタグにはまだ投稿がありません\n\n最初の一歩を投稿しよう\n・思いつきでもOK\n・途中でもOK\n・実験でもOK"}
        </div>
      ) : (
        videos.map((video) => (
          <div
            key={video.id}
            style={{
              scrollSnapAlign: "start",
              height: "100dvh",
            }}
          >
            <VideoPlayer
              url={video.video_url}
              title={video.title}
              likes={video.likes}
              id={video.id}
              description={video.description}
              postType={video.post_type}

            />
          </div>
        ))
      )}

      <FloatingMenu />
    </div>
  )
}