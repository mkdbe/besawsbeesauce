import { notFound } from 'next/navigation'
import AdminNav from '@/components/admin/AdminNav'
import BlogEditor from '@/components/admin/BlogEditor'
import { getBlogPostById } from '@/lib/blog'

interface Props { params: Promise<{ id: string }> }

export const dynamic = 'force-dynamic'

export default async function EditBlogPost({ params }: Props) {
  const { id } = await params
  const post = getBlogPostById(Number(id))
  if (!post) notFound()

  return (
    <>
      <AdminNav />
      <div className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold text-stone-800 mb-8">Edit Post</h1>
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
          <BlogEditor id={post.id} initial={post} />
        </div>
      </div>
    </>
  )
}
