"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function PostPage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [tags, setTags] = useState<any[]>([])
  const [level1, setLevel1] = useState("")
  const [level2Tags, setLevel2Tags] = useState<any[]>([])
  const [level2, setLevel2] = useState("")
  const [level3Tags, setLevel3Tags] = useState<any[]>([])
  const [level3, setLevel3] = useState<string[]>([])

  useEffect(() => {
    fetchTags()
  }, [])

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

  const uploadVideo = async () => {
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
      alert("動画を選択してください")
      return
    }

    const fileName = Date.now() + "-" + file.name

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
      })
      .select()
      .single()

    if (insertError) {
      console.log(insertError)
      alert("DB保存失敗")
      return
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

      <h1>動画投稿</h1>

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

      <br />

      <input
        type="file"
        accept="video/*"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />

      <br />

      <button onClick={uploadVideo}>投稿</button>
    </div>
  )
}
