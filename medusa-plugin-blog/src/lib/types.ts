export type BlogPostStatus = "draft" | "published"

export interface BlogPost {
  id: string
  title: string
  slug: string
  content?: string | null
  excerpt?: string | null
  image?: string | null
  category?: string | null
  status: BlogPostStatus
  seo_title?: string | null
  seo_desc?: string | null
  published_at?: Date | string | null
  created_at?: Date | string
  updated_at?: Date | string
}

export interface BlogCategory {
  id: string
  title: string
  value: string
  created_at?: Date | string
  updated_at?: Date | string
}

export interface BlogComment {
  id: string
  post_id: string
  author_name: string
  content: string
  status: "pending" | "approved"
  created_at?: Date | string
  updated_at?: Date | string
  post_title?: string
  post_slug?: string
}

export interface CreateBlogPostInput {
  title: string
  slug: string
  seo_title?: string
  seo_desc?: string
  content?: string
  excerpt?: string
  category?: string
  image?: string
  status?: BlogPostStatus
  published_at?: string | Date
}

export interface CreateBlogCommentInput {
  post_id: string
  author_name: string
  content: string
}
