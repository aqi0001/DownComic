"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  Plus,
  Search,
  Star,
  Edit,
  Trash2,
  LogOut,
  Settings,
  ExternalLink,
  Download,
  Book,
  List,
  Grid,
  ChevronDown,
  ChevronRight,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { AddAccountDialog } from "@/components/add-account-dialog"
import { LoginDialog } from "@/components/login-dialog"
import { CategoryManageDialog } from "@/components/category-manage-dialog"
import { ImagePreviewDialog } from "@/components/image-preview-dialog"
import { ImageGallery } from "@/components/image-gallery"
import {
  getAccounts,
  createAccount,
  updateAccount,
  deleteAccount,
  getCustomCategories,
  getAuthors, // Import getAuthors
  type Account,
} from "@/lib/actions"
import { useToast } from "@/hooks/use-toast"
import { Label } from "@/components/ui/label"

// Helper function to format serial number
function formatSerialNumber(num: number): string {
  return String(num).padStart(7, "0")
}

// 漫画筛选选项
const regionFilters = ["全部", "日本", "欧美", "韩国", "港台", "内地", "其他"]

const basePlotFilters = [
  "全部",
  "热血",
  "冒险",
  "打斗",
  "爱情",
  "历史",
  "机甲",
  "枪战",
  "体育",
  "校园",
  "教室",
  "美食",
  "超能力",
  "侦探",
  "舞蹈",
  "杂志",
]

const typeFilters = ["全部", "页漫", "条漫", "动态"]

const alphabetFilters = [
  "全部",
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I", // Changed from IJ to I
  "J", // Added J
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
  "*",
]

const yearFilters = [
  "全部",
  "2025",
  "2024",
  "2023",
  "2022",
  "2021",
  "2020",
  "2019",
  "2018",
  "2017",
  "2016",
  "2015",
  "2014",
  "2013",
  "2012",
  "2011",
  "2010",
  "2009",
  "2008",
  "2007",
  "2006",
  "2005",
  "2004",
  "2003",
  "2002",
  "2001",
  "2000",
  "90年代",
  "80年代",
]

const languageFilters = ["全部", "中文", "生肉"]

// 状态筛选选项
const statusFilters = ["全部", "热门", "推荐", "完结", "连载", "新作"]

// 硬编码的默认分类标签列表（现在用于管理自定义标签）
const hardcodedDefaultCategories = ["全部"]

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

