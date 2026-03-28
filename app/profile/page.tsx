"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import FloatingMenu from "@/components/FloatingMenu"

export default function ProfilePage() {
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [targetUserId, setTargetUserId] = useState<string | null>(null)
  const [profile, setProfile] = useState<any>(null)
  const [videos, setVideos] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [selectedProject, setSelectedProject] = useState<any>(null)
  const [followerCount, setFollowerCount] = useState(0)
  const [followingCount, setFollowingCount] = useState(0)
  const [isFollowing, setIsFollowing] = useState(false)
  const [editMenuOpen, setEditMenuOpen] = useState(false)
  const [editField, setEditField] = useState<"username" | "bio" | null>(null)
  const [editValue, setEditValue] = useState("")

  useEffect(() => {
    loadProfilePage()
  }, [])

  const loadProfilePage = async () => {
    setLoading(true)

    const { data: userData } = await supabase.auth.getUser()
    const currentUser = userData.user

    const params = new URLSearchParams(window.location.search)
    const queryUserId = params.get("user")
    const queryProjectId = params.get("project")
    const pageUserId = queryUserId || currentUser?.id || null

    setCurrentUserId(currentUser?.id ?? null)
    setTargetUserId(pageUserId)

        if (queryProjectId) {
      const { data: projectData } = await supabase
        .from("projects")
        .select("*")
        .eq("id", queryProjectId)
        .maybeSingle()

      setSelectedProject(projectData || null)
    } else {
      setSelectedProject(null)
    }

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

        const { data: projectRows, error: projectRowsError } = await supabase
      .from("projects")
      .select("*")
      .eq("user_id", pageUserId)
      .order("created_at", { ascending: false })

    if (projectRowsError) {
      console.log(projectRowsError)
    } else {
      setProjects(projectRows || [])
    }

     let videoQuery = supabase
      .from("videos")
      .select("*")
      .eq("user_id", pageUserId)
      .order("created_at", { ascending: false })

    if (queryProjectId) {
      videoQuery = videoQuery.eq("project_id", queryProjectId)
    }

    const { data: videoData, error: videoError } = await videoQuery

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

    const openEditMenu = () => {
    setEditMenuOpen(true)
    setEditField(null)
    setEditValue("")
  }

  const startEditField = (field: "username" | "bio" | "avatar") => {
    if (field === "avatar") {
      alert("ベータ版では使えません")
      return
    }

    setEditField(field)
    setEditValue(field === "username" ? profile?.username || "" : profile?.bio || "")
  }

  const saveEditField = async () => {
    if (!currentUserId || !profile || !editField) return

    const { error } = await supabase.from("profiles").upsert({
      id: currentUserId,
      username: editField === "username" ? editValue : profile.username || "",
      bio: editField === "bio" ? editValue : profile.bio || "",
      avatar_url: profile.avatar_url || null,
    })

    if (error) {
      console.log(error)
      alert("プロフィール更新失敗")
      return
    }

    setEditMenuOpen(false)
    setEditField(null)
    setEditValue("")
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

      <div style={{ padding: "0 16px 24px 16px", marginTop: "-24px", position: "relative" }}>
        <div
          style={{
            position: "fixed",
            top: "16px",
            left: "16px",
            right: "16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            zIndex: 40,
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
              onClick={openEditMenu}
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

        <div style={{ display: "flex", gap: "16px", alignItems: "flex-start", marginTop: "56px", marginBottom: "14px" }}>
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

                <div style={{ marginBottom: "20px" }}>
          <div style={{ fontSize: "18px", fontWeight: 700, marginBottom: "10px" }}>
            プロジェクト
          </div>

          {selectedProject ? (
            <div style={{ marginBottom: "12px", color: "rgba(255,255,255,0.8)" }}>
              現在表示中: {selectedProject.name}
            </div>
          ) : null}

          {projects.length === 0 ? (
            <div style={{ color: "rgba(255,255,255,0.65)" }}>まだプロジェクトがありません</div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px" }}>
              {projects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => router.push(`/profile?user=${targetUserId}&project=${project.id}`)}
                  style={{
                    textAlign: "left",
                    padding: "14px",
                    borderRadius: "16px",
                    border: "none",
                    background: "rgba(255,255,255,0.08)",
                    color: "white",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ fontWeight: 700, marginBottom: "6px" }}>
                    {project.name} {project.is_completed ? "✓" : ""}
                  </div>
                  <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)" }}>
                    {project.description || "説明なし"}
                  </div>
                </button>
              ))}
            </div>
          )}

          {selectedProject ? (
            <button
              onClick={() => router.push(`/profile?user=${targetUserId}`)}
              style={{
                marginTop: "12px",
                padding: "10px 14px",
                borderRadius: "999px",
                border: "none",
                background: "rgba(255,255,255,0.12)",
                color: "white",
                cursor: "pointer",
              }}
            >
              プロジェクト絞り込みを解除
            </button>
          ) : null}
        </div>

        {videos.length === 0 ? (
          <div
            style={{
              color: "rgba(255,255,255,0.85)",
              paddingTop: "20px",
              lineHeight: 1.9,
              whiteSpace: "pre-line",
            }}
          >
            {"最初の一歩を投稿しよう\n\n・思いつきでもOK\n・途中でもOK\n・実験でもOK\n\nRootは『完成前』を見せる場所"}
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

            {editMenuOpen ? (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.65)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 60,
            padding: "20px",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "420px",
              background: "#111",
              borderRadius: "20px",
              padding: "20px",
              boxSizing: "border-box",
            }}
          >
            {editField === null ? (
              <>
                <div style={{ fontSize: "22px", fontWeight: 700, marginBottom: "16px" }}>
                  プロフィール編集
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <button
                    onClick={() => startEditField("username")}
                    style={{
                      padding: "14px",
                      borderRadius: "12px",
                      border: "none",
                      background: "rgba(255,255,255,0.08)",
                      color: "white",
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    ユーザーネーム
                  </button>

                  <button
                    onClick={() => startEditField("bio")}
                    style={{
                      padding: "14px",
                      borderRadius: "12px",
                      border: "none",
                      background: "rgba(255,255,255,0.08)",
                      color: "white",
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    ユーザーコメント
                  </button>

                  <button
                    onClick={() => startEditField("avatar")}
                    style={{
                      padding: "14px",
                      borderRadius: "12px",
                      border: "none",
                      background: "rgba(255,255,255,0.08)",
                      color: "white",
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    ユーザーアイコン
                  </button>
                </div>

                <button
                  onClick={() => setEditMenuOpen(false)}
                  style={{
                    marginTop: "18px",
                    width: "100%",
                    padding: "12px",
                    borderRadius: "12px",
                    border: "none",
                    background: "#333",
                    color: "white",
                    cursor: "pointer",
                  }}
                >
                  閉じる
                </button>
              </>
            ) : (
              <>
                <div style={{ fontSize: "22px", fontWeight: 700, marginBottom: "16px" }}>
                  {editField === "username" ? "ユーザーネーム編集" : "ユーザーコメント編集"}
                </div>

                {editField === "username" ? (
                  <input
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "12px",
                      border: "none",
                      marginBottom: "14px",
                      boxSizing: "border-box",
                    }}
                  />
                ) : (
                  <textarea
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    rows={5}
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "12px",
                      border: "none",
                      marginBottom: "14px",
                      boxSizing: "border-box",
                      resize: "vertical",
                    }}
                  />
                )}

                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    onClick={() => {
                      setEditField(null)
                      setEditValue("")
                    }}
                    style={{
                      flex: 1,
                      padding: "12px",
                      borderRadius: "12px",
                      border: "none",
                      background: "#333",
                      color: "white",
                      cursor: "pointer",
                    }}
                  >
                    戻る
                  </button>

                  <button
                    onClick={saveEditField}
                    style={{
                      flex: 1,
                      padding: "12px",
                      borderRadius: "12px",
                      border: "none",
                      background: "#ff2d55",
                      color: "white",
                      cursor: "pointer",
                    }}
                  >
                    保存
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      ) : null}

      <FloatingMenu />
    </div>
  )
}