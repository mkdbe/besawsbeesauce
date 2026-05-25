import AdminNav from '@/components/admin/AdminNav'
import BlogEditor from '@/components/admin/BlogEditor'

export default function NewBlogPost() {
  return (
    <>
      <AdminNav />
      <div className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold text-stone-800 mb-8">New Post</h1>
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
          <BlogEditor />
        </div>
      </div>
    </>
  )
}
