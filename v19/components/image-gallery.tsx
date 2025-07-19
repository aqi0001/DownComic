"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Edit, Trash2, ExternalLink, Download, MoreHorizontal, Star, ChevronDown, ChevronRight } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import type { Account } from "@/lib/actions"
import { toast } from "@/components/ui/use-toast"

interface ImageGalleryProps {
  accounts: Account[]
  isLoggedIn: boolean
  onEditClick: (account: Account) => void
  onDeleteClick: (accountId: number, images: string[]) => void
  onImagePreview: (images: string[], accountName: string, accountId: number) => void
  onAccountClick: (url: string) => void
  editingAccountId: number | null
  currentEditData: Partial<Account>
  handleEditChange: (field: keyof Account, value: string | number) => void
  handleStarClick: (rating: number) => void
  handleSaveClick: (accountId: number) => void
  handleCancelClick: () => void
  plotFilters: string[]
  yearFilters: string[]
  typeFilters: string[]
  authorFilters: string[] // New prop for author filters
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

export function ImageGallery({
  accounts,
  isLoggedIn,
  onEditClick,
  onDeleteClick,
  onImagePreview,
  onAccountClick,
  editingAccountId,
  currentEditData,
  handleEditChange,
  handleStarClick,
  handleSaveClick,
  handleCancelClick,
  plotFilters,
  yearFilters,
  typeFilters,
  authorFilters, // Destructure new prop
}: ImageGalleryProps) {
  const [localEditingAccountId, setLocalEditingAccountId] = useState<number | null>(null)
  const [localEditData, setLocalEditData] = useState<Partial<Account>>({})
  const [expandedVolumes, setExpandedVolumes] = useState<Set<number>>(new Set())

  const handleLocalEditClick = (account: Account) => {
    setLocalEditingAccountId(account.id)
    setLocalEditData(account)
  }

  const handleLocalEditChange = (field: keyof Account, value: string | number) => {
    setLocalEditData((prev) => ({ ...prev, [field]: value }))
  }

  const handleLocalStarClick = (rating: number) => {
    setLocalEditData((prev) => ({ ...prev, level: rating }))
  }

  const handleLocalSaveClick = async (accountId: number) => {
    // In a real app, you'd call the server action here with localEditData
    // For this simulation, we'll just update the local state and show a toast
    console.log("Saving changes for account:", accountId, localEditData)
    toast({
      title: "保存成功",
      description: "漫画信息已成功更新 (模拟)。",
    })
    setLocalEditingAccountId(null)
    setLocalEditData({})
    // You might want to re-fetch accounts or update the parent state here
    // For now, the parent's onEditClick handles the actual update via dialog
    onEditClick({ ...accounts.find((acc) => acc.id === accountId)!, ...localEditData } as Account)
  }

  const handleLocalCancelClick = () => {
    setLocalEditingAccountId(null)
    setLocalEditData({})
  }

  const toggleVolumeExpansion = (accountId: number) => {
    setExpandedVolumes((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(accountId)) {
        newSet.delete(accountId)
      } else {
        newSet.add(accountId)
      }
      return newSet
    })
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {accounts.map((account) => {
        const isExpanded = expandedVolumes.has(account.id)
        const hasVolumes = account.volumes && account.volumes.length > 0

        return (
          <Card key={account.id} className="flex flex-col">
            <CardHeader className="p-0">
              <div className="relative w-full h-48 bg-gray-100 rounded-t-lg overflow-hidden">
                <img
                  src={account.cover_image_url || "/placeholder.svg?height=200&width=150"}
                  alt={account.name}
                  className="w-full h-full object-cover"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                  onClick={() => onImagePreview(account.images, account.name, account.id)}
                  title="查看所有图片"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 flex-grow">
              {localEditingAccountId === account.id ? (
                <div className="grid gap-2">
                  <Input
                    value={localEditData.name || ""}
                    onChange={(e) => handleLocalEditChange("name", e.target.value)}
                    className="text-lg font-semibold"
                  />
                  <Select
                    value={localEditData.platform || ""}
                    onValueChange={(value) => handleLocalEditChange("platform", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="地区" />
                    </SelectTrigger>
                    <SelectContent>
                      {["日本", "欧美", "韩国", "港台", "内地", "其他"].map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={localEditData.category || ""}
                    onValueChange={(value) => handleLocalEditChange("category", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="标签" />
                    </SelectTrigger>
                    <SelectContent>
                      {plotFilters
                        .filter((f) => f !== "全部")
                        .map((p) => (
                          <SelectItem key={p} value={p}>
                            {p}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={localEditData.type || ""}
                    onValueChange={(value) => handleLocalEditChange("type", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="类型" />
                    </SelectTrigger>
                    <SelectContent>
                      {typeFilters
                        .filter((f) => f !== "全部")
                        .map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={localEditData.year || ""}
                    onValueChange={(value) => handleLocalEditChange("year", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="年份" />
                    </SelectTrigger>
                    <SelectContent>
                      {yearFilters
                        .filter((f) => f !== "全部")
                        .map((y) => (
                          <SelectItem key={y} value={y}>
                            {y}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  {/* Author input in edit mode */}
                  <Input
                    value={localEditData.author || ""}
                    onChange={(e) => handleLocalEditChange("author", e.target.value)}
                    placeholder="作者"
                  />
                  <StarRating level={localEditData.level || 0} onStarClick={handleLocalStarClick} editable />
                  <Textarea
                    value={localEditData.description || ""}
                    onChange={(e) => handleLocalEditChange("description", e.target.value)}
                    placeholder="故事简介"
                    rows={3}
                  />
                </div>
              ) : (
                <>
                  <CardTitle className="text-lg font-semibold mb-1">{account.name}</CardTitle>
                  <p className="text-sm text-gray-600 mb-2">
                    {account.platform} · {account.category}
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    {account.type} · {account.year} {account.author && `· ${account.author}`} {/* Display author */}
                  </p>
                  {hasVolumes && <p className="text-xs text-gray-500 mb-2">共 {account.volumes!.length} 卷</p>}
                  <StarRating level={account.level || 0} />
                  <p className="text-sm text-gray-700 mt-2 line-clamp-3">{account.description || "无简介"}</p>
                </>
              )}
            </CardContent>
            <CardFooter className="flex flex-col p-4 pt-0">
              {localEditingAccountId === account.id ? (
                <div className="flex gap-2 w-full">
                  <Button size="sm" onClick={() => handleLocalSaveClick(account.id)} className="flex-1">
                    保存
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleLocalCancelClick}
                    className="flex-1 bg-transparent"
                  >
                    取消
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-2 w-full">
                  {account.url && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full flex items-center justify-center bg-transparent"
                      onClick={() => onAccountClick(account.url!)}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      查看漫画
                    </Button>
                  )}

                  {/* 下载按钮区域 */}
                  <div className="space-y-2">
                    {/* 总下载按钮 */}
                    {account.download_url && isLoggedIn && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full flex items-center justify-center bg-transparent"
                        onClick={() => window.open(account.download_url!, "_blank")}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        总下载
                      </Button>
                    )}

                    {/* 分卷下载 */}
                    {hasVolumes && isLoggedIn && (
                      <Collapsible open={isExpanded} onOpenChange={() => toggleVolumeExpansion(account.id)}>
                        <CollapsibleTrigger asChild>
                          <Button variant="outline" size="sm" className="w-full bg-transparent">
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4 mr-2" />
                            ) : (
                              <ChevronRight className="h-4 w-4 mr-2" />
                            )}
                            分卷下载 ({account.volumes!.length})
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="space-y-1 mt-2">
                          {account.volumes!.map((volume, index) => (
                            <div key={index} className="text-xs">
                              {volume.download_url ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="w-full justify-start h-6 px-2 text-xs"
                                  onClick={() => window.open(volume.download_url!, "_blank")}
                                  title={volume.volume_name || volume.volume_number}
                                >
                                  <Download className="h-3 w-3 mr-1" />
                                  {volume.volume_number}
                                  {volume.volume_name && ` - ${volume.volume_name}`}
                                </Button>
                              ) : (
                                <div className="w-full justify-start h-6 px-2 text-xs text-gray-500 flex items-center">
                                  <Download className="h-3 w-3 mr-1" />
                                  {volume.volume_number}
                                  {volume.volume_name && ` - ${volume.volume_name}`}
                                </div>
                              )}
                            </div>
                          ))}
                        </CollapsibleContent>
                      </Collapsible>
                    )}

                    {/* 非登录用户的简单下载按钮 */}
                    {!isLoggedIn && (account.download_url || hasVolumes) && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full flex items-center justify-center bg-transparent"
                        onClick={() => {
                          if (account.download_url) {
                            window.open(account.download_url, "_blank")
                          } else if (hasVolumes && account.volumes![0].download_url) {
                            window.open(account.volumes![0].download_url, "_blank")
                          }
                        }}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        下载漫画
                      </Button>
                    )}
                  </div>

                  {isLoggedIn && (
                    <div className="flex gap-2 w-full">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 bg-transparent"
                        onClick={() => onEditClick(account)} // Use parent's edit click to open dialog
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        编辑
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-red-600 hover:text-red-700 bg-transparent"
                        onClick={() => onDeleteClick(account.id, account.images)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        删除
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}