// 获取拼音首字母的辅助函数
function getFirstLetter(name: string): string {
  const firstChar = name.charAt(0).toUpperCase()

  // 如果是数字，返回 *
  if (/\d/.test(firstChar)) {
    return "*"
  }

  // 如果是英文字母，直接返回
  if (/[A-Z]/.test(firstChar)) {
    return firstChar
  }

  // 中文字符的拼音首字母映射（简化版本）
  const pinyinMap: { [key: string]: string } = {
    阿: "A",
    爱: "A",
    安: "A",
    暗: "A",
    八: "B",
    白: "B",
    百: "B",
    班: "B",
    半: "B",
    包: "B",
    宝: "B",
    北: "B",
    本: "B",
    比: "B",
    变: "B",
    表: "B",
    别: "B",
    冰: "B",
    不: "B",
    才: "C",
    彩: "C",
    草: "C",
    茶: "C",
    长: "C",
    超: "C",
    车: "C",
    成: "C",
    城: "C",
    吃: "C",
    出: "C",
    春: "C",
    次: "C",
    从: "C",
    大: "D",
    带: "D",
    单: "D",
    当: "D",
    到: "D",
    的: "D",
    地: "D",
    第: "D",
    点: "D",
    电: "D",
    东: "D",
    动: "D",
    都: "D",
    读: "D",
    对: "D",
    多: "D",
    二: "E",
    发: "F",
    法: "F",
    反: "F",
    方: "F",
    放: "F",
    非: "F",
    飞: "F",
    分: "F",
    风: "F",
    服: "F",
    福: "F",
    父: "F",
    复: "F",
    该: "G",
    感: "G",
    刚: "G",
    高: "G",
    告: "G",
    哥: "G",
    给: "G",
    根: "G",
    更: "G",
    工: "G",
    公: "G",
    狗: "G",
    古: "G",
    故: "G",
    关: "G",
    光: "G",
    广: "G",
    国: "G",
    过: "G",
    还: "H",
    海: "H",
    汉: "H",
    好: "H",
    号: "H",
    和: "H",
    黑: "H",
    很: "H",
    红: "H",
    后: "H",
    花: "H",
    话: "H",
    画: "H",
    坏: "H",
    欢: "H",
    换: "H",
    黄: "H",
    回: "H",
    会: "H",
    火: "H",
    或: "H",
    机: "J",
    鸡: "J",
    极: "J",
    几: "J",
    己: "J",
    记: "J",
    家: "J",
    加: "J",
    间: "J",
    见: "J",
    建: "J",
    江: "J",
    将: "J",
    教: "J",
    叫: "J",
    接: "J",
    街: "J",
    结: "J",
    姐: "J",
    解: "J",
    今: "J",
    金: "J",
    进: "J",
    近: "J",
    经: "J",
    九: "J",
    就: "J",
    局: "J",
    举: "J",
    句: "J",
    开: "K",
    看: "K",
    可: "K",
    课: "K",
    空: "K",
    口: "K",
    快: "K",
    来: "L",
    老: "L",
    了: "L",
    冷: "L",
    里: "L",
    理: "L",
    力: "L",
    立: "L",
    连: "L",
    脸: "L",
    两: "L",
    亮: "L",
    六: "L",
    龙: "L",
    楼: "L",
    路: "L",
    绿: "L",
    妈: "M",
    马: "M",
    买: "M",
    卖: "M",
    满: "M",
    慢: "M",
    忙: "M",
    猫: "M",
    没: "M",
    美: "M",
    门: "M",
    们: "M",
    米: "M",
    面: "M",
    民: "M",
    明: "M",
    名: "M",
    母: "M",
    那: "N",
    哪: "N",
    男: "N",
    南: "N",
    难: "N",
    内: "N",
    能: "N",
    你: "N",
    年: "N",
    鸟: "N",
    女: "N",
    哦: "O",
    跑: "P",
    朋: "P",
    片: "P",
    漂: "P",
    票: "P",
    苹: "P",
    七: "Q",
    其: "Q",
    起: "Q",
    气: "Q",
    汽: "Q",
    前: "Q",
    钱: "Q",
    亲: "Q",
    青: "Q",
    清: "Q",
    情: "Q",
    请: "Q",
    去: "Q",
    全: "Q",
    群: "Q",
    然: "R",
    让: "R",
    人: "R",
    认: "R",
    日: "R",
    如: "R",
    入: "R",
    三: "S",
    色: "S",
    山: "S",
    上: "S",
    少: "S",
    谁: "S",
    什: "S",
    生: "S",
    声: "S",
    十: "S",
    时: "S",
    实: "S",
    是: "S",
    事: "S",
    手: "S",
    书: "S",
    水: "S",
    说: "S",
    四: "S",
    送: "S",
    苏: "S",
    算: "S",
    他: "T",
    她: "T",
    太: "T",
    天: "T",
    田: "T",
    条: "T",
    听: "T",
    同: "T",
    头: "T",
    图: "T",
    土: "T",
    我: "W",
    五: "W",
    午: "W",
    舞: "W",
    物: "W",
    西: "X",
    希: "X",
    喜: "X",
    下: "X",
    先: "X",
    现: "X",
    想: "X",
    向: "X",
    小: "X",
    校: "X",
    笑: "X",
    些: "X",
    写: "X",
    谢: "X",
    心: "X",
    新: "X",
    星: "X",
    行: "X",
    姓: "X",
    兄: "X",
    学: "X",
    雪: "X",
    呀: "Y",
    眼: "Y",
    羊: "Y",
    样: "Y",
    要: "Y",
    也: "Y",
    夜: "Y",
    一: "Y",
    衣: "Y",
    医: "Y",
    已: "Y",
    以: "Y",
    意: "Y",
    因: "Y",
    音: "Y",
    银: "Y",
    应: "Y",
    英: "Y",
    用: "Y",
    有: "Y",
    友: "Y",
    又: "Y",
    右: "Y",
    鱼: "Y",
    雨: "Y",
    语: "Y",
    月: "Y",
    云: "Y",
    运: "Y",
    在: "Z",
    早: "Z",
    怎: "Z",
    站: "Z",
    张: "Z",
    长: "Z",
    找: "Z",
    这: "Z",
    真: "Z",
    正: "Z",
    知: "Z",
    之: "Z",
    只: "Z",
    中: "Z",
    种: "Z",
    重: "Z",
    主: "Z",
    住: "Z",
    祝: "Z",
    专: "Z",
    转: "Z",
    准: "Z",
    桌: "Z",
    字: "Z",
    自: "Z",
    走: "Z",
    最: "Z",
    左: "Z",
    作: "Z",
    做: "Z",
    坐: "Z",
  }

  return pinyinMap[firstChar] || "#"
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false)
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false)
  const [selectedRegions, setSelectedRegions] = useState<string[]>(["全部"])
  const [selectedPlots, setSelectedPlots] = useState<string[]>(["全部"])
  const [selectedTypes, setSelectedTypes] = useState<string[]>(["全部"])
  const [selectedAlphabets, setSelectedAlphabets] = useState<string[]>(["全部"])
  const [selectedYears, setSelectedYears] = useState<string[]>(["全部"])
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(["全部"])
  const [selectedAuthors, setSelectedAuthors] = useState<string[]>(["全部"]) // New state for selected authors
  const [selectedStatus, setSelectedStatus] = useState<string[]>(["全部"])
  const [selectedCategories, setSelectedCategories] = useState<string[]>(["全部"])
  const [categories, setCategories] = useState<string[]>(hardcodedDefaultCategories)
  const [authors, setAuthors] = useState<string[]>([]) // New state for authors list
  const [sortBy, setSortBy] = useState<string>("updated_at")
  const [sortOrder, setSortOrder] = useState<string>("desc")
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")
  const [accounts, setAccounts] = useState<Account[]>([])
  const [accountToEdit, setAccountToEdit] = useState<Account | null>(null)
  const [imagePreviewData, setImagePreviewData] = useState<{
    open: boolean
    images: string[]
    accountName: string
    accountId?: number
  }>({
    open: false,
    images: [],
    accountName: "",
  })
  const [expandedVolumes, setExpandedVolumes] = useState<Set<number>>(new Set())

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12 // 每页12部漫画

  const { toast } = useToast()

  // Fetch accounts on initial load
  useEffect(() => {
    const fetchInitialAccounts = async () => {
      try {
        const initialAccounts = await getAccounts()
        setAccounts(initialAccounts)
      } catch (error) {
        console.error("Failed to fetch initial accounts:", error)
        toast({
          title: "加载失败",
          description: "无法加载漫画数据，请检查网络连接。",
          variant: "destructive",
        })
      }
    }

    fetchInitialAccounts()
  }, [toast])

  // Fetch custom categories and authors on initial load
  useEffect(() => {
    const fetchCustomCategoriesAndAuthors = async () => {
      try {
        const customCategories = await getCustomCategories()
        setCategories(["全部", ...customCategories.filter((c) => c !== "全部")])

        const fetchedAuthors = await getAuthors() // Fetch authors
        setAuthors(["全部", ...fetchedAuthors]) // Set authors
      } catch (error) {
        console.error("Failed to fetch custom categories or authors:", error)
        toast({
          title: "加载失败",
          description: "无法加载自定义标签或作者数据，请检查网络连接。",
          variant: "destructive",
        })
      }
    }

    fetchCustomCategoriesAndAuthors()
  }, [toast])

  // Reset current page to 1 when filters or search query change
  useEffect(() => {
    setCurrentPage(1)
  }, [
    searchQuery,
    selectedRegions,
    selectedPlots,
    selectedTypes,
    selectedAlphabets,
    selectedYears,
    selectedLanguages,
    selectedAuthors, // Add selectedAuthors
    selectedStatus,
    categories,
  ])

  const handleAccountClick = (url: string) => {
    window.open(url, "_blank")
  }

  const handleImagePreview = (images: string[], accountName: string, accountId: number) => {
    setImagePreviewData({ open: true, images, accountName, accountId })
  }

  const handleSaveImages = async (
    accountId: number,
    finalImageUrls: string[],
    newImageUrls: string[],
    removedUrls: string[],
  ) => {
    try {
      const accountToUpdate = accounts.find((acc) => acc.id === accountId)
      if (!accountToUpdate) {
        toast({
          title: "保存失败",
          description: "未找到要更新的漫画。",
          variant: "destructive",
        })
        return
      }

      const formData = new FormData()
      formData.append("id", accountToUpdate.id.toString())
      formData.append("name", accountToUpdate.name)
      formData.append("platform", accountToUpdate.platform)
      formData.append("url", accountToUpdate.url)
      formData.append("category", accountToUpdate.category)
      formData.append("level", accountToUpdate.level.toString())
      formData.append("description", accountToUpdate.description || "")
      formData.append("download_url", accountToUpdate.download_url || "")
      formData.append("year", accountToUpdate.year || "")
      formData.append("type", accountToUpdate.type || "")
      formData.append("language", accountToUpdate.language || "")
      formData.append("author", accountToUpdate.author || "") // Append author
      formData.append("volumes", JSON.stringify(accountToUpdate.volumes || []))

      newImageUrls.forEach((url) => formData.append("newImageUrls", url))
      removedUrls.forEach((url) => formData.append("removedImages", url))
      finalImageUrls.forEach((url) => formData.append("existingImages", url))

      const result = await updateAccount(formData)
      if (result.success && result.account) {
        setAccounts((prevAccounts) =>
          prevAccounts.map((account) => (account.id === accountId ? result.account! : account)),
        )
        toast({
          title: "保存成功",
          description: "漫画图片已成功更新。",
        })
        setImagePreviewData({ ...imagePreviewData, open: false })
      } else {
        toast({
          title: "保存失败",
          description: result.message || "更新漫画图片失败，请重试。",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to save images:", error)
      toast({
        title: "保存失败",
        description: "更新漫画图片失败，请重试。",
        variant: "destructive",
      })
    }
  }

  const handleFormSubmit = async (formData: FormData, accountId: number | null) => {
    try {
      let result
      if (accountId) {
        result = await updateAccount(formData)
      } else {
        result = await createAccount(formData)
      }

      if (result.success && result.account) {
        if (accountId) {
          setAccounts((prevAccounts) =>
            prevAccounts.map((account) => (account.id === accountId ? result.account! : account)),
          )
          toast({
            title: "保存成功",
            description: "漫画信息已成功更新。",
          })
        } else {
          setAccounts((prevAccounts) => [...prevAccounts, result.account!])
          toast({
            title: "添加成功",
            description: "新漫画已成功添加到列表。",
          })
        }
        // Re-fetch authors after adding/updating an account to keep the filter list fresh
        const updatedAuthors = await getAuthors()
        setAuthors(["全部", ...updatedAuthors])
      } else {
        toast({
          title: accountId ? "保存失败" : "添加失败",
          description:
            result.message || (accountId ? "更新漫画信息失败，请重试。" : "无法添加漫画，请检查输入并重试。"),
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error(accountId ? "Failed to update account:" : "Failed to add account:", error)
      toast({
        title: accountId ? "保存失败" : "添加失败",
        description: accountId ? "更新漫画信息失败，请重试。" : "无法添加漫画，请检查输入并重试。",
        variant: "destructive",
      })
    }
    setIsAddDialogOpen(false)
    setAccountToEdit(null)
  }

  const handleEditClick = (account: Account) => {
    setAccountToEdit(account)
    setIsAddDialogOpen(true)
  }

  const handleDeleteClick = async (accountId: number, images: string[]) => {
    try {
      const result = await deleteAccount(accountId, images)
      if (result.success) {
        setAccounts((prevAccounts) => prevAccounts.filter((account) => account.id !== accountId))
        toast({
          title: "删除成功",
          description: "漫画已成功从列表删除。",
        })
        // Re-fetch authors after deleting an account
        const updatedAuthors = await getAuthors()
        setAuthors(["全部", ...updatedAuthors])
      } else {
        toast({
          title: "删除失败",
          description: result.message || "删除漫画失败，请重试。",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to delete account:", error)
      toast({
        title: "删除失败",
        description: "删除漫画失败，请重试。",
        variant: "destructive",
      })
    }
  }

  const handleLogin = () => {
    setIsLoggedIn(true)
    setIsLoginDialogOpen(false)
    toast({
      title: "登录成功",
      description: "您已成功登录。",
    })
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    toast({
      title: "退出成功",
      description: "您已成功退出登录。",
    })
  }

  const handleFilterClick = (filterType: string, filterValue: string) => {
    switch (filterType) {
      case "region":
        setSelectedRegions([filterValue])
        break
      case "plot":
        setSelectedPlots([filterValue])
        break
      case "type":
        setSelectedTypes([filterValue])
        break
      case "alphabet":
        setSelectedAlphabets([filterValue])
        break
      case "year":
        setSelectedYears([filterValue])
        break
      case "status":
        setSelectedStatus([filterValue])
        break
      case "category":
        setSelectedCategories([filterValue])
        break
      case "language":
        setSelectedLanguages([filterValue])
        break
      case "author": // New case for author filter
        setSelectedAuthors([filterValue])
        break
      default:
        break
    }
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

  const filterAccounts = useCallback(() => {
    return accounts.filter((account) => {
      if (selectedRegions.length > 0 && !selectedRegions.includes("全部")) {
        if (!account.platform || !selectedRegions.includes(account.platform)) {
          return false
        }
      }

      if (selectedLanguages.length > 0 && !selectedLanguages.includes("全部")) {
        if (!account.language || !selectedLanguages.includes(account.language)) {
          return false
        }
      }

      if (isLoggedIn) {
        if (selectedPlots.length > 0 && !selectedPlots.includes("全部")) {
          if (!account.category || !selectedPlots.some((plot) => account.category?.includes(plot))) {
            return false
          }
        }

        if (selectedTypes.length > 0 && !selectedTypes.includes("全部")) {
          if (!account.type || !selectedTypes.includes(account.type)) {
            return false
          }
        }

        if (selectedAlphabets.length > 0 && !selectedAlphabets.includes("全部")) {
          const firstLetter = getFirstLetter(account.name)
          if (!selectedAlphabets.includes(firstLetter)) {
            return false
          }
        }

        if (selectedYears.length > 0 && !selectedYears.includes("全部")) {
          if (!account.year || !selectedYears.includes(account.year)) {
            return false
          }
        }

        if (selectedStatus.length > 0 && !selectedStatus.includes("全部")) {
          if (!account.description || !selectedStatus.some((status) => account.description!.includes(status))) {
            return false
          }
        }

        if (selectedCategories.length > 0 && !selectedCategories.includes("全部")) {
          if (!account.category || !selectedCategories.includes(account.category)) {
            return false
          }
        }

        // New author filter
        if (selectedAuthors.length > 0 && !selectedAuthors.includes("全部")) {
          if (!account.author || !selectedAuthors.includes(account.author)) {
            return false
          }
        }
      }

      if (
        searchQuery &&
        !account.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !account.category?.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !account.download_url?.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !account.year?.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !account.type?.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !account.language?.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !account.author?.toLowerCase().includes(searchQuery.toLowerCase()) // Add author to search
      ) {
        return false
      }

      return true
    })
  }, [
    accounts,
    searchQuery,
    selectedRegions,
    selectedPlots,
    selectedTypes,
    selectedAlphabets,
    selectedYears,
    selectedLanguages,
    selectedAuthors, // Add selectedAuthors to dependency array
    selectedStatus,
    categories,
    isLoggedIn,
  ])

  const sortAccounts = useCallback(
    (filteredAccounts: Account[]) => {
      return [...filteredAccounts].sort((a, b) => {
        let comparison = 0

        switch (sortBy) {
          case "updated_at":
            comparison = new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime()
            break
          case "level":
            comparison = (a.level || 0) - (b.level || 0)
            break
          case "rating_interleaved":
            comparison = (a.level || 0) - (b.level || 0)
            if (comparison === 0) {
              comparison = new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime()
            }
            break
          case "year":
            comparison = (a.year || "0").localeCompare(b.year || "0")
            break
          default:
            break
        }

        return sortOrder === "asc" ? comparison : -comparison
      })
    },
    [sortBy, sortOrder],
  )

  const filteredAndSortedAccounts = sortAccounts(filterAccounts())

  // Pagination logic
  const totalPages = Math.ceil(filteredAndSortedAccounts.length / itemsPerPage)
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentAccounts = filteredAndSortedAccounts.slice(indexOfFirstItem, indexOfLastItem)

  const handlePageChange = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber)
    }
  }

  const handleGoToPage = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      const page = Number(event.currentTarget.value)
      if (!isNaN(page) && page >= 1 && page <= totalPages) {
        setCurrentPage(page)
      } else {
        toast({
          title: "无效页码",
          description: `请输入1到${totalPages}之间的有效页码。`,
          variant: "destructive",
        })
      }
      event.currentTarget.value = "" // Clear input after jump
    }
  }

  const exportToCsv = () => {
    const csvData = filteredAndSortedAccounts.map((account) => ({
      序号: account.serial_number,
      漫画名称: account.name,
      URL: account.url,
      评分: account.level,
      更新时间: new Date(account.updated_at).toLocaleString("zh-CN"),
      下载地址: account.download_url,
      地区: account.platform,
      标签: account.category,
      类型: account.type,
      年份: account.year,
      语言: account.language,
      作者: account.author, // Add author to export
      状态: account.description,
      自定义标签: account.category,
      卷数: account.volumes?.length || 0,
    }))

    const csvHeaders = Object.keys(csvData[0]).join(",")
    const csvRows = csvData.map((account) => Object.values(account).join(","))
    const csvContent = [csvHeaders, ...csvRows].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "accounts.csv"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const exportToHtml = () => {
    const htmlData = filteredAndSortedAccounts.map((account) => ({
      序号: account.serial_number,
      漫画名称: account.name,
      URL: account.url,
      评分: account.level,
      更新时间: new Date(account.updated_at).toLocaleString("zh-CN"),
      下载地址: account.download_url,
      地区: account.platform,
      标签: account.category,
      类型: account.type,
      年份: account.year,
      语言: account.language,
      作者: account.author, // Add author to export
      状态: account.description,
      自定义标签: account.category,
      卷数: account.volumes?.length || 0,
    }))

    const htmlHeaders = Object.keys(htmlData[0])
      .map((header) => `<th>${header}</th>`)
      .join("")
    const htmlRows = htmlData
      .map((account) =>
        Object.values(account)
          .map((value) => `<td>${value}</td>`)
          .join(""),
      )
      .map((row) => `<tr>${row}</tr>`)
      .join("")

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Accounts Data</title>
    </head>
    <body>
      <table>
        <thead>
          <tr>${htmlHeaders}</tr>
        </thead>
        <tbody>
          ${htmlRows}
        </tbody>
      </table>
    </body>
    </html>
  `

    const blob = new Blob([htmlContent], { type: "text/html" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "accounts.html"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const exportToMarkdown = () => {
    const markdownData = filteredAndSortedAccounts.map((account) => ({
      序号: account.serial_number,
      漫画名称: account.name,
      URL: account.url,
      评分: account.level,
      更新时间: new Date(account.updated_at).toLocaleString("zh-CN"),
      下载地址: account.download_url,
      地区: account.platform,
      标签: account.category,
      类型: account.type,
      年份: account.year,
      语言: account.language,
      作者: account.author, // Add author to export
      状态: account.description,
      自定义标签: account.category,
      卷数: account.volumes?.length || 0,
    }))

    const markdownHeaders = Object.keys(markdownData[0]).join("|")
    const markdownRows = markdownData.map((account) => Object.values(account).join("|")).join("\n")
    const markdownSeparator = Object.keys(markdownData[0])
      .map(() => "---")
      .join("|")

    const markdownContent = `
|${markdownHeaders}|
|${markdownSeparator}|
${markdownRows}
`

    const blob = new Blob([markdownContent], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "accounts.md"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-bold flex items-center gap-2">
                <Book className="h-6 w-6" />
                DownComic
              </h1>
            </div>

            <div className="flex items-center space-x-3">
              {/* Search Input in Header */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-300 h-4 w-4" />
                <Input
                  placeholder="搜索漫画名称或标签"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64 bg-white/20 border-white/30 text-white placeholder:text-gray-200 focus:border-white focus:ring-white"
                />
              </div>

              {isLoggedIn && (
                <Button
                  onClick={() => {
                    setAccountToEdit(null)
                    setIsAddDialogOpen(true)
                  }}
                  className="bg-white text-purple-600 hover:bg-gray-100"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  添加漫画
                </Button>
              )}

              {isLoggedIn ? (
                <>
                  <Button variant="secondary" size="sm" onClick={() => setIsCategoryDialogOpen(true)}>
                    <Settings className="h-4 w-4 mr-2" />
                    添加标签
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="secondary" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        导出数据
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={exportToCsv}>导出为 CSV</DropdownMenuItem>
                      <DropdownMenuItem onClick={exportToHtml}>导出为 HTML</DropdownMenuItem>
                      <DropdownMenuItem onClick={exportToMarkdown}>导出为 Markdown</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button variant="destructive" size="sm" onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    退出登录
                  </Button>
                </>
              ) : (
                <Button variant="secondary" size="sm" onClick={() => setIsLoginDialogOpen(true)}>
                  管理员登录
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-6">
        {/* Welcome Slogan */}
        <div className="bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 text-white p-4 rounded-lg shadow-md mb-6 text-center">
          <p className="text-lg font-semibold mb-2">欢迎来到 DownComic 下漫画网站！</p>
          <p className="text-sm">
            这里有超过一万部漫画资源，覆盖各种题材和风格，无需注册，一键高清下载，零广告干扰，持续更新，适合所有漫迷。
            无论独享还是分享，这里都能带来欢乐。快来下载，开启属于您的漫画新体验！
          </p>
        </div>

        {/* Controls (Filters remain visible) */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          {/* 地区筛选 */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700 w-20">地区筛选：</span>
              <div className="flex space-x-2 flex-wrap">
                {regionFilters.map((region) => (
                  <button
                    key={region}
                    onClick={() => handleFilterClick("region", region)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      selectedRegions.includes(region)
                        ? "bg-purple-500 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {region}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 语言筛选 (Always visible) */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700 w-20">语言筛选：</span>
              <div className="flex space-x-2 flex-wrap">
                {languageFilters.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => handleFilterClick("language", lang)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      selectedLanguages.includes(lang)
                        ? "bg-purple-600 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {isLoggedIn && (
            <>
              {/* 标签筛选 */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-gray-700 w-20">标签筛选：</span>
                  <div className="flex space-x-2 flex-wrap">
                    {basePlotFilters.map((plot) => (
                      <button
                        key={plot}
                        onClick={() => handleFilterClick("plot", plot)}
                        className={`px-3 py-1 rounded-full text-sm transition-colors ${
                          selectedPlots.includes(plot)
                            ? "bg-pink-500 text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {plot}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 类型筛选 */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-gray-700 w-20">类型筛选：</span>
                  <div className="flex space-x-2 flex-wrap">
                    {typeFilters.map((type) => (
                      <button
                        key={type}
                        onClick={() => handleFilterClick("type", type)}
                        className={`px-3 py-1 rounded-full text-sm transition-colors ${
                          selectedTypes.includes(type)
                            ? "bg-red-500 text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 字母筛选 */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-gray-700 w-20">字母筛选：</span>
                  <div className="flex space-x-2 flex-wrap">
                    {alphabetFilters.map((letter) => (
                      <button
                        key={letter}
                        onClick={() => handleFilterClick("alphabet", letter)}
                        className={`px-3 py-1 rounded-full text-sm transition-colors ${
                          selectedAlphabets.includes(letter)
                            ? "bg-blue-500 text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {letter}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 年份筛选 */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-gray-700 w-20">年份筛选：</span>
                  <div className="flex space-x-2 flex-wrap">
                    {yearFilters.map((year) => (
                      <button
                        key={year}
                        onClick={() => handleFilterClick("year", year)}
                        className={`px-3 py-1 rounded-full text-sm transition-colors ${
                          selectedYears.includes(year)
                            ? "bg-green-500 text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {year}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 状态筛选 */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-gray-700 w-20">状态筛选：</span>
                  <div className="flex space-x-2 flex-wrap">
                    {statusFilters.map((status) => (
                      <button
                        key={status}
                        onClick={() => handleFilterClick("status", status)}
                        className={`px-3 py-1 rounded-full text-sm transition-colors ${
                          selectedStatus.includes(status)
                            ? "bg-orange-500 text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 作者筛选 (New) */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-gray-700 w-20">作者筛选：</span>
                  <div className="flex space-x-2 flex-wrap">
                    {authors.map((author) => (
                      <button
                        key={author}
                        onClick={() => handleFilterClick("author", author)}
                        className={`px-3 py-1 rounded-full text-sm transition-colors ${
                          selectedAuthors.includes(author)
                            ? "bg-teal-500 text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {author}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 自定义分类筛选 (重新独立) */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-gray-700 w-20">自定义标签：</span>
                  <div className="flex space-x-2 flex-wrap">
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => handleFilterClick("category", category)}
                        className={`px-3 py-1 rounded-full text-sm transition-colors ${
                          selectedCategories.includes(category)
                            ? "bg-indigo-500 text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-gray-700">排序方式：</span>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="updated_at">更新时间</SelectItem>
                      <SelectItem value="level">评分</SelectItem>
                      <SelectItem value="rating_interleaved">评分交叉</SelectItem>
                      <SelectItem value="year">年份</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={sortOrder} onValueChange={setSortOrder}>
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="desc">降序</SelectItem>
                      <SelectItem value="asc">升序</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}
          {/* View Mode Toggle - Moved outside isLoggedIn block */}
          <div className={`flex items-center space-x-2 ${isLoggedIn ? "ml-4" : "justify-end mt-4"}`}>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("list")}
              title="列表视图"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("grid")}
              title="大图视图"
            >
              <Grid className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Conditional Rendering for Views */}
        {viewMode === "list" ? (
          <div className="bg-white rounded-lg shadow-sm overflow-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-200 text-gray-700">
                  <TableHead key="preview" className="w-20">
                    封面
                  </TableHead>
                  {/* Conditional width for 漫画名称 */}
                  <TableHead key="name" className={!isLoggedIn ? "w-64" : ""}>
                    漫画名称
                  </TableHead>
                  {/* Conditional width for 故事简介 */}
                  <TableHead key="description" className={!isLoggedIn ? "w-[32rem]" : "w-64"}>
                    故事简介
                  </TableHead>
                  {isLoggedIn && (
                    <>
                      <TableHead key="level" className="w-32">
                        评分
                      </TableHead>
                    </>
                  )}
                  <TableHead key="author" className="w-32">
                    {" "}
                    {/* New TableHead for Author */}
                    作者
                  </TableHead>
                  <TableHead key="updated" className="w-48">
                    更新时间
                  </TableHead>
                  {/* Conditional width for 下载地址 */}
                  <TableHead key="download_url" className={!isLoggedIn ? "w-32" : "w-48"}>
                    下载地址
                  </TableHead>
                  {isLoggedIn && (
                    <TableHead key="actions" className="w-32">
                      操作
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentAccounts.map((account) => {
                  const isExpanded = expandedVolumes.has(account.id)
                  const hasVolumes = account.volumes && account.volumes.length > 0

                  return (
                    <TableRow key={account.id} className="hover:bg-gray-50">
                      {/* 封面图片 */}
                      <TableCell>
                        <button
                          onClick={() => handleImagePreview(account?.images || [], account?.name || "", account?.id!)}
                          className="w-12 h-12 rounded-lg border hover:border-purple-500 overflow-hidden flex items-center justify-center"
                        >
                          {account?.images?.[0] ? (
                            <img
                              src={account.images[0] || "/placeholder.svg"}
                              alt={`${account.name} 封面`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Avatar className="h-12 w-12">
                              <AvatarImage src="/placeholder.svg" alt={account?.name || ""} />
                              <AvatarFallback>{account?.name?.charAt(0) || ""}</AvatarFallback>
                            </Avatar>
                          )}
                        </button>
                      </TableCell>

                      {/* 漫画名称 & URL */}
                      <TableCell className={!isLoggedIn ? "w-64" : ""}>
                        <div>
                          {isLoggedIn && (
                            <span className="text-sm text-gray-700 font-semibold mb-1">
                              序号: {account?.serial_number}
                              <br />
                            </span>
                          )}
                          <span className="font-medium text-gray-800">{account?.name}</span>
                          {hasVolumes && (
                            <div className="text-xs text-gray-500 mt-1">共 {account.volumes!.length} 卷</div>
                          )}
                          {isLoggedIn && account?.url && (
                            <a
                              href={account.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-purple-600 hover:text-purple-800 hover:underline flex items-center gap-1"
                            >
                              {account.url}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      </TableCell>

                      {/* 故事简介 (始终显示) */}
                      <TableCell className={!isLoggedIn ? "w-[32rem]" : "w-64"}>
                        <p className="text-sm text-gray-600 line-clamp-2">{account?.description || "无简介"}</p>
                      </TableCell>

                      {/* 评分（仅管理员） */}
                      {isLoggedIn && (
                        <>
                          <TableCell>
                            <StarRating level={account?.level || 0} editable={false} />
                          </TableCell>
                        </>
                      )}

                      {/* 作者（仅管理员） */}
                      <TableCell>
                        <p className="text-sm text-gray-600">{account?.author || "未知"}</p>
                      </TableCell>

                      {/* 更新时间 */}
                      <TableCell>{new Date(account?.updated_at || "").toLocaleString("zh-CN")}</TableCell>

                      {/* 下载地址 */}
                      <TableCell className={!isLoggedIn ? "w-32" : "w-48"}>
                        <div className="space-y-2">
                          {/* 总下载地址 */}
                          {account?.download_url && (
                            <div>
                              <a
                                href={account.download_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline flex items-center gap-1 text-sm"
                              >
                                <Download className="h-4 w-4 mr-1" />
                                总下载
                              </a>
                            </div>
                          )}

                          {/* 卷数下载 */}
                          {hasVolumes && (
                            <div>
                              <Collapsible open={isExpanded} onOpenChange={() => toggleVolumeExpansion(account.id)}>
                                <CollapsibleTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-6 p-1 text-xs">
                                    {isExpanded ? (
                                      <ChevronDown className="h-3 w-3 mr-1" />
                                    ) : (
                                      <ChevronRight className="h-3 w-3 mr-1" />
                                    )}
                                    分卷下载 ({account.volumes!.length})
                                  </Button>
                                </CollapsibleTrigger>
                                <CollapsibleContent className="space-y-1 mt-1">
                                  {account.volumes!.map((volume, index) => (
                                    <div key={index} className="text-xs">
                                      {volume.download_url ? (
                                        <a
                                          href={volume.download_url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-blue-600 hover:underline flex items-center gap-1"
                                          title={volume.volume_name || volume.volume_number}
                                        >
                                          <Download className="h-3 w-3" />
                                          {volume.volume_number}
                                        </a>
                                      ) : (
                                        <span className="text-gray-500 flex items-center gap-1">
                                          <Download className="h-3 w-3" />
                                          {volume.volume_number}
                                        </span>
                                      )}
                                    </div>
                                  ))}
                                </CollapsibleContent>
                              </Collapsible>
                            </div>
                          )}

                          {!account?.download_url && !hasVolumes && <span className="text-sm text-gray-500">无</span>}
                        </div>
                      </TableCell>

                      {/* 操作按钮（仅管理员） */}
                      {isLoggedIn && (
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" onClick={() => handleEditClick(account)}>
                              <Edit className="h-4 w-4 mr-1" />
                              编辑
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700 bg-transparent"
                              onClick={() => handleDeleteClick(account.id, account.images)}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              删除
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <ImageGallery
            accounts={currentAccounts}
            isLoggedIn={isLoggedIn}
            onEditClick={handleEditClick}
            onDeleteClick={handleDeleteClick}
            onImagePreview={handleImagePreview}
            onAccountClick={handleAccountClick}
            editingAccountId={null}
            currentEditData={{}}
            handleEditChange={() => {}}
            handleStarClick={() => {}}
            handleSaveClick={() => {}}
            handleCancelClick={() => {}}
            plotFilters={basePlotFilters}
            yearFilters={yearFilters}
            typeFilters={typeFilters}
            authorFilters={authors} // Pass authors to ImageGallery
          />
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center space-x-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={() => handlePageChange(currentPage - 1)}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  if (page === 1 || page === totalPages || (page >= currentPage - 2 && page <= currentPage + 2)) {
                    return (
                      <PaginationItem key={page}>
                        <PaginationLink href="#" isActive={page === currentPage} onClick={() => handlePageChange(page)}>
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  } else if (page === currentPage - 3 || page === currentPage + 3) {
                    return (
                      <PaginationItem key={page}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )
                  }
                  return null
                })}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={() => handlePageChange(currentPage + 1)}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
            <div className="flex items-center space-x-2">
              <Label htmlFor="page-jump" className="sr-only">
                跳转到
              </Label>
              <Input
                id="page-jump"
                type="number"
                placeholder="页码"
                min={1}
                max={totalPages}
                onKeyDown={handleGoToPage}
                className="w-20 text-center"
              />
              <span className="text-sm text-gray-600">/ {totalPages} 页</span>
            </div>
          </div>
        )}

        {!isLoggedIn && (
          <div className="mt-6 text-center text-gray-500">
            <p>部分功能需要管理员权限，请登录后查看完整信息</p>
          </div>
        )}
      </main>

      {/* Dialogs */}
      <LoginDialog open={isLoginDialogOpen} onOpenChange={setIsLoginDialogOpen} onLogin={handleLogin} />

      {isLoggedIn && (
        <>
          <AddAccountDialog
            open={isAddDialogOpen}
            onOpenChange={setIsAddDialogOpen}
            categories={categories}
            plotFilters={basePlotFilters.filter((p) => p !== "全部")}
            regionFilters={regionFilters.filter((r) => r !== "全部")}
            yearFilters={yearFilters.filter((y) => y !== "全部")}
            typeFilters={typeFilters.filter((t) => t !== "全部")}
            languageFilters={languageFilters.filter((l) => l !== "全部")}
            authorFilters={authors.filter((a) => a !== "全部")} // Pass authors to dialog
            initialAccount={accountToEdit}
            onAddAccount={handleFormSubmit}
          />
          <CategoryManageDialog
            open={isCategoryDialogOpen}
            onOpenChange={setIsCategoryDialogOpen}
            categories={categories}
            onCategoriesChange={setCategories}
          />
        </>
      )}

      <ImagePreviewDialog
        open={imagePreviewData.open}
        onOpenChange={(open) => setImagePreviewData({ ...imagePreviewData, open })}
        initialImages={imagePreviewData.images}
        accountName={imagePreviewData.accountName}
        accountId={imagePreviewData.accountId!}
        onSaveImages={handleSaveImages}
      />
    </div>
  )
}
