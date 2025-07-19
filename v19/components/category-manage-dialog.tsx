"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, X, GripVertical } from "lucide-react"
import { updateCustomCategories } from "@/lib/actions"
import { useToast } from "@/hooks/use-toast"
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

interface CategoryManageDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  categories: string[]
  onCategoriesChange: (categories: string[]) => void
}

interface SortableItemProps {
  id: string
  children: React.ReactNode
}

function SortableItem({ id, children }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="flex items-center gap-2 bg-gray-50 p-2 rounded-md border"
    >
      <button {...listeners} className="cursor-grab text-gray-400 hover:text-gray-600">
        <GripVertical className="h-5 w-5" />
      </button>
      {children}
    </div>
  )
}

export function CategoryManageDialog({
  open,
  onOpenChange,
  categories,
  onCategoriesChange,
}: CategoryManageDialogProps) {
  const [currentCategories, setCurrentCategories] = useState<string[]>([])
  const [newCategory, setNewCategory] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    // Filter out "全部" from the categories for management, as it's a special filter value
    setCurrentCategories(categories.filter((cat) => cat !== "全部"))
  }, [categories])

  const handleAddCategory = () => {
    if (newCategory.trim() !== "" && !currentCategories.includes(newCategory.trim())) {
      setCurrentCategories((prev) => [...prev, newCategory.trim()])
      setNewCategory("")
    }
  }

  const handleRemoveCategory = (categoryToRemove: string) => {
    setCurrentCategories((prev) => prev.filter((cat) => cat !== categoryToRemove))
  }

  const handleSaveCategories = async () => {
    // Add "全部" back to the list before saving, if it's not already there
    const categoriesToSave = ["全部", ...currentCategories]
    const result = await updateCustomCategories(categoriesToSave)
    if (result.success) {
      onCategoriesChange(categoriesToSave) // Update parent state
      toast({ title: "标签保存成功", description: result.message })
      onOpenChange(false)
    } else {
      toast({ title: "保存失败", description: result.message, variant: "destructive" })
    }
  }

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const handleDragEnd = (event: any) => {
    const { active, over } = event

    if (active.id !== over.id) {
      setCurrentCategories((items) => {
        const oldIndex = items.indexOf(active.id)
        const newIndex = items.indexOf(over.id)
        const newItems = [...items]
        const [movedItem] = newItems.splice(oldIndex, 1)
        newItems.splice(newIndex, 0, movedItem)
        return newItems
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>管理自定义标签</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center space-x-2">
            <Input
              id="new-category"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="新标签名称"
              className="flex-grow"
            />
            <Button type="button" onClick={handleAddCategory}>
              <Plus className="h-4 w-4 mr-2" />
              添加
            </Button>
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={currentCategories} strategy={verticalListSortingStrategy}>
                {currentCategories.map((cat) => (
                  <SortableItem key={cat} id={cat}>
                    <Label className="flex-grow">{cat}</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => handleRemoveCategory(cat)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </SortableItem>
                ))}
              </SortableContext>
            </DndContext>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" onClick={handleSaveCategories}>
            保存标签
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
