'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

const CATEGORIES = [
  { value: 'honey', label: 'Honey' },
  { value: 'lip-balm', label: 'Lip Balm' },
  { value: 'bath-bombs', label: 'Bath Bombs' },
  { value: 'soap', label: 'Soap' },
  { value: 'other', label: 'Other' },
]

export default function NewProductForm() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('other')
  const [error, setError] = useState('')

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
    const data = await res.json()
    if (data.url) setImageUrl(data.url)
    else setError(data.error ?? 'Upload failed')
    setUploading(false)
    e.target.value = ''
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) { setError('Name is required'); return }
    setSaving(true)
    setError('')
    const priceCents = Math.round(Math.max(0, parseFloat(price) || 0) * 100)
    const res = await fetch('/api/admin/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description, price: priceCents, category, image: imageUrl }),
    })
    const data = await res.json()
    if (data.error) { setError(data.error); setSaving(false); return }
    // Reset form
    setName(''); setDescription(''); setPrice(''); setCategory('other'); setImageUrl('')
    router.refresh()
    setSaving(false)
  }

  const inputCls = 'w-full border border-stone-300 rounded-lg px-3 py-2 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-400'

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-stone-200 shadow-sm p-6">
      <h2 className="font-semibold text-stone-700 mb-5">Add New Product</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-xs font-medium text-stone-500 mb-1">Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Clover Honey"
            className={inputCls}
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-stone-500 mb-1">Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls}>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-stone-500 mb-1">Price</label>
          <div className="flex items-center gap-1">
            <span className="text-stone-500 text-sm">$</span>
            <input
              type="number"
              min={0}
              step={0.01}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              className={inputCls}
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-stone-500 mb-1">Photo</label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="px-3 py-2 text-sm border border-stone-300 rounded-lg text-stone-600 hover:bg-stone-50 disabled:opacity-50 transition-colors"
            >
              {uploading ? 'Uploading…' : 'Upload Photo'}
            </button>
            {imageUrl && (
              <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-stone-200">
                <Image src={imageUrl} alt="Preview" fill className="object-cover" sizes="48px" />
              </div>
            )}
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
        </div>
      </div>

      <div className="mb-5">
        <label className="block text-xs font-medium text-stone-500 mb-1">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Short product description…"
          className={inputCls + ' resize-none'}
        />
      </div>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      <button
        type="submit"
        disabled={saving || uploading}
        className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-semibold px-5 py-2 rounded-lg text-sm transition-colors"
      >
        {saving ? 'Creating…' : 'Create Product'}
      </button>
    </form>
  )
}
