// ── User ─────────────────────────────────────────────────────────────────
export interface User {
  id: number
  username: string
  email: string
  is_active: boolean
  created_at: string
}

export interface AuthToken {
  access_token: string
  token_type: string
  user: User
}

// ── Community ─────────────────────────────────────────────────────────────
export interface Community {
  id: number
  name: string
  description: string | null
  created_by: number
  created_at: string
  creator: { id: number; username: string }
  post_count: number
}

export interface CommunityListResponse {
  communities: Community[]
  total: number
  page: number
  per_page: number
  has_more: boolean
}

// ── Post ──────────────────────────────────────────────────────────────────
export type PostType = 'text' | 'image' | 'link'

export interface Post {
  id: number
  title: string
  content: string | null
  post_type: PostType
  vote_count: number
  comment_count: number
  author_id: number
  community_id: number
  created_at: string
  author: { id: number; username: string }
  community: { id: number; name: string }
  user_vote: 'upvote' | 'downvote' | null
}

export interface PostListResponse {
  posts: Post[]
  total: number
  page: number
  per_page: number
  has_more: boolean
}

// ── Vote ──────────────────────────────────────────────────────────────────
export type VoteType = 'upvote' | 'downvote'

export interface VoteResponse {
  post_id: number
  new_vote_count: number
  user_vote: string | null
  action: 'added' | 'removed' | 'switched'
}

// ── Comment ───────────────────────────────────────────────────────────────
export interface Comment {
  id: number
  content: string
  author_id: number
  post_id: number
  created_at: string
  author: { id: number; username: string }
  is_owner: boolean
}

export interface CommentListResponse {
  comments: Comment[]
  total: number
  page: number
  per_page: number
  has_more: boolean
}

// ── API Error ─────────────────────────────────────────────────────────────
export interface ApiError {
  detail: string
}

// ── Sort ──────────────────────────────────────────────────────────────────
export type SortOrder = 'new' | 'top' | 'old'
