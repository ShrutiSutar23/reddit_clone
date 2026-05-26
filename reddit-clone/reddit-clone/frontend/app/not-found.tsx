import Link from 'next/link'
import { Flame, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">

      {/* Big 404 */}
      <div className="relative mb-6">
        <span className="text-[120px] font-black text-zinc-800 leading-none select-none">
          404
        </span>
        <Flame
          size={48}
          className="text-orange-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        />
      </div>

      <h1 className="text-2xl font-bold text-zinc-200 mb-2">
        Page not found
      </h1>
      <p className="text-zinc-500 text-sm max-w-sm mb-8">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>

      <Link
        href="/"
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-400 text-white text-sm font-medium rounded-xl transition-colors"
      >
        <ArrowLeft size={15} />
        Back to home
      </Link>
    </div>
  )
}
