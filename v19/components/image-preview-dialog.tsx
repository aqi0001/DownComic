"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input" // Import Input component
import { ChevronLeft, ChevronRight, Plus, X, Save, ImageIcon } from "lucide-react"
import { useState, useEffect } from "react"

interface ImagePreviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialImages: string[] // These are now Blob URLs or external URLs
  accountName: string
  accountId: number
  // onSaveImages now takes new image URLs and removed URLs
  onSaveImages: (accountId: number, finalImageUrls: string[], newImageUrls: string[], removedUrls: string[]) => void
}

export function ImagePreviewDialog({
  open,
  onOpenChange,
  initialImages,
  accountName,
  accountId,
  onSaveImages,
}: ImagePreviewDialogProps) {
  const [currentImageUrls, setCurrentImageUrls] = useState<string[]>([]) // Current URLs in dialog (existing + new)
  const [newImageUrlsAdded, setNewImageUrlsAdded] = useState<string[]>([]) // New URLs added within dialog
  const [removedImageUrls, setRemovedImageUrls] = useState<string[]>([]) // URLs to be removed from DB
  const [currentIndex, setCurrentIndex] = useState(0)
  const [imageUrlInput, setImageUrlInput] = useState("") // For adding new URLs

  useEffect(() => {
    if (open) {
      setCurrentImageUrls(initialImages)
      setNewImageUrlsAdded([])
      setRemovedImageUrls([])
      setCurrentIndex(0)
      setImageUrlInput("")
    }
  }, [open, initialImages])

  const allImagesInPreview = [
    ...currentImageUrls.filter((url) => !removedImageUrls.includes(url)), // Existing, not removed
    ...newImageUrlsAdded, // Newly added URLs
  ]

  const nextImage = () => {
    if (allImagesInPreview.length > 1) {
      setCurrentIndex((prev) => (prev + 1) % allImagesInPreview.length)
    }
  }

  const prevImage = () => {
    if (allImagesInPreview.length > 1) {
      setCurrentIndex((prev) => (prev - 1 + allImagesInPreview.length) % allImagesInPreview.length)
    }
  }

  const handleAddImageUrl = () => {
    if (imageUrlInput.trim() && !allImagesInPreview.includes(imageUrlInput.trim())) {
      setNewImageUrlsAdded((prev) => [...prev, imageUrlInput.trim()])
      setImageUrlInput("")
      // If no images were present before, set current index to 0 for the first new image
      if (allImagesInPreview.length === 0) {
        setCurrentIndex(0)
      }
    }
  }

  const handleRemoveImage = (indexToRemove: number) => {
    const targetImage = allImagesInPreview[indexToRemove]

    // If it's an initially loaded image, add to removed list
    if (initialImages.includes(targetImage)) {
      setRemovedImageUrls((prev) => [...prev, targetImage])
      // Also remove from currentImageUrls for immediate preview update
      setCurrentImageUrls((prev) => prev.filter((url) => url !== targetImage))
    } else {
      // If it's a newly added URL, just remove it from newImageUrlsAdded
      setNewImageUrlsAdded((prev) => prev.filter((url) => url !== targetImage))
    }

    // Adjust current index
    const newLength = allImagesInPreview.length - 1
    if (newLength === 0) {
      setCurrentIndex(0) // Reset if no images left
    } else if (currentIndex === indexToRemove) {
      setCurrentIndex(Math.max(0, indexToRemove - 1))
    } else if (currentIndex > indexToRemove) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const handleSetAsThumbnail = () => {
    if (allImagesInPreview.length > 0 && currentIndex !== 0) {
      const currentDisplayedImage = allImagesInPreview[currentIndex]

      // Separate logic for existing URLs and newly added URLs
      let updatedExistingUrls = [...currentImageUrls]
      let updatedNewUrls = [...newImageUrlsAdded]

      const isExistingUrl = initialImages.includes(currentDisplayedImage)

      if (isExistingUrl) {
        // Move existing URL to front of updatedExistingUrls
        updatedExistingUrls = updatedExistingUrls.filter((url) => url !== currentDisplayedImage)
        updatedExistingUrls.unshift(currentDisplayedImage)
        setCurrentImageUrls(updatedExistingUrls)
      } else {
        // Move newly added URL to front of updatedNewUrls
        updatedNewUrls = updatedNewUrls.filter((url) => url !== currentDisplayedImage)
        updatedNewUrls.unshift(currentDisplayedImage)
        setNewImageUrlsAdded(updatedNewUrls)
      }
      setCurrentIndex(0) // Always set to 0 after setting as thumbnail
    }
  }

  const handleSave = () => {
    // The final list of existing images will be currentImageUrls (after filtering removed ones)
    const finalExistingImageUrls = currentImageUrls.filter((url) => !removedImageUrls.includes(url))

    // The new images are those in newImageUrlsAdded
    const newUrlsToSave = newImageUrlsAdded

    onSaveImages(accountId, finalExistingImageUrls, newUrlsToSave, removedImageUrls)
    onOpenChange(false)
  }

  const handleClose = () => {
    // On close, reset to initial state provided by props
    setCurrentImageUrls(initialImages)
    setNewImageUrlsAdded([])
    setRemovedImageUrls([])
    setCurrentIndex(0)
    setImageUrlInput("")
    onOpenChange(false)
  }

  const currentDisplayImage = allImagesInPreview[currentIndex]

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            {accountName} - 图片预览 ({allImagesInPreview.length > 0 ? currentIndex + 1 : 0}/{allImagesInPreview.length}
            )
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            {allImagesInPreview.length > 0 ? (
              <img
                src={currentDisplayImage || "/placeholder.svg"}
                alt={`${accountName} 图片 ${currentIndex + 1}`}
                className="w-full h-auto max-h-[500px] object-contain rounded-lg"
              />
            ) : (
              <div className="w-full h-[300px] bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                暂无图片
              </div>
            )}

            {allImagesInPreview.length > 1 && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                  onClick={prevImage}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                  onClick={nextImage}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>

          <div className="flex justify-between items-center">
            <div className="flex space-x-2">
              {allImagesInPreview.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-3 h-3 rounded-full ${index === currentIndex ? "bg-blue-500" : "bg-gray-300"}`}
                />
              ))}
            </div>

            <div className="flex space-x-2">
              {allImagesInPreview.length > 0 && currentIndex !== 0 && (
                <Button variant="outline" size="sm" onClick={handleSetAsThumbnail}>
                  <ImageIcon className="h-4 w-4 mr-2" />
                  设为封面
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 max-h-[150px] overflow-y-auto p-1 border rounded-lg">
            {allImagesInPreview.map((imageSrc, index) => (
              <div key={imageSrc + index} className="relative group">
                <button
                  onClick={() => setCurrentIndex(index)}
                  className={`relative aspect-square rounded-lg overflow-hidden border-2 ${
                    index === currentIndex ? "border-blue-500" : "border-gray-200"
                  }`}
                >
                  <img
                    src={imageSrc || "/placeholder.svg"}
                    alt={`缩略图 ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
                {index !== 0 && ( // Allow setting as cover only if not already the first image
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentIndex(index) // Select first, then set as thumbnail
                      handleSetAsThumbnail()
                    }}
                    className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs py-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    设为封面
                  </button>
                )}
              </div>
            ))}
            {allImagesInPreview.length < 20 && (
              <div className="relative aspect-square rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                <Input
                  type="text"
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  placeholder="添加图片 URL"
                  className="absolute inset-0 opacity-0 cursor-pointer" // Hidden input for visual effect
                  onBlur={handleAddImageUrl} // Add URL when input loses focus
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleAddImageUrl()
                    }
                  }}
                />
                <Plus className="h-8 w-8 text-gray-400" />
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              取消
            </Button>
            <Button type="button" onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              保存
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
