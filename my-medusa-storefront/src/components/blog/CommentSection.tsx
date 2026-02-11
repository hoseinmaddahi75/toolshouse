"use client";

import { useState } from "react";
import { UserIcon } from "@heroicons/react/24/outline";

interface Comment {
  id: string;
  author_name: string;
  content: string;
  created_at: string;
}

export default function CommentSection({ postId, initialComments }: { postId: string, initialComments: Comment[] }) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !content) return;

    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/blog/${postId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "",
        },
        body: JSON.stringify({ author_name: name, content }),
      });

      if (res.ok) {
        const data = await res.json();
        // اضافه کردن نظر جدید به لیست
        setComments([data.comment, ...comments]);
        setName("");
        setContent("");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-xl font-bold">نظرات کاربران</h3>
        <span className="text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-lg">{comments.length} دیدگاه</span>
      </div>

      {/* فرم ارسال نظر */}
      <form onSubmit={handleSubmit} className="mb-10 bg-gray-50 p-6 rounded-2xl">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">نام شما</label>
          <input 
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#B19276]"
            placeholder="نام خود را وارد کنید"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">دیدگاه شما</label>
          <textarea 
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#B19276]"
            placeholder="نظر خود را بنویسید..."
          />
        </div>
        <button 
          disabled={loading}
          type="submit" 
          className="bg-black text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-[#B19276] transition-colors disabled:opacity-50"
        >
          {loading ? "در حال ارسال..." : "ارسال دیدگاه"}
        </button>
      </form>

      {/* لیست نظرات */}
      <div className="space-y-6">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-4 border-b border-gray-50 pb-6 last:border-0">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
              <UserIcon className="w-5 h-5 text-gray-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-bold text-sm">{comment.author_name}</h4>
                <span className="text-xs text-gray-400">
                  {new Date(comment.created_at).toLocaleDateString('fa-IR')}
                </span>
              </div>
              <p className="text-gray-600 text-sm leading-6">{comment.content}</p>
            </div>
          </div>
        ))}
        {comments.length === 0 && (
          <p className="text-center text-gray-400 text-sm">اولین نفری باشید که نظر می‌دهد!</p>
        )}
      </div>
    </div>
  );
}