"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import FloatingMenu from "@/components/FloatingMenu"

export default function PostPage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [addMusicToImage, setAddMusicToImage] = useState(false)
  const [musicTitle, setMusicTitle] = useState("")
  const [musicArtist, setMusicArtist] = useState("")
  const [tags, setTags] = useState<any[]>([])
  const [level1, setLevel1] = useState("")
  const [level2Tags, setLevel2Tags] = useState<any[]>([])
  const [level2, setLevel2] = useState("")
  const [level3Tags, setLevel3Tags] = useState<any[]>([])
  const [level3, setLevel3] = useState<string[]>([])
  const [postType, setPostType] = useState("experiment")
  const [projects, setProjects] = useState<any[]>([])
  const [projectMode, setProjectMode] = useState<"existing" | "new">("existing")
  const [selectedProjectId, setSelectedProjectId] = useState("")
  const [newProjectName, setNewProjectName] = useState("")
  const [newProjectDescription, setNewProjectDescription] = useState("")

  useEffect(() => {
    fetchTags()
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    const { data: userData } = await supabase.auth.getUser()
    const user = userData.user

    if (!user) return

    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.log(error)
      return
    }

    if (data) {
      setProjects(data)
      if (data.length > 0 && !selectedProjectId) {
        setSelectedProjectId(data[0].id)
      }
    }
  }

  const fetchTags = async () => {
    const { data, error } = await supabase
      .from("tags")
      .select("*")
      .eq("level", 1)
      .order("name", { ascending: true })

    if (error) {
      console.log(error)
      return
    }

    if (data) {
      setTags(data)
    }
  }

  const fetchLevel2 = async (parentId: string) => {
    const { data, error } = await supabase
      .from("tags")
      .select("*")
      .eq("parent_id", parentId)
      .order("name", { ascending: true })

    if (error) {
      console.log(error)
      return
    }

    if (data) {
      setLevel2Tags(data)
    }
  }

  const fetchLevel3 = async (parentId: string) => {
    const { data, error } = await supabase
      .from("tags")
      .select("*")
      .eq("parent_id", parentId)
      .order("name", { ascending: true })

    if (error) {
      console.log(error)
      return
    }

    if (data) {
      setLevel3Tags(data)
    }
  }

  const isImageSelected = !!file && file.type.startsWith("image/")
  const isVideoSelected = !!file && file.type.startsWith("video/")

  const uploadPost = async () => {
    const { data: userData } = await supabase.auth.getUser()
    const user = userData.user

    if (!user) {
      alert("ログインしてください")
      router.push("/login")
      return
    }

    if (!level1 || !level2 || level3.length === 0) {
      alert("タグを選択してください")
      return
    }

    if (!file) {
      alert("動画または画像を選択してください")
      return
    }
    const isVideo = file.type.startsWith("video/")
    const isImage = file.type.startsWith("image/")

    if (!isVideo && !isImage) {
      alert("動画または画像ファイルを選択してください")
      return
    }

    if (isVideo && addMusicToImage) {
      setAddMusicToImage(false)
      setMusicTitle("")
      setMusicArtist("")
    }

    let projectIdToUse = selectedProjectId

    if (projectMode === "existing") {
      if (!projectIdToUse) {
        alert("プロジェクトを選択してください")
        return
      }
    } else {
      if (!newProjectName.trim()) {
        alert("新しいプロジェクト名を入力してください")
        return
      }

      const { data: newProject, error: projectError } = await supabase
        .from("projects")
        .insert({
          user_id: user.id,
          name: newProjectName,
          description: newProjectDescription,
        })
        .select()
        .single()

      if (projectError) {
        console.log(projectError)
        alert("プロジェクト作成失敗")
        return
      }

      projectIdToUse = newProject.id
    }

    const safeName = file.name.replace(/\s+/g, "-")
    const fileName = Date.now() + "-" + safeName

    const { error: uploadError } = await supabase.storage
      .from("videos")
      .upload(fileName, file)

    if (uploadError) {
      console.log(uploadError)
      alert("アップロード失敗")
      return
    }

    const videoUrl =
      "https://uogsjypcvdisujzeremr.supabase.co/storage/v1/object/public/videos/" +
      fileName

    const { data: videoData, error: insertError } = await supabase
      .from("videos")
      .insert({
        title,
        description,
        video_url: videoUrl,
        user_id: user.id,
        post_type: postType,
        project_id: projectIdToUse,
      })
      .select()
      .single()

    if (insertError) {
      console.log(insertError)
      alert("DB保存失敗")
      return
    }
        if (postType === "complete" && projectIdToUse) {
      await supabase
        .from("projects")
        .update({ is_completed: true })
        .eq("id", projectIdToUse)
    }

    const tagIds = [level1, level2, ...level3].filter(Boolean)
    const tagRows = tagIds.map((tagId) => ({
      video_id: videoData.id,
      tag_id: tagId,
    }))

    const { error: tagError } = await supabase
      .from("video_tags")
      .insert(tagRows)

    if (tagError) {
      console.log(tagError)
      alert("タグ保存失敗")
      return
    }

    alert("投稿成功")
    router.push("/")
  }

  return (
    <div style={{ padding: "20px", paddingTop: "70px" }}>
      <button
        onClick={() => router.back()}
        style={{
          position: "fixed",
          top: "16px",
          left: "16px",
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

      <h1>投稿</h1>

      <h3>投稿タイプ</h3>

            <h3>プロジェクト</h3>

      <div style={{ display: "flex", gap: "10px", marginBottom: "12px" }}>
        <button
          onClick={() => setProjectMode("existing")}
          style={{
            padding: "8px 16px",
            borderRadius: "999px",
            border: "none",
            background: projectMode === "existing" ? "#ff2d55" : "#ddd",
            color: projectMode === "existing" ? "white" : "black",
            cursor: "pointer",
          }}
        >
          既存プロジェクト
        </button>

        <button
          onClick={() => setProjectMode("new")}
          style={{
            padding: "8px 16px",
            borderRadius: "999px",
            border: "none",
            background: projectMode === "new" ? "#ff2d55" : "#ddd",
            color: projectMode === "new" ? "white" : "black",
            cursor: "pointer",
          }}
        >
          新しく作る
        </button>
      </div>

      {projectMode === "existing" ? (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "16px" }}>
          {projects.length === 0 ? (
            <div style={{ color: "rgba(255,255,255,0.7)" }}>まだプロジェクトがありません</div>
          ) : (
            projects.map((project) => {
              const selected = selectedProjectId === project.id
              return (
                <div
                  key={project.id}
                  onClick={() => setSelectedProjectId(project.id)}
                  style={{
                    padding: "10px 14px",
                    borderRadius: "14px",
                    cursor: "pointer",
                    background: selected ? "#ff2d55" : "#eee",
                    color: selected ? "white" : "black",
                  }}
                >
                  {project.name}
                  {project.is_completed ? " ✓" : ""}
                </div>
              )
            })
          )}
        </div>
      ) : (
        <div style={{ marginBottom: "16px" }}>
          <input
            placeholder="新しいプロジェクト名"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
          />

          <br />
          <br />

          <textarea
            placeholder="プロジェクト説明（任意）"
            value={newProjectDescription}
            onChange={(e) => setNewProjectDescription(e.target.value)}
          />
        </div>
      )}

      <div style={{ display: "flex", gap: "10px" }}>
        <button
          onClick={() => setPostType("experiment")}
          style={{
            padding: "8px 16px",
            borderRadius: "999px",
            border: "none",
            background: postType === "experiment" ? "#ff2d55" : "#ddd",
            color: postType === "experiment" ? "white" : "black",
            cursor: "pointer",
          }}
        >
          実験 / 過程
        </button>

        <button
          onClick={() => setPostType("complete")}
          style={{
            padding: "8px 16px",
            borderRadius: "999px",
            border: "none",
            background: postType === "complete" ? "#ff2d55" : "#ddd",
            color: postType === "complete" ? "white" : "black",
            cursor: "pointer",
          }}
        >
          完成
        </button>
      </div>

      <br />

      <input
        placeholder="タイトル"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <br />

      <textarea
        placeholder="説明文"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <br />
      <h3>タグ</h3>

      <select
        value={level1}
        onChange={(e) => {
          setLevel1(e.target.value)
          setLevel2("")
          setLevel3([])
          setLevel2Tags([])
          setLevel3Tags([])
          fetchLevel2(e.target.value)
        }}
      >
        <option value="">何も選択されていません</option>
        {tags.map((tag) => (
          <option key={tag.id} value={tag.id}>
            {tag.name}
          </option>
        ))}
      </select>

      <br />

      <select
        value={level2}
        onChange={(e) => {
          setLevel2(e.target.value)
          setLevel3([])
          setLevel3Tags([])
          fetchLevel3(e.target.value)
        }}
      >
        <option value="">何も選択されていません</option>
        {level2Tags.map((tag) => (
          <option key={tag.id} value={tag.id}>
            {tag.name}
          </option>
        ))}
      </select>

      <br />

      <p>タグを選択してください（複数選択可）</p>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "10px",
        }}
      >
        {level3Tags.map((tag) => {
          const selected = level3.includes(tag.id)

          return (
            <div
              key={tag.id}
              onClick={() => {
                if (selected) {
                  setLevel3(level3.filter((id) => id !== tag.id))
                } else {
                  setLevel3([...level3, tag.id])
                }
              }}
              style={{
                padding: "8px 14px",
                borderRadius: "20px",
                cursor: "pointer",
                background: selected ? "#ff2d55" : "#eee",
                color: selected ? "white" : "black",
                fontSize: "14px",
              }}
            >
              {tag.name}
            </div>
          )
        })}
      </div>
      <div
        style={{
          marginTop: "12px",
          marginBottom: "6px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          flexWrap: "wrap",
        }}
      >
        <button
          type="button"
          onClick={() => alert("タグ作成はβ版ではまだ使えません")}
          style={{
            padding: "8px 14px",
            borderRadius: "999px",
            border: "1px solid rgba(255,255,255,0.16)",
            background: "rgba(255,255,255,0.08)",
            color: "white",
            cursor: "pointer",
          }}
        >
          ＋ タグを作る
        </button>

        <span style={{ color: "rgba(255,255,255,0.65)", fontSize: "13px" }}>
          正式版で追加予定
        </span>
      </div>

      <br />

      <p style={{ marginBottom: "8px", fontWeight: 700 }}>動画や画像を選択</p>
      <input
        type="file"
        accept="video/*,image/*"
        onChange={(e) => {
          const nextFile = e.target.files?.[0] || null
          setFile(nextFile)

          if (!nextFile || !nextFile.type.startsWith("image/")) {
            setAddMusicToImage(false)
            setMusicTitle("")
            setMusicArtist("")
          }
        }}
      />
      {file ? (
        <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "14px" }}>
          選択中: {file.name} ({file.type.startsWith("image/") ? "画像" : file.type.startsWith("video/") ? "動画" : "未対応"})
        </p>
      ) : null}
      {isImageSelected ? (
        <div
          style={{
            marginTop: "12px",
            marginBottom: "12px",
            padding: "14px",
            borderRadius: "16px",
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.14)",
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: "8px" }}>画像投稿の楽曲</div>

          <button
            type="button"
            onClick={() => setAddMusicToImage((prev) => !prev)}
            style={{
              padding: "8px 14px",
              borderRadius: "999px",
              border: "none",
              background: addMusicToImage ? "#2563eb" : "#ddd",
              color: addMusicToImage ? "white" : "black",
              cursor: "pointer",
              marginBottom: addMusicToImage ? "12px" : 0,
            }}
          >
            {addMusicToImage ? "楽曲を追加する設定中" : "楽曲を追加する"}
          </button>

          {addMusicToImage ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <input
                placeholder="曲名（表示用）"
                value={musicTitle}
                onChange={(e) => setMusicTitle(e.target.value)}
              />

              <input
                placeholder="アーティスト名（任意）"
                value={musicArtist}
                onChange={(e) => setMusicArtist(e.target.value)}
              />

              <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "13px", lineHeight: 1.6, margin: 0 }}>
                今はここで楽曲情報の入力欄だけを用意しています。<br />
                まだ保存や再生には使われていません。動画の音楽編集も今後の機能です。
              </p>
            </div>
          ) : null}
        </div>
      ) : null}
      {isVideoSelected ? (
        <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "13px", lineHeight: 1.6 }}>
          動画はそのまま投稿します。音楽追加はまだ実装していません。
        </p>
      ) : null}

      <br />

      <div
        style={{
          marginBottom: "14px",
          padding: "12px 14px",
          borderRadius: "14px",
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.14)",
          color: "white",
        }}
      >
        <div style={{ fontWeight: 700, marginBottom: "4px" }}>RS</div>
        <div style={{ color: "rgba(255,255,255,0.72)", fontSize: "13px", lineHeight: 1.6 }}>
          投稿によるRS反映は今後追加予定です。βではまだ計算・付与されません。
        </div>
      </div>

      <button onClick={uploadPost}>投稿</button>

      <FloatingMenu />
    </div>
  )
}
