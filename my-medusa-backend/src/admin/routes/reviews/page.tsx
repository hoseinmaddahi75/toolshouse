import { defineRouteConfig } from "@medusajs/admin-sdk"
import { ChatBubbleLeftRight, Trash, PencilSquare, Photo } from "@medusajs/icons"
import { Container, Heading, Table, Button, Input, Textarea, Badge, IconButton, usePrompt } from "@medusajs/ui"
import { useState, useEffect, FormEvent } from "react"

interface Review {
  id: string
  name: string
  role: string
  content: string
  rating: number
  image: string | null
  created_at: string
}

const ReviewsPage = () => {
  const dialog = usePrompt() // برای تایید حذف
  const [reviews, setReviews] = useState<Review[]>([])
  const [, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  
  // حالت ویرایش: اگر آیدی داشته باشد یعنی در حال ویرایشیم
  const [editingId, setEditingId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    role: "",
    content: "",
    rating: 5,
    image: "" // لینک تصویر
  })

  const fetchReviews = async () => {
    setIsLoading(true)
    try {
      const res = await fetch("/admin/reviews")
      const data = await res.json()
      setReviews(data.reviews || [])
    } catch (err) { console.error(err) } 
    finally { setIsLoading(false) }
  }

  useEffect(() => { fetchReviews() }, [])

  // --- مدیریت آپلود فایل ---
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return
    setIsUploading(true)

    const file = e.target.files[0]
    const payload = new FormData()
    payload.append("files", file)

    try {
      // استفاده از API آپلود پیش‌فرض مدوسا
      // نکته: در حالت لوکال ممکن است نیاز به نصب پلاگین فایل باشد
      // اگر ارور داد، از لینک تستی استفاده کنید
      const res = await fetch("/admin/custom-uploads", {
        method: "POST",
        body: payload,
      })
      
      const data = await res.json()
      if (data.uploads?.length) {
        setFormData({ ...formData, image: data.uploads[0].url })
        alert("تصویر آپلود شد!")
      } else {
          // فال‌بک برای وقتی که پلاگین فایل نداریم (صرفاً برای تست)
          alert("پلاگین فایل نصب نیست. یک لینک تستی قرار گرفت.")
          setFormData({ ...formData, image: "https://via.placeholder.com/150" })
      }
    } catch (err) {
      console.error(err)
      alert("خطا در آپلود")
    } finally {
      setIsUploading(false)
    }
  }

  // --- پر کردن فرم برای ویرایش ---
  const handleEdit = (review: Review) => {
    setEditingId(review.id)
    setFormData({
      name: review.name,
      role: review.role,
      content: review.content,
      rating: review.rating,
      image: review.image || ""
    })
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // --- کنسل کردن ویرایش ---
  const handleCancelEdit = () => {
    setEditingId(null)
    setFormData({ name: "", role: "", content: "", rating: 5, image: "" })
  }

  // --- ارسال فرم (ساخت یا ویرایش) ---
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    
    const url = editingId 
        ? `/admin/reviews/${editingId}` // آدرس ویرایش
        : "/admin/reviews" // آدرس ساخت

    try {
      const res = await fetch(url, {
        method: "POST", // ما برای هر دو از POST استفاده کردیم
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        alert(editingId ? "ویرایش شد" : "ثبت شد")
        fetchReviews()
        handleCancelEdit() // ریست فرم
      }
    } catch (err) { alert("خطا رخ داد") }
  }

  // --- حذف ---
  const handleDelete = async (id: string) => {
    const confirmed = await dialog({
        title: "حذف نظر",
        description: "آیا از حذف این نظر اطمینان دارید؟",
    })

    if (confirmed) {
        await fetch(`/admin/reviews/${id}`, { method: "DELETE" })
        fetchReviews()
    }
  }

  return (
    <Container>
      <div className="flex justify-between items-center mb-6">
        <Heading level="h1">مدیریت نظرات مشتریان</Heading>
      </div>

      {/* فرم */}
      <div className="mb-8 p-6 border rounded-lg bg-ui-bg-subtle">
        <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-sm">
                {editingId ? "ویرایش نظر" : "افزودن نظر جدید"}
            </h3>
            {editingId && (
                <Button variant="secondary" size="small" onClick={handleCancelEdit}>
                    انصراف
                </Button>
            )}
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input placeholder="نام مشتری" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                <Input placeholder="نقش" value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} required />
            </div>
            
            <Textarea placeholder="متن نظر..." value={formData.content} onChange={(e) => setFormData({...formData, content: e.target.value})} required />
            
            <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <span className="text-xs text-ui-fg-subtle whitespace-nowrap">امتیاز:</span>
                    <Input type="number" max={5} min={1} className="w-20" value={formData.rating} onChange={(e) => setFormData({...formData, rating: parseInt(e.target.value)})} />
                </div>

                {/* بخش آپلود */}
                <div className="flex items-center gap-2 w-full">
                    <div className="relative overflow-hidden">
                        <Button variant="secondary" type="button">
                            {isUploading ? "در حال آپلود..." : "انتخاب تصویر"}
                            <Photo className="mr-2" />
                        </Button>
                        <input 
                            type="file" 
                            accept="image/*"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            onChange={handleFileUpload}
                        />
                    </div>
                    {formData.image && (
                        <div className="text-xs text-green-600 truncate max-w-[200px]">
                            تصویر انتخاب شد
                        </div>
                    )}
                </div>

                <Button type="submit" variant="primary" className="w-full md:w-auto mr-auto">
                    {editingId ? "ذخیره تغییرات" : "ثبت نظر"}
                </Button>
            </div>
        </form>
      </div>

      {/* جدول */}
      <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>تصویر</Table.HeaderCell>
              <Table.HeaderCell>نام</Table.HeaderCell>
              <Table.HeaderCell>نقش</Table.HeaderCell>
              <Table.HeaderCell>امتیاز</Table.HeaderCell>
              <Table.HeaderCell>متن</Table.HeaderCell>
              <Table.HeaderCell>عملیات</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {reviews.map((review) => (
              <Table.Row key={review.id}>
                <Table.Cell>
                    {review.image ? (
                        <img src={review.image} alt={review.name} className="w-8 h-8 rounded-full object-cover bg-gray-200" />
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs">?</div>
                    )}
                </Table.Cell>
                <Table.Cell>{review.name}</Table.Cell>
                <Table.Cell>{review.role}</Table.Cell>
                <Table.Cell><Badge color="blue">{review.rating}</Badge></Table.Cell>
                <Table.Cell className="truncate max-w-[150px] text-ui-fg-subtle">{review.content}</Table.Cell>
                <Table.Cell>
                    <div className="flex gap-2">
                        <IconButton variant="transparent" onClick={() => handleEdit(review)}>
                            <PencilSquare className="text-ui-fg-subtle hover:text-blue-600" />
                        </IconButton>
                        <IconButton variant="transparent" onClick={() => handleDelete(review.id)}>
                            <Trash className="text-ui-fg-subtle hover:text-red-600" />
                        </IconButton>
                    </div>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "نظرات مشتریان",
  icon: ChatBubbleLeftRight,
})

export default ReviewsPage