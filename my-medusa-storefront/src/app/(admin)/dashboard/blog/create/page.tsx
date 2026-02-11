"use client";

import { useEffect, useState } from "react";
import PostForm from "@/components/admin/post-form";
import { getBlogCategories } from "./actions";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function CreateBlogPage() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    getBlogCategories().then(setCategories);
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6" dir="rtl">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/blog">
            <Button variant="ghost" size="icon"><ArrowRight /></Button>
        </Link>
        <h1 className="text-2xl font-bold">نوشتن مقاله جدید</h1>
      </div>
      
      <PostForm categories={categories} />
    </div>
  );
}