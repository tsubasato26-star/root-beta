"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function ProfilePage() {
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [targetUserId, setTargetUserId] = useState<string | null>(null)
  const [profile, setProfile] = useState<any>(null)
  const [videos, setVideos] = useState<any[]>([])
  const [followerCount, setFollowerCount] = useState(0)
  const [followingCount, setFollowingCount] = useState(0)
  const [isFollowing, setIsFollowing] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    loadProfilePage()
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data } = await supabase.auth.getUser()
    setIsLoggedIn(!!data.user)
  }

  const loadProfilePage = async () => {
    setLoading(true)

    const { data: userData } = await supabase.auth.getUser()
    const currentUser = userData.user

    const params = new URLSearchParams(window.location.search)
    const queryUserId = params.get("user")
    const pageUserId = queryUserId || currentUser?.id || null

    setCurrentUserId(currentUser?.id ?? null)
    setTargetUserId(pageUserId)

    if (!pageUserId) {
      setProfile(null)
      setVideos([])
      setLoading(false)
      return
    }

    let { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", pageUserId)
      .maybeSingle()

    if (!profileData && currentUser && pageUserId === currentUser.id) {
      const fallbackUsername =
        currentUser.email?.split("@")[0] || `user_${currentUser.id.slice(0, 6)}`

      await supabase.from("profiles").upsert({
        id: currentUser.id,
        username: fallbackUsername,
        bio: "",
      })

      const { data: insertedProfile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", pageUserId)
        .maybeSingle()

      profileData = insertedProfile
      profileError = null
    }

    if (profileError) {
      console.log(profileError)
    }

    setProfile(profileData)

    const { data: videoData, error: videoError } = await supabase
      .from("videos")
      .select("*")
      .eq("user_id", pageUserId)
      .order("created_at", { ascending: false })

    if (videoError) {
      console.log(videoError)
      setVideos([])
    } else {
      setVideos(videoData || [])
    }

    const { count: followers } = await supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("following_id", pageUserId)

    setFollowerCount(followers || 0)

    if (currentUser && pageUserId === currentUser.id) {
      const { count: following } = await supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("follower_id", pageUserId)

      setFollowingCount(following || 0)
    } else {
      setFollowingCount(0)
    }

    if (currentUser && pageUserId !== currentUser.id) {
      const { data: followRow } = await supabase
        .from("follows")
        .select("id")
        .eq("follower_id", currentUser.id)
        .eq("following_id", pageUserId)
        .maybeSingle()

      setIsFollowing(!!followRow)
    } else {
      setIsFollowing(false)
    }

    setLoading(false)
  }

  const isOwnProfile = !!currentUserId && currentUserId === targetUserId

  const editProfile = async () => {
    if (!currentUserId || !profile) return

    const newUsername = window.prompt("ユーザーネーム", profile.username || "")
    if (newUsername === null) return

    const newBio = window.prompt("ユーザーコメント", profile.bio || "")
    if (newBio === null) return

    const { error } = await supabase.from("profiles").upsert({
      id: currentUserId,
      username: newUsername,
      bio: newBio,
      avatar_url: profile.avatar_url || null,
    })

    if (error) {
      console.log(error)
      alert("プロフィール更新失敗")
      return
    }

    await loadProfilePage()
  }

  const toggleFollow = async () => {
    if (!currentUserId || !targetUserId || currentUserId === targetUserId) return

    if (isFollowing) {
      const { error } = await supabase
        .from("follows")
        .delete()
        .eq("follower_id", currentUserId)
        .eq("following_id", targetUserId)

      if (error) {
        console.log(error)
        alert("フォロー解除失敗")
        return
      }
    } else {
      const { error } = await supabase.from("follows").insert({
        follower_id: currentUserId,
        following_id: targetUserId,
      })

      if (error) {
        console.log(error)
        alert("フォロー失敗")
        return
      }
    }

    await loadProfilePage()
  }

  const deleteVideo = async (video: any) => {
    if (!isOwnProfile) return

    const confirmed = window.confirm("この動画を削除しますか？")
    if (!confirmed) return

    const filePath = video.video_url?.split("/videos/")[1]

    await supabase.from("video_tags").delete().eq("video_id", video.id)
    await supabase.from("likes").delete().eq("video_id", video.id)

    if (filePath) {
      await supabase.storage.from("videos").remove([filePath])
    }

    const { error } = await supabase.from("videos").delete().eq("id", video.id)

    if (error) {
      console.log(error)
      alert("動画削除失敗")
      return
    }

    await loadProfilePage()
  }

  const reportVideo = async (videoId: string) => {
    if (!currentUserId || isOwnProfile) return

    const confirmed = window.confirm("この動画を通報しますか？")
    if (!confirmed) return

    const { error } = await supabase.from("reports").insert({
      video_id: videoId,
      reporter_id: currentUserId,
    })

    if (error) {
      console.log(error)
      alert("通報失敗")
      return
    }

    alert("通報しました")
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

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "black",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        読み込み中...
      </div>
    )
  }

  return (
    <div style={{ minHeight: "100vh", background: "black", color: "white", position: "relative" }}>
      <div style={{ height: "140px", background: "linear-gradient(135deg, #222, #444)" }} />

      <div style={{ padding: "0 16px 24px 24px", marginTop: "-24px", position: "relative" }}>
        <div
          style={{
            position: "absolute",
            top: "16px",
            left: "16px",
            right: "16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            zIndex: 20,
          }}
        >
          <button
            onClick={() => router.back()}
            style={{
              background: "rgba(255,255,255,0.12)",
              color: "white",
              border: "none",
              borderRadius: "999px",
              padding: "8px 14px",
              cursor: "pointer",
            }}
          >
            戻る
          </button>

          {isOwnProfile ? (
            <button
              onClick={editProfile}
              style={{
                background: "rgba(255,255,255,0.12)",
                color: "white",
                border: "none",
                borderRadius: "999px",
                padding: "8px 14px",
                cursor: "pointer",
              }}
            >
              編集
            </button>
          ) : currentUserId ? (
            <button
              onClick={toggleFollow}
              style={{
                background: isFollowing ? "rgba(255,255,255,0.12)" : "#ff2d55",
                color: "white",
                border: "none",
                borderRadius: "999px",
                padding: "8px 14px",
                cursor: "pointer",
              }}
            >
              {isFollowing ? "フォロー中" : "フォロー"}
            </button>
          ) : null}
        </div>

        <div style={{ display: "flex", gap: "16px", alignItems: "flex-start", marginBottom: "14px" }}>
          <div
            style={{
              width: "88px",
              height: "88px",
              borderRadius: "50%",
              background: "#2f2f2f",
              border: "3px solid black",
              flexShrink: 0,
            }}
          />

          <div style={{ minWidth: 0, flex: 1, paddingTop: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <div style={{ fontSize: "22px", fontWeight: 700 }}>
                {profile?.username || "ユーザー"}
              </div>
              <div style={{ color: "rgba(255,255,255,0.55)", fontSize: "13px" }}>
                認証予定位置
              </div>
            </div>

            <div style={{ color: "rgba(255,255,255,0.65)", marginTop: "4px", fontSize: "13px" }}>
              @{targetUserId?.slice(0, 8) || "unknown"}
            </div>

            <div style={{ marginTop: "10px", color: "rgba(255,255,255,0.88)", whiteSpace: "pre-wrap" }}>
              {profile?.bio || "ユーザーコメント未設定"}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "18px", marginBottom: "20px", color: "rgba(255,255,255,0.85)" }}>
          <div>{followerCount} フォロワー</div>
          {isOwnProfile ? <div>{followingCount} フォロー中</div> : null}
        </div>

        {videos.length === 0 ? (
          <div style={{ color: "rgba(255,255,255,0.65)", paddingTop: "20px" }}>
            まだ動画がありません
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "4px" }}>
            {videos.map((video) => (
              <div key={video.id} style={{ position: "relative", aspectRatio: "9 / 16", background: "#111" }}>
                <button
                  onClick={() => router.push(`/video/${video.id}`)}
                  style={{
                    all: "unset",
                    cursor: "pointer",
                    display: "block",
                    width: "100%",
                    height: "100%",
                  }}
                >
                  <video
                    src={video.video_url}
                    muted
                    playsInline
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  />
                </button>

                {isOwnProfile ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteVideo(video)
                    }}
                    style={{
                      position: "absolute",
                      top: "6px",
                      right: "6px",
                      width: "28px",
                      height: "28px",
                      borderRadius: "999px",
                      border: "none",
                      background: "rgba(0,0,0,0.6)",
                      color: "white",
                      cursor: "pointer",
                    }}
                  >
                    ︙
                  </button>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      reportVideo(video.id)
                    }}
                    style={{
                      position: "absolute",
                      top: "6px",
                      right: "6px",
                      width: "28px",
                      height: "28px",
                      borderRadius: "999px",
                      border: "none",
                      background: "rgba(0,0,0,0.6)",
                      color: "white",
                      cursor: "pointer",
                    }}
                  >
                    ︙
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {menuOpen ? (
        <div
          style={{
            position: "fixed",
            bottom: "100px",
            right: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            zIndex: 30,
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
          zIndex: 30,
        }}
      >
        +
      </button>
    </div>
  )
}