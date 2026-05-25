'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import RichTextEditor from './RichTextEditor'

interface BlogEditorProps {
  id?: number
  initial?: {
    slug: string
    title: string
    date: string
    excerpt: string
    content: string
    published: number
  }
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

export default function BlogEditor({ id, initial }: BlogEditorProps) {
  const isNew = !id
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  const [title, setTitle] = useState(initial?.title ?? '')
  const [slug, setSlug] = useState(initial?.slug ?? '')
  const [date, setDate] = useState(initial?.date ?? new Date().toISOString().slice(0, 10))
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? '')
  const [content, setContent] = useState(initial?.content ?? '')
  const [published, setPublished] = useState(initial?.published === 1)

  function handleTitleChange(val: string) {
    setTitle(val)
    if (isNew) setSlug(slugify(val))
  }

  async function handleSave() {
    setSaving(true)
    setError('')
    const body = { slug, title, date, excerpt, content, published }
    const res = isNew
      ? await fetch('/api/admin/blog', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      : await fetch(`/api/admin/blog/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })

    if (res.ok) {
      router.push('/admin/blog')
      router.refresh()
    } else {
      const data = await res.json()
      setError(data.error ?? 'Failed to save.')
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!id || !confirm('Delete this post? This cannot be undone.')) return
    setDeleting(true)
    await fetch(`/api/admin/blog/${id}`, { method: 'DELETE' })
    router.push('/admin/blog')
    router.refresh()
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-stone-600 mb-1">Title</label>
          <input
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="w-full border border-stone-300 rounded-lg px-3 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-600 mb-1">Slug (URL)</label>
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full border border-stone-300 rounded-lg px-3 py-2 text-stone-900 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-stone-600 mb-1">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full border border-stone-300 rounded-lg px-3 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>
        <div className="flex items-end gap-3 pb-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="w-4 h-4 accent-amber-500"
            />
            <span className="text-sm font-medium text-stone-600">Published (visible on site)</span>
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-600 mb-1">Excerpt</label>
        <textarea
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          rows={2}
          placeholder="Short summary shown on the blog list page…"
          className="w-full border border-stone-300 rounded-lg px-3 py-2 text-stone-900 resize-none focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-600 mb-1">Content</label>
        <RichTextEditor value={content} onChange={setContent} />
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white font-semibold px-6 py-2 rounded-lg transition-colors"
        >
          {saving ? 'Saving…' : isNew ? 'Create Post' : 'Save Changes'}
        </button>
        {!isNew && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="text-red-600 hover:text-red-800 text-sm font-medium ml-auto transition-colors"
          >
            {deleting ? 'Deleting…' : 'Delete Post'}
          </button>
        )}
      </div>
    </div>
  )
}
