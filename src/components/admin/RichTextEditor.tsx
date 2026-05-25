'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Youtube from '@tiptap/extension-youtube'
import Placeholder from '@tiptap/extension-placeholder'
import { useEffect, useCallback, useRef, useState } from 'react'
import {
  Bold, Italic, Heading2, Heading3, List, ListOrdered,
  Quote, Minus, Link2, ImageIcon, Upload, PlayCircle, Undo, Redo,
} from 'lucide-react'

interface Props {
  value: string
  onChange: (html: string) => void
}

export default function RichTextEditor({ value, onChange }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false, HTMLAttributes: { class: 'text-amber-600 underline' } }),
      Image.configure({ HTMLAttributes: { class: 'max-w-full rounded-lg my-4' } }),
      Youtube.configure({ width: 640, height: 360, HTMLAttributes: { class: 'my-4 rounded-lg overflow-hidden' } }),
      Placeholder.configure({ placeholder: 'Write your post…' }),
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: { class: 'tiptap-editor min-h-[400px] focus:outline-none' },
    },
  })

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false })
    }
  }, [value, editor])

  const addLink = useCallback(() => {
    const url = prompt('Enter URL:')
    if (!url) return
    if (editor?.state.selection.empty) {
      editor.chain().focus().insertContent(`<a href="${url}">${url}</a>`).run()
    } else {
      editor?.chain().focus().setLink({ href: url }).run()
    }
  }, [editor])

  const addImage = useCallback(() => {
    const url = prompt('Image URL:')
    if (url) editor?.chain().focus().setImage({ src: url }).run()
  }, [editor])

  const addYoutube = useCallback(() => {
    const url = prompt('YouTube URL:')
    if (url) editor?.commands.setYoutubeVideo({ src: url })
  }, [editor])

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !editor) return
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
    const data = await res.json()
    if (data.url) editor.chain().focus().setImage({ src: data.url }).run()
    else alert(data.error ?? 'Upload failed')
    setUploading(false)
    e.target.value = ''
  }, [editor])

  if (!editor) return null

  const btn = (active: boolean) =>
    `p-1.5 rounded transition-colors ${active ? 'bg-amber-100 text-amber-800' : 'text-stone-600 hover:bg-stone-100'}`

  return (
    <div className="border border-stone-300 rounded-lg overflow-hidden">
      <div className="flex flex-wrap gap-0.5 p-2 border-b border-stone-200 bg-stone-50">
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={btn(editor.isActive('bold'))} title="Bold"><Bold size={16} /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={btn(editor.isActive('italic'))} title="Italic"><Italic size={16} /></button>
        <div className="w-px bg-stone-200 mx-1" />
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={btn(editor.isActive('heading', { level: 2 }))} title="Heading 2"><Heading2 size={16} /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={btn(editor.isActive('heading', { level: 3 }))} title="Heading 3"><Heading3 size={16} /></button>
        <div className="w-px bg-stone-200 mx-1" />
        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={btn(editor.isActive('bulletList'))} title="Bullet list"><List size={16} /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btn(editor.isActive('orderedList'))} title="Numbered list"><ListOrdered size={16} /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={btn(editor.isActive('blockquote'))} title="Quote"><Quote size={16} /></button>
        <button type="button" onClick={() => editor.chain().focus().setHorizontalRule().run()} className={btn(false)} title="Divider"><Minus size={16} /></button>
        <div className="w-px bg-stone-200 mx-1" />
        <button type="button" onClick={addLink} className={btn(editor.isActive('link'))} title="Add link"><Link2 size={16} /></button>
        <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} className={btn(false) + ' disabled:opacity-50'} title="Upload image from computer"><Upload size={16} /></button>
        <button type="button" onClick={addImage} className={btn(false)} title="Add image from URL"><ImageIcon size={16} /></button>
        <button type="button" onClick={addYoutube} className={btn(false)} title="Embed YouTube video"><PlayCircle size={16} /></button>
        <div className="w-px bg-stone-200 mx-1 ml-auto" />
        <button type="button" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} className={btn(false) + ' disabled:opacity-30'} title="Undo"><Undo size={16} /></button>
        <button type="button" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} className={btn(false) + ' disabled:opacity-30'} title="Redo"><Redo size={16} /></button>
      </div>
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
      {uploading && <div className="px-4 py-2 text-xs text-amber-600 bg-amber-50">Uploading…</div>}
      <EditorContent editor={editor} className="px-4 py-3 text-stone-900 text-sm" />
    </div>
  )
}
