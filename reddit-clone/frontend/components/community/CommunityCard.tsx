'use client'

import Link from 'next/link'
import { FileText, Hash } from 'lucide-react'
import { Community } from '@/types'

interface CommunityCardProps {
  community: Community
  compact?:  boolean      // compact=true for sidebar list items
}

export default function CommunityCard({ community, compact = false }: CommunityCardProps) {
  if (compact) {
    return (
      <Link href={`/communities/${community.name}`}>
        <div className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-zinc-800 transition-colors group">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center flex-shrink-0">
              <Hash size={10} className="text-orange-400" />
            </div>
            <span className="text-sm text-zinc-300 group-hover:text-white truncate transition-colors">
              r/{community.name}
            </span>
          </div>
          <span className="text-xs text-zinc-600 flex-shrink-0 ml-2">
            {community.post_count}
          </span>
        </div>
      </Link>
    )
  }

  return (
    <Link href={`/communities/${community.name}`}>
      <div className="bg-zinc-900 border border-zinc-800 hover:border-zinc-600 rounded-xl p-4 transition-all duration-200 hover:shadow-md hover:shadow-black/20 group">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center flex-shrink-0">
            <Hash size={16} className="text-orange-400" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-zinc-100 group-hover:text-white transition-colors">
              r/{community.name}
            </h3>
            {community.description && (
              <p className="text-xs text-zinc-500 mt-0.5 line-clamp-2">
                {community.description}
              </p>
            )}
            <div className="flex items-center gap-3 mt-2 text-xs text-zinc-600">
              <span className="flex items-center gap-1">
                <FileText size={11} />
                {community.post_count} {community.post_count === 1 ? 'post' : 'posts'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
