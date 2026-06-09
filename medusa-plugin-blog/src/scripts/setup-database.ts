import { ContainerRegistrationKeys } from "@medusajs/utils"
import { ExecArgs } from "@medusajs/framework/types"

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS blog_posts (
  id VARCHAR(255) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  content TEXT,
  excerpt TEXT,
  image VARCHAR(255),
  category VARCHAR(255),
  status VARCHAR(50) DEFAULT 'draft',
  seo_title VARCHAR(255),
  seo_desc TEXT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS blog_categories (
  id VARCHAR(255) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  value VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS blog_comments (
  id VARCHAR(255) PRIMARY KEY,
  post_id VARCHAR(255) NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  author_name VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blog_comments_post_id ON blog_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
`

export default async function setupBlogDatabase({ container }: ExecArgs) {
  const knex = container.resolve(ContainerRegistrationKeys.PG_CONNECTION) as any

  await knex.raw(SCHEMA_SQL)

  console.log("Blog plugin tables created successfully.")
}
