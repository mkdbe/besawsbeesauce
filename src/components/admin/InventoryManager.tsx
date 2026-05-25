'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { Product } from '@/types'
import { Eye, EyeOff, Pencil, Trash2, Plus, X } from 'lucide-react'

interface Row extends Product { stock: number; dbPrice: number; published: number }

const CATEGORIES = [
  { value: 'honey', label: 'Honey' },
  { value: 'lip-balm', label: 'Lip Balm' },
  { value: 'bath-bombs', label: 'Bath Bombs' },
  { value: 'soap', label: 'Soap' },
  { value: 'other', label: 'Other' },
]

interface EditState { name: string; desc: string; cat: string; image: string; uploading: boolean }
interface AddState { name: string; desc: string; cat: string; price: string; image: string; uploading: boolean; saving: boolean }

const emptyAdd: AddState = { name: '', desc: '', cat: 'other', price: '', image: '', uploading: false, saving: false }

export default function InventoryManager({ products, featuredSlots }: { products: Row[]; featuredSlots: [string, string, string] }) {
  const [rows, setRows] = useState(products)
  const [saving, setSaving] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)
  const saveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  // Featured slots
  const [slots, setSlots] = useState<[string, string, string]>(featuredSlots)
  const [slotsSaving, setSlotsSaving] = useState(false)
  const [slotsSaved, setSlotsSaved] = useState(false)

  async function handleSaveSlots() {
    setSlotsSaving(true)
    await fetch('/api/admin/featured', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slots }),
    })
    setSlotsSaving(false)
    setSlotsSaved(true)
    setTimeout(() => setSlotsSaved(false), 1500)
  }

  // Edit state
  const [editing, setEditing] = useState<string | null>(null)
  const [editState, setEditState] = useState<EditState>({ name: '', desc: '', cat: '', image: '', uploading: false })
  const editFileRef = useRef<HTMLInputElement>(null)

  // Add state
  const [showAdd, setShowAdd] = useState(false)
  const [addState, setAddState] = useState<AddState>(emptyAdd)
  const addFileRef = useRef<HTMLInputElement>(null)

  // ── Inventory (stock/price/published) ──────────────────────────────────────

  async function handleSet(productId: string, stock: number, priceCents: number, published: number) {
    setSaving(productId)
    setSaved(null)
    await fetch('/api/admin/inventory', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, stock, price: priceCents, published }),
    })
    setRows((prev) => prev.map((r) => r.id === productId ? { ...r, stock, dbPrice: priceCents, published } : r))
    setSaving(null)
    setSaved(productId)
    setTimeout(() => setSaved(null), 1500)
  }

  // ── Edit product metadata ──────────────────────────────────────────────────

  function openEdit(row: Row) {
    setEditing(row.id)
    setEditState({ name: row.name, desc: row.description, cat: row.category, image: row.images[0] ?? '', uploading: false })
  }

  async function handleEditImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setEditState((s) => ({ ...s, uploading: true }))
    const fd = new FormData(); fd.append('file', file)
    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
    const data = await res.json()
    setEditState((s) => ({ ...s, uploading: false, image: data.url ?? s.image }))
    e.target.value = ''
  }

  async function handleEditSave(id: string) {
    await fetch(`/api/admin/products/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editState.name, description: editState.desc, category: editState.cat, image: editState.image }),
    })
    setRows((prev) => prev.map((r) => r.id === id
      ? { ...r, name: editState.name, description: editState.desc, category: editState.cat as Row['category'], images: editState.image ? [editState.image] : r.images }
      : r))
    setEditing(null)
  }

  // ── Delete product ─────────────────────────────────────────────────────────

  async function handleDelete(id: string, name: string) {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return
    await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
    setRows((prev) => prev.filter((r) => r.id !== id))
  }

  // ── Add new product ────────────────────────────────────────────────────────

  async function handleAddImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setAddState((s) => ({ ...s, uploading: true }))
    const fd = new FormData(); fd.append('file', file)
    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
    const data = await res.json()
    setAddState((s) => ({ ...s, uploading: false, image: data.url ?? s.image }))
    e.target.value = ''
  }

  async function handleAddSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!addState.name.trim()) return
    setAddState((s) => ({ ...s, saving: true }))
    const priceCents = Math.round(Math.max(0, parseFloat(addState.price) || 0) * 100)
    const res = await fetch('/api/admin/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: addState.name, description: addState.desc, price: priceCents, category: addState.cat, image: addState.image }),
    })
    const data = await res.json()
    if (data.id) {
      const newRow: Row = {
        id: data.id, name: addState.name, slug: data.slug, description: addState.desc,
        price: priceCents, images: addState.image ? [addState.image] : [],
        category: addState.cat as Row['category'], featured: false,
        stock: 0, dbPrice: priceCents, published: 1,
      }
      setRows((prev) => [...prev, newRow])
    }
    setAddState(emptyAdd)
    setShowAdd(false)
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  const inputCls = 'border border-stone-300 rounded px-2 py-1 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-400'

  return (
    <div>
      {/* Add Product button + form */}
      <div className="mb-4">
        {!showAdd ? (
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 text-sm font-medium text-amber-700 hover:text-amber-900 border border-amber-300 hover:border-amber-500 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Plus size={15} /> Add Product
          </button>
        ) : (
          <form onSubmit={handleAddSubmit} className="bg-white rounded-xl border border-stone-200 shadow-sm p-5 mb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-stone-700">New Product</h3>
              <button type="button" onClick={() => { setShowAdd(false); setAddState(emptyAdd) }} className="text-stone-400 hover:text-stone-600"><X size={18} /></button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
              <div className="col-span-2">
                <label className="block text-xs text-stone-500 mb-1">Name *</label>
                <input type="text" value={addState.name} onChange={(e) => setAddState((s) => ({ ...s, name: e.target.value }))} placeholder="Product name" className={inputCls + ' w-full'} required />
              </div>
              <div>
                <label className="block text-xs text-stone-500 mb-1">Category</label>
                <select value={addState.cat} onChange={(e) => setAddState((s) => ({ ...s, cat: e.target.value }))} className={inputCls + ' w-full'}>
                  {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-stone-500 mb-1">Price</label>
                <div className="flex items-center gap-1"><span className="text-stone-500 text-sm">$</span>
                  <input type="number" min={0} step={0.01} value={addState.price} onChange={(e) => setAddState((s) => ({ ...s, price: e.target.value }))} placeholder="0.00" className={inputCls + ' w-full'} />
                </div>
              </div>
            </div>
            <div className="mb-3">
              <label className="block text-xs text-stone-500 mb-1">Description</label>
              <textarea value={addState.desc} onChange={(e) => setAddState((s) => ({ ...s, desc: e.target.value }))} rows={2} placeholder="Short description…" className={inputCls + ' w-full resize-none'} />
            </div>
            <div className="flex items-center gap-3 mb-4">
              <button type="button" onClick={() => addFileRef.current?.click()} disabled={addState.uploading} className="text-sm border border-stone-300 rounded-lg px-3 py-1.5 text-stone-600 hover:bg-stone-50 disabled:opacity-50 transition-colors">
                {addState.uploading ? 'Uploading…' : 'Upload Photo'}
              </button>
              {addState.image && (
                <div className="relative w-10 h-10 rounded overflow-hidden border border-stone-200">
                  <Image src={addState.image} alt="preview" fill className="object-cover" sizes="40px" />
                </div>
              )}
              <input ref={addFileRef} type="file" accept="image/*" className="hidden" onChange={handleAddImageUpload} />
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={addState.saving || addState.uploading} className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-semibold px-4 py-1.5 rounded-lg text-sm transition-colors">
                {addState.saving ? 'Creating…' : 'Create Product'}
              </button>
              <button type="button" onClick={() => { setShowAdd(false); setAddState(emptyAdd) }} className="px-4 py-1.5 text-sm text-stone-600 hover:text-stone-800 border border-stone-300 rounded-lg transition-colors">Cancel</button>
            </div>
          </form>
        )}
      </div>

      {/* Home page featured slots */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5 mb-6">
        <h3 className="font-semibold text-stone-700 mb-1">Home Page Featured</h3>
        <p className="text-xs text-stone-400 mb-4">Choose 3 products to feature on the home page, in order left to right.</p>
        <div className="grid grid-cols-3 gap-3 mb-4">
          {([0, 1, 2] as const).map((i) => (
            <div key={i}>
              <label className="block text-xs text-stone-500 mb-1">Slot {i + 1}</label>
              <select
                value={slots[i]}
                onChange={(e) => {
                  const next: [string, string, string] = [...slots] as [string, string, string]
                  next[i] = e.target.value
                  setSlots(next)
                }}
                className={inputCls + ' w-full'}
              >
                <option value="">— none —</option>
                {rows.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSaveSlots}
            disabled={slotsSaving}
            className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-semibold px-4 py-1.5 rounded-lg text-sm transition-colors"
          >
            {slotsSaving ? 'Saving…' : 'Save'}
          </button>
          {slotsSaved && <span className="text-xs text-green-500">Saved</span>}
        </div>
      </div>

      {/* Inventory table */}
      <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 border-b border-stone-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-stone-600">Product</th>
              <th className="text-left px-4 py-3 font-medium text-stone-600">Price</th>
              <th className="text-left px-4 py-3 font-medium text-stone-600">Stock</th>
              <th className="text-left px-4 py-3 font-medium text-stone-600">Visible</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {rows.map((row) => (
              <>
                <tr key={row.id} className={`hover:bg-stone-50 ${row.published === 0 ? 'opacity-50' : ''}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {row.images[0] && (
                        <div className="relative w-9 h-9 rounded overflow-hidden bg-amber-100 flex-shrink-0">
                          <Image src={row.images[0]} alt={row.name} fill className="object-cover" sizes="36px" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-stone-800">{row.name}</p>
                        <p className="text-stone-400 text-xs">{row.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <span className="text-stone-500">$</span>
                      <input
                        type="number" min={0} step={0.01}
                        defaultValue={(row.dbPrice / 100).toFixed(2)}
                        onBlur={(e) => {
                          const cents = Math.round(Math.max(0, parseFloat(e.target.value) || 0) * 100)
                          handleSet(row.id, row.stock, cents, row.published)
                        }}
                        className="w-20 border border-stone-300 rounded px-2 py-1 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number" min={0} value={row.stock}
                      onChange={(e) => {
                        const newStock = Math.max(0, Number(e.target.value))
                        setRows((prev) => prev.map((r) => r.id === row.id ? { ...r, stock: newStock } : r))
                        clearTimeout(saveTimers.current[row.id])
                        saveTimers.current[row.id] = setTimeout(() => handleSet(row.id, newStock, row.dbPrice, row.published), 600)
                      }}
                      onBlur={(e) => { clearTimeout(saveTimers.current[row.id]); handleSet(row.id, Math.max(0, Number(e.target.value)), row.dbPrice, row.published) }}
                      disabled={saving === row.id}
                      className={`w-16 text-center border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-50 ${row.stock === 0 ? 'border-red-300 text-red-500' : 'border-stone-300 text-stone-900'}`}
                    />
                    {saved === row.id && <span className="ml-2 text-xs text-green-500">Saved</span>}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleSet(row.id, row.stock, row.dbPrice, row.published === 1 ? 0 : 1)}
                      disabled={saving === row.id}
                      title={row.published === 1 ? 'Hide from shop' : 'Show in shop'}
                      className={`p-1.5 rounded transition-colors ${row.published === 1 ? 'text-green-600 hover:bg-green-50' : 'text-stone-400 hover:bg-stone-100'}`}
                    >
                      {row.published === 1 ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => editing === row.id ? setEditing(null) : openEdit(row)}
                        title="Edit product"
                        className={`p-1.5 rounded transition-colors ${editing === row.id ? 'bg-amber-100 text-amber-700' : 'text-stone-400 hover:bg-stone-100 hover:text-stone-700'}`}
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(row.id, row.name)}
                        title="Delete product"
                        className="p-1.5 rounded text-stone-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>

                {editing === row.id && (
                  <tr key={`${row.id}-edit`} className="bg-amber-50 border-t border-amber-100">
                    <td colSpan={5} className="px-4 py-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                        <div className="col-span-2">
                          <label className="block text-xs text-stone-500 mb-1">Name</label>
                          <input type="text" value={editState.name} onChange={(e) => setEditState((s) => ({ ...s, name: e.target.value }))} className={inputCls + ' w-full'} />
                        </div>
                        <div>
                          <label className="block text-xs text-stone-500 mb-1">Category</label>
                          <select value={editState.cat} onChange={(e) => setEditState((s) => ({ ...s, cat: e.target.value }))} className={inputCls + ' w-full'}>
                            {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-stone-500 mb-1">Photo</label>
                          <div className="flex items-center gap-2">
                            <button type="button" onClick={() => editFileRef.current?.click()} disabled={editState.uploading} className="text-xs border border-stone-300 rounded px-2 py-1.5 text-stone-600 hover:bg-white disabled:opacity-50 transition-colors">
                              {editState.uploading ? 'Uploading…' : editState.image ? 'Replace' : 'Upload'}
                            </button>
                            {editState.image && (
                              <div className="relative w-8 h-8 rounded overflow-hidden border border-stone-200">
                                <Image src={editState.image} alt="preview" fill className="object-cover" sizes="32px" />
                              </div>
                            )}
                          </div>
                          <input ref={editFileRef} type="file" accept="image/*" className="hidden" onChange={handleEditImageUpload} />
                        </div>
                      </div>
                      <div className="mb-3">
                        <label className="block text-xs text-stone-500 mb-1">Description</label>
                        <textarea value={editState.desc} onChange={(e) => setEditState((s) => ({ ...s, desc: e.target.value }))} rows={2} className={inputCls + ' w-full resize-none'} />
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleEditSave(row.id)} className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-4 py-1.5 rounded-lg text-sm transition-colors">Save</button>
                        <button onClick={() => setEditing(null)} className="px-4 py-1.5 text-sm text-stone-600 hover:text-stone-800 border border-stone-300 rounded-lg transition-colors">Cancel</button>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
