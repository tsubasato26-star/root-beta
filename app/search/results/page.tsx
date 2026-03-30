

"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import VideoPlayer from "@/components/VideoPlayer"
import FloatingMenu from "@/components/FloatingMenu"

export default function SearchResultsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const q = searchParams.get("q") || ""
  const tagId = searchParams.get("tag") || ""
  const mode = (searchParams.get("mode") || "both") as "both" | "title" | "tag"

  const [videos, setVideos] = useState<any[]>([])
  const [tagName, setTagName] = useState("")
  const [loading, setLoading] = useState(true)

  const containerRef = useRef<HTMLDivElement | null>(null)
  const currentIndexRef = useRef(0)
  const isAnimatingRef = useRef(false)

  useEffect(() => {
    fetchResults()
  }, [q, tagId, mode])

  const fetchResults = async () => {
    setLoading(true)

    let resultMap: Record<string, any> = {}

    if (tagId) {
      const { data: tagData } = await supabase
        .from("tags")
        .select("name")
        .eq("id", tagId)
        .maybeSingle()

      setTagName(tagData?.name || "")
    } else {
      setTagName("")
    }

    if (mode === "both" || mode === "title") {
      let titleQuery = supabase
        .from("videos")
        .select("*")
        .order("created_at", { ascending: false })

      if (q.trim()) {
        titleQuery = titleQuery.ilike("title", `%${q.trim()}%`)
      }

      const { data: titleVideos, error: titleError } = await titleQuery

      if (titleError) {
        console.log(titleError)
      } else {
        titleVideos?.forEach((video) => {
          resultMap[video.id] = video
        })
      }
    }

    if (mode === "both" || mode === "tag") {
      let targetTagIds: string[] = []

      if (tagId) {
        targetTagIds = [tagId]
      } else if (q.trim()) {
        const { data: matchedTags, error: tagError } = await supabase
          .from("tags")
          .select("id")
          .ilike("name", `%${q.trim()}%`)

        if (tagError) {
          console.log(tagError)
        } else {
          targetTagIds = matchedTags?.map((tag) => tag.id) || []
        }
      }

      if (targetTagIds.length > 0) {
        const { data: videoTagRows, error: videoTagError } = await supabase
          .from("video_tags")
          .select("video_id")
          .in("tag_id", targetTagIds)

        if (videoTagError) {
          console.log(videoTagError)
        } else {
          const videoIds = [...new Set((videoTagRows || []).map((row) => row.video_id))]

          if (videoIds.length > 0) {
            const { data: tagVideos, error: tagVideosError } = await supabase
              .from("videos")
              .select("*")
              .in("id", videoIds)
              .order("created_at", { ascending: false })

            if (tagVideosError) {
              console.log(tagVideosError)
            } else {
              tagVideos?.forEach((video) => {
                resultMap[video.id] = video
              })
            }
          }
        }
      }
    }

    const results = Object.values(resultMap).sort((a: any, b: any) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

    setVideos(results)
    currentIndexRef.current = 0
    setLoading(false)
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

  const titleText = useMemo(() => {
    if (q && tagName) return `「${q}」 / #${tagName} の検索結果`
    if (q) return `「${q}」の検索結果`
    if (tagName) return `#${tagName} の検索結果`
    return "検索結果"
  }, [q, tagName])

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
        overscrollBehavior: "none",
        background: "black",
        position: "relative",
      }}
    >
      <button
        onClick={() => router.back()}
        style={{
          position: "fixed",
          top: "calc(env(safe-area-inset-top) + 16px)",
          left: "16px",
          zIndex: 20,
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

      <button
        onClick={() => router.push("/guide")}
        style={{
          position: "fixed",
          top: "calc(env(safe-area-inset-top) + 16px)",
          right: "16px",
          zIndex: 20,
          border: "1px solid rgba(255,255,255,0.18)",
          borderRadius: "999px",
          padding: "8px 14px",
          background: "rgba(0,0,0,0.45)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          boxShadow: "0 6px 24px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.16)",
          color: "white",
          fontSize: "16px",
          cursor: "pointer",
        }}
      >
        ?
      </button>

      <div
        style={{
          position: "fixed",
          top: "calc(env(safe-area-inset-top) + 16px)",
          left: "90px",
          right: "90px",
          zIndex: 10,
          color: "white",
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.18)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          boxShadow: "0 6px 24px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.18)",
          padding: "8px 12px",
          borderRadius: "12px",
          fontSize: "14px",
          textAlign: "center",
        }}
      >
        {titleText}
      </div>

      {loading ? (
        <div
          style={{
            minHeight: "100dvh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
          }}
        >
          読み込み中...
        </div>
      ) : videos.length === 0 ? (
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
          {"検索結果が見つかりませんでした\n\n別の言葉やタグでもう一度試してみよう"}
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