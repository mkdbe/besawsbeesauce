'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'

interface Props {
  initial: Record<string, string>
}

async function saveKey(key: string, value: string) {
  const res = await fetch('/api/admin/content', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key, value }),
  })
  return res.ok
}

export default function ContentEditor({ initial }: Props) {
  const [heroImage, setHeroImage] = useState(initial.hero_image ?? '')
  const [heroEnabled, setHeroEnabled] = useState(initial.hero_image_enabled !== '0')
  const [heroUploading, setHeroUploading] = useState(false)
  const [heroSaved, setHeroSaved] = useState(false)

  const [aboutBody, setAboutBody] = useState(initial.about_body ?? '')
  const [aboutSaving, setAboutSaving] = useState(false)
  const [aboutSaved, setAboutSaved] = useState(false)

  const fileRef = useRef<HTMLInputElement>(null)

  async function handleToggleEnabled() {
    const next = !heroEnabled
    setHeroEnabled(next)
    await saveKey('hero_image_enabled', next ? '1' : '0')
    setHeroSaved(true)
    setTimeout(() => setHeroSaved(false), 2000)
  }

  async function handleHeroUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setHeroUploading(true)
    const form = new FormData()
    form.append('file', file)
    const res = await fetch('/api/admin/upload', { method: 'POST', body: form })
    if (res.ok) {
      const { url } = await res.json()
      setHeroImage(url)
      setHeroEnabled(true)
      await saveKey('hero_image', url)
      await saveKey('hero_image_enabled', '1')
      setHeroSaved(true)
      setTimeout(() => setHeroSaved(false), 2000)
    }
    setHeroUploading(false)
    e.target.value = ''
  }

  async function handleHeroClear() {
    setHeroImage('')
    setHeroEnabled(true)
    await saveKey('hero_image', '')
    await saveKey('hero_image_enabled', '1')
    setHeroSaved(true)
    setTimeout(() => setHeroSaved(false), 2000)
  }

  async function handleAboutSave() {
    setAboutSaving(true)
    await saveKey('about_body', aboutBody)
    setAboutSaving(false)
    setAboutSaved(true)
    setTimeout(() => setAboutSaved(false), 2000)
  }

  const previewActive = heroImage && heroEnabled

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 space-y-8">
      <h1 className="text-2xl font-bold text-stone-800">Website Content</h1>

      {/* Hero Image */}
      <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-semibold text-stone-700">Hero Image</h2>
          {heroImage && (
            <button
              onClick={handleToggleEnabled}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${heroEnabled ? 'bg-amber-500' : 'bg-stone-200'}`}
              title={heroEnabled ? 'Hide image (show gradient)' : 'Show image'}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${heroEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          )}
        </div>
        <p className="text-sm text-stone-400 mb-5">
          {heroImage
            ? heroEnabled
              ? 'Image is active on the home page. Toggle off to show the default gradient instead.'
              : 'Image is saved but hidden — the default gradient is showing. Toggle on to display it.'
            : 'Upload an image to use as the home page banner background. Default amber gradient shown if none.'}
        </p>

        {previewActive ? (
          <div className="relative w-full h-48 rounded-lg overflow-hidden mb-4">
            <Image src={heroImage} alt="Hero" fill className="object-cover" />
            <div className="absolute inset-0 bg-amber-950/60" />
            <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-medium opacity-60">Live preview</span>
          </div>
        ) : heroImage && !heroEnabled ? (
          <div className="relative w-full h-48 rounded-lg overflow-hidden mb-4 opacity-40">
            <Image src={heroImage} alt="Hero (hidden)" fill className="object-cover" />
            <span className="absolute inset-0 flex items-center justify-center text-stone-800 text-xs font-medium bg-white/50">Hidden — gradient showing on site</span>
          </div>
        ) : (
          <div className="w-full h-48 rounded-lg bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center mb-4 text-amber-400 text-sm italic">
            No image set — default gradient shown
          </div>
        )}

        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => fileRef.current?.click()}
            disabled={heroUploading}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            {heroUploading ? 'Uploading…' : heroImage ? 'Replace Image' : 'Upload Image'}
          </button>
          {heroImage && (
            <button
              onClick={handleHeroClear}
              className="px-4 py-2 border border-stone-200 text-stone-600 hover:text-red-600 hover:border-red-200 text-sm font-medium rounded-lg transition-colors"
            >
              Remove
            </button>
          )}
          {heroSaved && <span className="text-sm text-green-600 self-center">Saved</span>}
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleHeroUpload} />
      </div>

      {/* About Page Text */}
      <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
        <h2 className="font-semibold text-stone-700 mb-1">About Page Text</h2>
        <p className="text-sm text-stone-400 mb-5">Each blank line between paragraphs creates a new paragraph on the About page.</p>

        <textarea
          value={aboutBody}
          onChange={e => setAboutBody(e.target.value)}
          rows={14}
          className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-y leading-relaxed"
        />

        <div className="flex items-center gap-3 mt-3">
          <button
            onClick={handleAboutSave}
            disabled={aboutSaving}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            {aboutSaving ? 'Saving…' : 'Save'}
          </button>
          {aboutSaved && <span className="text-sm text-green-600">Saved</span>}
        </div>
      </div>
    </div>
  )
}
