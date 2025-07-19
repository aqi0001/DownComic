"use server"
import { revalidatePath } from "next/cache"

export type Account = {
  id: number
  serial_number: string // 序号
  name: string // 漫画名称
  platform: string // 地区 (e.g., 日本, 欧美)
  url: string // 漫画链接
  category: string // 标签 (e.g., 热血, 冒险)
  level: number // 评分 (1-5星)
  description?: string // 故事简介
  download_url?: string // 下载地址
  images: string[] // 图片URL数组
  cover_image_url?: string // 封面图片URL
  year?: string // 年份
  type?: string // 类型 (e.g., 页漫, 条漫)
  language?: string // 语言 (e.g., 中文, 生肉)
  volumes?: VolumeInfo[] // 卷数信息
  author?: string // 新增作者字段
  created_at: string
  updated_at: string
}

export type VolumeInfo = {
  volume_number: string // 卷号 (e.g., "第1卷", "Vol.1")
  volume_name?: string // 卷名称 (可选)
  download_url?: string // 该卷的下载链接
}

// In-memory data store for demonstration purposes
let inMemoryAccounts: Account[] = [
  {
    id: 1,
    serial_number: "0000001",
    name: "海贼王",
    platform: "日本",
    url: "https://www.example.com/one-piece",
    category: "冒险",
    level: 5,
    description: "一个关于海盗、宝藏和友谊的伟大冒险故事。",
    download_url: "https://download.example.com/one-piece",
    images: ["/placeholder.svg?height=200&width=150"],
    cover_image_url: "/placeholder.svg?height=200&width=150",
    year: "1997",
    type: "页漫",
    language: "中文",
    volumes: [
      {
        volume_number: "第1卷",
        volume_name: "Romance Dawn",
        download_url: "https://download.example.com/one-piece-vol1",
      },
      {
        volume_number: "第2卷",
        volume_name: "VS巴基海贼团",
        download_url: "https://download.example.com/one-piece-vol2",
      },
      {
        volume_number: "第3卷",
        volume_name: "嘘は言わない",
        download_url: "https://download.example.com/one-piece-vol3",
      },
    ],
    author: "尾田荣一郎", // Added author
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 2,
    serial_number: "0000002",
    name: "火影忍者",
    platform: "日本",
    url: "https://www.example.com/naruto",
    category: "热血",
    level: 4,
    description: "一个立志成为火影的忍者少年，与伙伴们共同成长的故事。",
    download_url: "https://download.example.com/naruto",
    images: ["/placeholder.svg?height=200&width=150"],
    cover_image_url: "/placeholder.svg?height=200&width=150",
    year: "1999",
    type: "页漫",
    language: "中文",
    volumes: [
      {
        volume_number: "第1卷",
        volume_name: "うずまきナルト",
        download_url: "https://download.example.com/naruto-vol1",
      },
      { volume_number: "第2卷", volume_name: "最悪の依頼者", download_url: "https://download.example.com/naruto-vol2" },
    ],
    author: "岸本齐史", // Added author
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 3,
    serial_number: "0000003",
    name: "美国队长",
    platform: "欧美",
    url: "https://www.example.com/captain-america",
    category: "打斗",
    level: 4,
    description: "二战时期，一名瘦弱的士兵通过实验成为超级英雄。",
    download_url: "https://download.example.com/captain-america",
    images: ["/placeholder.svg?height=200&width=150"],
    cover_image_url: "/placeholder.svg?height=200&width=150",
    year: "1941",
    type: "页漫",
    language: "生肉",
    author: "Joe Simon", // Added author
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 4,
    serial_number: "0000004",
    name: "进击的巨人",
    platform: "日本",
    url: "https://www.example.com/attack-on-titan",
    category: "冒险",
    level: 5,
    description: "人类与巨人的殊死搏斗，揭示世界的真相。",
    download_url: "https://download.example.com/attack-on-titan",
    images: ["/placeholder.svg?height=200&width=150"],
    cover_image_url: "/placeholder.svg?height=200&width=150",
    year: "2009",
    type: "页漫",
    language: "中文",
    volumes: [
      { volume_number: "第1卷", volume_name: "二千年後の君へ", download_url: "https://download.example.com/aot-vol1" },
      { volume_number: "第2卷", volume_name: "その日", download_url: "https://download.example.com/aot-vol2" },
      {
        volume_number: "第3卷",
        volume_name: "絶望の中で鈍く光る",
        download_url: "https://download.example.com/aot-vol3",
      },
      {
        volume_number: "第4卷",
        volume_name: "今、何をすべきか",
        download_url: "https://download.example.com/aot-vol4",
      },
    ],
    author: "谏山创", // Added author
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 5,
    serial_number: "0000005",
    name: "鬼灭之刃",
    platform: "日本",
    url: "https://www.example.com/demon-slayer",
    category: "热血",
    level: 5,
    description: "少年炭治郎为拯救变成鬼的妹妹而踏上斩鬼之路。",
    download_url: "https://download.example.com/demon-slayer",
    images: ["/placeholder.svg?height=200&width=150"],
    cover_image_url: "/placeholder.svg?height=200&width=150",
    year: "2016",
    type: "页漫",
    language: "中文",
    author: "吾峠呼世晴", // Added author
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 6,
    serial_number: "0000006",
    name: "咒术回战",
    platform: "日本",
    url: "https://www.example.com/jujutsu-kaisen",
    category: "冒险",
    level: 4,
    description: "高中生虎杖悠仁为救人吞下诅咒，卷入咒术师的世界。",
    download_url: "https://download.example.com/jujutsu-kaisen",
    images: ["/placeholder.svg?height=200&width=150"],
    cover_image_url: "/placeholder.svg?height=200&width=150",
    year: "2018",
    type: "页漫",
    language: "中文",
    author: "芥见下下", // Added author
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 7,
    serial_number: "0000007",
    name: "我的英雄学院",
    platform: "日本",
    url: "https://www.example.com/my-hero-academia",
    category: "热血",
    level: 4,
    description: "在一个超能力社会中，没有个性的少年立志成为英雄。",
    download_url: "https://download.example.com/my-hero-academia",
    images: ["/placeholder.svg?height=200&width=150"],
    cover_image_url: "/placeholder.svg?height=200&width=150",
    year: "2014",
    type: "页漫",
    language: "中文",
    author: "堀越耕平", // Added author
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 8,
    serial_number: "0000008",
    name: "电锯人",
    platform: "日本",
    url: "https://www.example.com/chainsaw-man",
    category: "打斗",
    level: 5,
    description: "与电锯恶魔波奇塔签订契约的少年，成为电锯人。",
    download_url: "https://download.example.com/chainsaw-man",
    images: ["/placeholder.svg?height=200&width=150"],
    cover_image_url: "/placeholder.svg?height=200&width=150",
    year: "2018",
    type: "页漫",
    language: "中文",
    author: "藤本树", // Added author
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 9,
    serial_number: "0000009",
    name: "辉夜大小姐想让我告白",
    platform: "日本",
    url: "https://www.example.com/kaguya-sama",
    category: "爱情",
    level: 4,
    description: "两个天才学生之间的爱情攻防战。",
    download_url: "https://download.example.com/kaguya-sama",
    images: ["/placeholder.svg?height=200&width=150"],
    cover_image_url: "/placeholder.svg?height=200&width=150",
    year: "2015",
    type: "页漫",
    language: "中文",
    author: "赤坂アカ", // Added author
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 10,
    serial_number: "0000010",
    name: "间谍过家家",
    platform: "日本",
    url: "https://www.example.com/spy-family",
    category: "冒险",
    level: 5,
    description: "间谍、杀手和超能力者组成的临时家庭，为了世界和平而努力。",
    download_url: "https://download.example.com/spy-family",
    images: ["/placeholder.svg?height=200&width=150"],
    cover_image_url: "/placeholder.svg?height=200&width=150",
    year: "2019",
    type: "页漫",
    language: "中文",
    author: "远藤达哉", // Added author
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 11,
    serial_number: "0000011",
    name: "Solo Leveling",
    platform: "韩国",
    url: "https://www.example.com/solo-leveling",
    category: "热血",
    level: 5,
    description: "最弱的猎人程肖宇获得神秘力量，开始独自升级。",
    download_url: "https://download.example.com/solo-leveling",
    images: ["/placeholder.svg?height=200&width=150"],
    cover_image_url: "/placeholder.svg?height=200&width=150",
    year: "2018",
    type: "条漫",
    language: "生肉",
    author: "Chugong", // Added author
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 12,
    serial_number: "0000012",
    name: "The Beginning After The End",
    platform: "欧美",
    url: "https://www.example.com/tbate",
    category: "冒险",
    level: 4,
    description: "一位国王转生到魔法世界，开始新的冒险。",
    download_url: "https://download.example.com/tbate",
    images: ["/placeholder.svg?height=200&width=150"],
    cover_image_url: "/placeholder.svg?height=200&width=150",
    year: "2017",
    type: "条漫",
    language: "生肉",
    author: "TurtleMe", // Added author
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

// In-memory custom categories
let inMemoryCustomCategories: string[] = ["奇幻", "科幻", "日常"]

// Default cover image URL
const DEFAULT_COVER_IMAGE_URL = "/placeholder.svg?height=200&width=150"

// Helper to generate a unique ID (for in-memory only)
let nextId = inMemoryAccounts.length > 0 ? Math.max(...inMemoryAccounts.map((a) => a.id)) + 1 : 1
let nextSerialNumber =
  inMemoryAccounts.length > 0 ? Math.max(...inMemoryAccounts.map((a) => Number.parseInt(a.serial_number))) + 1 : 1

// Helper function to format serial number
function formatSerialNumber(num: number): string {
  return String(num).padStart(7, "0")
}

export async function getAccounts(): Promise<Account[]> {
  // In a real application, you would fetch from a database (e.g., Supabase)
  // For now, return the in-memory data
  revalidatePath("/")
  return inMemoryAccounts.map((account) => ({
    ...account,
    cover_image_url: account.images?.[0] || DEFAULT_COVER_IMAGE_URL,
  }))
}

export async function createAccount(formData: FormData) {
  const name = formData.get("name") as string
  const url = formData.get("url") as string
  const platform = formData.get("platform") as string
  const category = formData.get("category") as string
  const level = Number.parseInt(formData.get("level") as string)
  const description = formData.get("description") as string
  const download_url = formData.get("download_url") as string
  const year = formData.get("year") as string
  const type = formData.get("type") as string
  const language = formData.get("language") as string
  const author = formData.get("author") as string // Get author
  const images = formData.getAll("images") as string[]

  // Handle volumes data
  const volumesData = formData.get("volumes") as string
  let volumes: VolumeInfo[] = []
  if (volumesData) {
    try {
      volumes = JSON.parse(volumesData)
    } catch (error) {
      console.error("Failed to parse volumes data:", error)
    }
  }

  if (!name || !platform || !category || isNaN(level)) {
    return { success: false, message: "Missing required fields." }
  }

  const newAccount: Account = {
    id: nextId++,
    serial_number: formatSerialNumber(nextSerialNumber++),
    name,
    platform,
    url,
    category,
    level,
    description,
    download_url,
    images: images.length > 0 ? images : [DEFAULT_COVER_IMAGE_URL],
    cover_image_url: images.length > 0 ? images[0] : DEFAULT_COVER_IMAGE_URL,
    year,
    type,
    language,
    volumes,
    author, // Add author
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  inMemoryAccounts.push(newAccount)
  revalidatePath("/")
  return { success: true, account: newAccount }
}

export async function updateAccount(formData: FormData) {
  const id = Number.parseInt(formData.get("id") as string)
  const name = formData.get("name") as string
  const url = formData.get("url") as string
  const platform = formData.get("platform") as string
  const category = formData.get("category") as string
  const level = Number.parseInt(formData.get("level") as string)
  const description = formData.get("description") as string
  const download_url = formData.get("download_url") as string
  const year = formData.get("year") as string
  const type = formData.get("type") as string
  const language = formData.get("language") as string
  const author = formData.get("author") as string // Get author

  // Handle volumes data
  const volumesData = formData.get("volumes") as string
  let volumes: VolumeInfo[] = []
  if (volumesData) {
    try {
      volumes = JSON.parse(volumesData)
    } catch (error) {
      console.error("Failed to parse volumes data:", error)
    }
  }

  // Handle image updates
  const newImageUrls = formData.getAll("newImageUrls") as string[]
  const removedImages = formData.getAll("removedImages") as string[]
  const existingImages = formData.getAll("existingImages") as string[]

  const accountIndex = inMemoryAccounts.findIndex((acc) => acc.id === id)

  if (accountIndex === -1) {
    return { success: false, message: "Account not found." }
  }

  let updatedImages = existingImages.filter((img) => !removedImages.includes(img))
  updatedImages = [...updatedImages, ...newImageUrls]

  // Ensure there's always at least one image, if not, use default
  if (updatedImages.length === 0) {
    updatedImages.push(DEFAULT_COVER_IMAGE_URL)
  }

  const updatedAccount: Account = {
    ...inMemoryAccounts[accountIndex],
    name,
    url,
    platform,
    category,
    level,
    description,
    download_url,
    year,
    type,
    language,
    volumes,
    author, // Add author
    images: updatedImages,
    cover_image_url: updatedImages[0] || DEFAULT_COVER_IMAGE_URL,
    updated_at: new Date().toISOString(),
  }

  inMemoryAccounts[accountIndex] = updatedAccount
  revalidatePath("/")
  return { success: true, account: updatedAccount }
}

export async function deleteAccount(id: number, imagesToDelete: string[]) {
  const initialLength = inMemoryAccounts.length
  inMemoryAccounts = inMemoryAccounts.filter((acc) => acc.id !== id)

  if (inMemoryAccounts.length === initialLength) {
    return { success: false, message: "Account not found." }
  }

  // In a real app, you'd also delete images from storage (e.g., Vercel Blob)
  console.log("Simulating image deletion for:", imagesToDelete)

  revalidatePath("/")
  return { success: true, message: "Account deleted successfully." }
}

export async function getCustomCategories(): Promise<string[]> {
  revalidatePath("/")
  return inMemoryCustomCategories
}

export async function addCustomCategory(category: string) {
  if (!inMemoryCustomCategories.includes(category)) {
    inMemoryCustomCategories.push(category)
    revalidatePath("/")
    return { success: true, categories: inMemoryCustomCategories }
  }
  return { success: false, message: "Category already exists." }
}

export async function deleteCustomCategory(category: string) {
  const initialLength = inMemoryCustomCategories.length
  inMemoryCustomCategories = inMemoryCustomCategories.filter((c) => c !== category)
  if (inMemoryCustomCategories.length === initialLength) {
    return { success: false, message: "Category not found." }
  }
  revalidatePath("/")
  return { success: true, categories: inMemoryCustomCategories }
}

export async function setAccountCoverImage(accountId: number, imageUrl: string) {
  const accountIndex = inMemoryAccounts.findIndex((acc) => acc.id === accountId)

  if (accountIndex === -1) {
    return { success: false, message: "Account not found." }
  }

  const account = inMemoryAccounts[accountIndex]
  const updatedImages = [imageUrl, ...account.images.filter((img) => img !== imageUrl)]

  const updatedAccount = {
    ...account,
    images: updatedImages,
    cover_image_url: imageUrl,
    updated_at: new Date().toISOString(),
  }

  inMemoryAccounts[accountIndex] = updatedAccount
  revalidatePath("/")
  return { success: true, account: updatedAccount }
}

/**
 * 覆盖式更新自定义分类列表
 * 保证 "全部" 永远位于首位且唯一
 */
export async function updateCustomCategories(newCategories: string[]) {
  // 过滤掉空值并去重，同时把 "全部" 放到首位
  inMemoryCustomCategories = Array.from(new Set(["全部", ...newCategories.filter((c) => c && c !== "全部")]))

  // 如需持久化，可在此写入数据库
  revalidatePath("/")
  return { success: true, message: "Custom categories updated successfully." }
}

export async function getAuthors(): Promise<string[]> {
  const authors = new Set<string>()
  inMemoryAccounts.forEach((account) => {
    if (account.author) {
      authors.add(account.author)
    }
  })
  revalidatePath("/")
  return Array.from(authors).sort() // Return sorted unique authors
}
