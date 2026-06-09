# medusa-plugin-blog

A professional blog plugin for **Medusa v2**. Add a complete blogging system with admin dashboard, rich text editor, categories, comments, and SEO optimization to any Medusa e-commerce store.

## Features

✨ **Admin Dashboard**
- Create, edit, delete, and bulk manage blog posts
- Draft and publish workflow
- Category management with post reassignment on delete
- Featured image uploads
- SEO fields: custom title, slug, meta description

🎨 **Rich Content**
- React Quill rich text editor
- Image upload support
- Post excerpts for card previews
- Comment system with moderation

🌐 **Public API**
- REST endpoints for storefront integration
- Filter published posts only
- Category and comment management
- Media serving

## Requirements

- Medusa v2 (`@medusajs/framework` >= 2.0)
- PostgreSQL database
- Node.js >= 20

## Installation

### From GitHub

```bash
npm install github:hoseinmaddahi75/medusa-plugin-blog
# or
yarn add github:hoseinmaddahi75/medusa-plugin-blog
```

### Add to Your Medusa Backend

In `medusa-config.ts`:

```typescript
import { defineConfig } from "@medusajs/medusa-cli"

export const config = defineConfig({
  projectId: "your-project",
  // ... other config
  plugins: [
    {
      resolve: "medusa-plugin-blog",
      options: {},
    },
  ],
})
```

### Set Up Database Tables

```bash
# Option 1: Using SQL file directly
psql $DATABASE_URL -f node_modules/medusa-plugin-blog/database/schema.sql

# Option 2: Using Medusa exec
npx medusa exec "./.medusa/server/src/scripts/setup-database.js"
```

### Start Your Server

```bash
npm run dev
# or
yarn dev
```

Visit the admin dashboard → **Blog** section at `http://localhost:9000/app/blog`

---

## API Reference

### Admin Endpoints (Authenticated)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET, POST | `/admin/blog` | List all / create post |
| GET, POST, DELETE | `/admin/blog/:id` | Get / update / delete post |
| GET, POST | `/admin/blog-categories` | List / create category |
| POST, DELETE | `/admin/blog-categories/:id` | Update / delete category |
| POST | `/admin/blog-uploads` | Upload image |
| GET | `/admin/comments` | List all comments |
| PUT, DELETE | `/admin/comments/:id` | Update status / delete comment |

### Store Endpoints (Public)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/store/blog` | Get published posts |
| GET | `/store/blog/:slug` | Get post by slug (published only) |
| GET, POST | `/store/blog/:id/comments` | Get approved comments / create new |
| GET | `/store/blog-categories` | Get all categories |
| GET | `/store/blog-uploads/:filename` | Serve uploaded image |

---

## Storefront Integration Example

```typescript
// Fetch all published posts
const response = await fetch(`${BACKEND_URL}/store/blog`, {
  headers: {
    "x-publishable-api-key": PUBLISHABLE_KEY,
  },
})
const { posts } = await response.json()

// Get single post by slug
const postRes = await fetch(`${BACKEND_URL}/store/blog/my-post-slug`, {
  headers: { "x-publishable-api-key": PUBLISHABLE_KEY },
})
const { post } = await postRes.json()

// Submit a comment (requires moderation)
const comment = await fetch(`${BACKEND_URL}/store/blog/${postId}/comments`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    author_name: "John Doe",
    content: "Great post!",
  }),
})
```

---

## Project Structure

```
medusa-plugin-blog/
├── database/
│   └── schema.sql              # PostgreSQL schema
├── src/
│   ├── api/
│   │   ├── admin/              # Admin API routes
│   │   │   ├── blog/
│   │   │   ├── blog-categories/
│   │   │   ├── blog-uploads/
│   │   │   └── comments/
│   │   └── store/              # Public API routes
│   │       ├── blog/
│   │       ├── blog-categories/
│   │       ├── blog-uploads/
│   │       └── comments/
│   ├── admin/
│   │   └── routes/blog/        # Admin dashboard UI (React)
│   │       ├── page.tsx        # Blog list
│   │       ├── create/page.tsx # Create post
│   │       ├── [id]/page.tsx   # Edit post
│   │       └── categories/page.tsx
│   ├── lib/
│   │   ├── blog-service.ts     # Business logic
│   │   ├── comment-service.ts
│   │   ├── types.ts
│   │   └── db.ts
│   └── scripts/
│       └── setup-database.ts   # Database initialization
├── .medusa/server/             # Built JavaScript (auto-generated)
├── package.json
└── README.md
```

---

## Database Schema

### blog_posts
- `id` (string, primary key)
- `title` (string, required)
- `slug` (string, unique, required)
- `content` (text)
- `excerpt` (text)
- `image` (string)
- `category` (string)
- `status` (draft | published)
- `seo_title` (string)
- `seo_desc` (text)
- `published_at` (timestamp, only set for published posts)
- `created_at`, `updated_at` (timestamps)

### blog_categories
- `id` (string, primary key)
- `title` (string, required)
- `value` (string, required)
- `created_at`, `updated_at` (timestamps)

### blog_comments
- `id` (string, primary key)
- `post_id` (foreign key → blog_posts)
- `author_name` (string)
- `content` (text)
- `status` (pending | approved)
- `created_at`, `updated_at` (timestamps)

---

## Development

### Build from Source

```bash
yarn install
yarn build
```

The build outputs to `.medusa/server/`.

### Local Testing

```bash
# In your Medusa backend
yarn add file:../medusa-plugin-blog
yarn dev
```

---

## Publishing

### To npm

```bash
yarn build
npm publish
```

### To GitHub

```bash
git add .
git commit -m "Initial release"
git push
```

---

## License

MIT

---

## Support

For issues, questions, or feature requests, please open an issue on GitHub.
