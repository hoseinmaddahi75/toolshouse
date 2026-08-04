'use client'

import { useState } from 'react'
import { deletePromotion } from './actions'

export default function DeleteButton({ id }: { id: string }) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    // گرفتن تاییدیه از ادمین قبل از حذف
    const isConfirmed = window.confirm('آیا از حذف این کمپین تخفیف مطمئن هستید؟ این عملیات غیرقابل بازگشت است.')
    
    if (!isConfirmed) return

    setIsDeleting(true)
    
    const result = await deletePromotion(id)
    
    if (!result.success) {
      alert(`خطا در حذف: ${result.error}`)
      setIsDeleting(false) // فقط در صورت خطا لودینگ رو برمیداریم، چون در صورت موفقیت کل ردیف حذف میشه
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-sm font-medium text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {isDeleting ? 'در حال حذف...' : 'حذف'}
    </button>
  )
}