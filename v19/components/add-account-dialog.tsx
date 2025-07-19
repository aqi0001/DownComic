"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Star, Plus, Trash2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import type { VolumeInfo } from "@/lib/actions"

interface AddAccountDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  categories: string[]
  plotFilters: string[]
  regionFilters: string[]
  yearFilters: string[]
  typeFilters: string[]
  languageFilters: string[]
  authorFilters: string[] // New prop for author filters
  initialAccount?: {
    id?: number
    name?: string
    platform?: string
    url?: string
    category?: string
    level?: number
    description?: string
    download_url?: string
    year?: string
    type?: string
    language?: string
    author?: string // Add author to initialAccount type
    images?: string[]
    volumes?: VolumeInfo[]
  } | null
  onAddAccount: (formData: FormData, accountId: number | null) => void
}

function StarRating({
  level,
  onStarClick,
  editable = false,
}: { level: number; onStarClick?: (rating: number) => void; editable?: boolean }) {
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => editable && onStarClick?.(star)}
          disabled={!editable}
          className={editable ? "cursor-pointer" : "cursor-default"}
        >
          <Star className={`h-4 w-4 ${star <= level ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
        </button>
      ))}
    </div>
  )
}

export function AddAccountDialog({
  open,
  onOpenChange,
  categories,
  plotFilters,
  regionFilters,
  yearFilters,
  typeFilters,
  languageFilters,
  authorFilters, // Destructure new prop
  initialAccount,
  onAddAccount,
}: AddAccountDialogProps) {
  const [name, setName] = useState(initialAccount?.name || "")
  const [platform, setPlatform] = useState(initialAccount?.platform || "")
  const [url, setUrl] = useState(initialAccount?.url || "")
  const [category, setCategory] = useState(initialAccount?.category || "")
  const [level, setLevel] = useState(initialAccount?.level || 0)
  const [description, setDescription] = useState(initialAccount?.description || "")
  const [downloadUrl, setDownloadUrl] = useState(initialAccount?.download_url || "")
  const [year, setYear] = useState(initialAccount?.year || "")
  const [type, setType] = useState(initialAccount?.type || "")
  const [language, setLanguage] = useState(initialAccount?.language || "")
  const [author, setAuthor] = useState(initialAccount?.author || "") // New state for author
  const [imageUrls, setImageUrls] = useState<string[]>(initialAccount?.images || [])
  const [newImageUrl, setNewImageUrl] = useState("")
  const [volumes, setVolumes] = useState<VolumeInfo[]>(initialAccount?.volumes || [])

  useEffect(() => {
    if (open) {
      setName(initialAccount?.name || "")
      setPlatform(initialAccount?.platform || "")
      setUrl(initialAccount?.url || "")
      setCategory(initialAccount?.category || "")
      setLevel(initialAccount?.level || 0)
      setDescription(initialAccount?.description || "")
      setDownloadUrl(initialAccount?.download_url || "")
      setYear(initialAccount?.year || "")
      setType(initialAccount?.type || "")
      setLanguage(initialAccount?.language || "")
      setAuthor(initialAccount?.author || "") // Set author state
      setImageUrls(initialAccount?.images || [])
      setVolumes(initialAccount?.volumes || [])
      setNewImageUrl("")
    }
  }, [open, initialAccount])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || !platform || !category || level === 0) {
      toast({
        title: "输入错误",
        description: "请填写所有必填项（漫画名称、地区、标签、评分）。",
        variant: "destructive",
      })
      return
    }

    const formData = new FormData()
    if (initialAccount?.id) {
      formData.append("id", initialAccount.id.toString())
    }
    formData.append("name", name)
    formData.append("platform", platform)
    formData.append("url", url)
    formData.append("category", category)
    formData.append("level", level.toString())
    formData.append("description", description)
    formData.append("download_url", downloadUrl)
    formData.append("year", year)
    formData.append("type", type)
    formData.append("language", language)
    formData.append("author", author) // Append author to form data
    formData.append("volumes", JSON.stringify(volumes))

    // For initial image submission when creating a new account
    if (!initialAccount?.id && imageUrls.length > 0) {
      imageUrls.forEach((img) => formData.append("images", img))
    }

    onAddAccount(formData, initialAccount?.id || null)
  }

  const handleAddImageUrl = () => {
    if (newImageUrl && !imageUrls.includes(newImageUrl)) {
      setImageUrls((prev) => [...prev, newImageUrl])
      setNewImageUrl("")
    } else if (imageUrls.includes(newImageUrl)) {
      toast({
        title: "图片已存在",
        description: "该图片URL已在列表中。",
        variant: "warning",
      })
    }
  }

  const handleRemoveImageUrl = (urlToRemove: string) => {
    setImageUrls((prev) => prev.filter((url) => url !== urlToRemove))
  }

  const handleAddVolume = () => {
    setVolumes((prev) => [...prev, { volume_number: "", volume_name: "", download_url: "" }])
  }

  const handleRemoveVolume = (index: number) => {
    setVolumes((prev) => prev.filter((_, i) => i !== index))
  }

  const handleVolumeChange = (index: number, field: keyof VolumeInfo, value: string) => {
    setVolumes((prev) => prev.map((vol, i) => (i === index ? { ...vol, [field]: value } : vol)))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialAccount ? "编辑漫画信息" : "添加新漫画"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              漫画名称 <span className="text-red-500">*</span>
            </Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" required />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="platform" className="text-right">
              地区 <span className="text-red-500">*</span>
            </Label>
            <Select value={platform} onValueChange={setPlatform} required>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="选择地区" />
              </SelectTrigger>
              <SelectContent>
                {regionFilters.map((filter) => (
                  <SelectItem key={filter} value={filter}>
                    {filter}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">
              标签 <span className="text-red-500">*</span>
            </Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="选择标签" />
              </SelectTrigger>
              <SelectContent>
                {plotFilters.map((filter) => (
                  <SelectItem key={filter} value={filter}>
                    {filter}
                  </SelectItem>
                ))}
                {categories
                  .filter((c) => c !== "全部" && !plotFilters.includes(c))
                  .map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="level" className="text-right">
              评分 <span className="text-red-500">*</span>
            </Label>
            <div className="col-span-3">
              <StarRating level={level} onStarClick={setLevel} editable />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="year" className="text-right">
              年份
            </Label>
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="选择年份" />
              </SelectTrigger>
              <SelectContent>
                {yearFilters.map((filter) => (
                  <SelectItem key={filter} value={filter}>
                    {filter}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">
              类型
            </Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="选择类型" />
              </SelectTrigger>
              <SelectContent>
                {typeFilters.map((filter) => (
                  <SelectItem key={filter} value={filter}>
                    {filter}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="language" className="text-right">
              语言
            </Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="选择语言" />
              </SelectTrigger>
              <SelectContent>
                {languageFilters.map((filter) => (
                  <SelectItem key={filter} value={filter}>
                    {filter}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* New Author Input Field */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="author" className="text-right">
              作者
            </Label>
            <Input
              id="author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="col-span-3"
              placeholder="漫画作者（可选）"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="url" className="text-right">
              漫画链接
            </Label>
            <Input id="url" value={url} onChange={(e) => setUrl(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="downloadUrl" className="text-right">
              总下载地址
            </Label>
            <Input
              id="downloadUrl"
              value={downloadUrl}
              onChange={(e) => setDownloadUrl(e.target.value)}
              className="col-span-3"
              placeholder="整套漫画的下载地址（可选）"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              故事简介
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
            />
          </div>

          {/* 卷数管理 */}
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right pt-2">卷数目录</Label>
            <div className="col-span-3 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">管理各卷信息和下载链接</span>
                <Button type="button" onClick={handleAddVolume} size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  添加卷
                </Button>
              </div>
              {volumes.length === 0 && (
                <div className="text-sm text-gray-500 text-center py-4 border border-dashed rounded-md">
                  暂无卷数信息，点击"添加卷"开始添加
                </div>
              )}
              {volumes.map((volume, index) => (
                <div key={index} className="border rounded-md p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">第 {index + 1} 卷</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveVolume(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">卷号</Label>
                      <Input
                        placeholder="如：第1卷、Vol.1"
                        value={volume.volume_number}
                        onChange={(e) => handleVolumeChange(index, "volume_number", e.target.value)}
                        size="sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">卷名称（可选）</Label>
                      <Input
                        placeholder="如：Romance Dawn"
                        value={volume.volume_name || ""}
                        onChange={(e) => handleVolumeChange(index, "volume_name", e.target.value)}
                        size="sm"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">下载链接</Label>
                    <Input
                      placeholder="该卷的下载链接"
                      value={volume.download_url || ""}
                      onChange={(e) => handleVolumeChange(index, "download_url", e.target.value)}
                      size="sm"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Image URL input for new accounts only */}
          {!initialAccount?.id && (
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="newImageUrl" className="text-right pt-2">
                封面图片URL
              </Label>
              <div className="col-span-3 flex flex-col gap-2">
                <div className="flex w-full items-center space-x-2">
                  <Input
                    id="newImageUrl"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="添加图片URL"
                  />
                  <Button type="button" onClick={handleAddImageUrl}>
                    添加
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto border rounded-md p-2">
                  {imageUrls.length === 0 && <span className="text-gray-500 text-sm">暂无图片</span>}
                  {imageUrls.map((imgUrl, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={imgUrl || "/placeholder.svg"}
                        alt={`预览 ${index + 1}`}
                        className="w-16 h-16 object-cover rounded-md"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-5 w-5 rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleRemoveImageUrl(imgUrl)}
                      >
                        x
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button type="submit">{initialAccount ? "保存更改" : "添加漫画"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
