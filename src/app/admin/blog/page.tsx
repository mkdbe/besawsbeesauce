import AdminNav from '@/components/admin/AdminNav'
import { getAllBlogPostsAdmin } from '@/lib/blog'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default function AdminBlogList() {
  const posts = getAllBlogPostsAdmin()

  return (
    <>
      <AdminNav />
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-stone-800">Blog Posts</h1>
          <Link
            href="/admin/blog/new"
            className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
          >
            + New Post
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
          {posts.length === 0 ? (
            <p className="p-6 text-stone-500">No posts yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-stone-50 border-b border-stone-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-stone-600">Title</th>
                  <th className="text-left px-4 py-3 font-medium text-stone-600">Date</th>
                  <th className="text-left px-4 py-3 font-medium text-stone-600">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-stone-50">
                    <td className="px-4 py-3 text-stone-800 font-medium">{post.title}</td>
                    <td className="px-4 py-3 text-stone-500">{post.date}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                          post.published
                            ? 'bg-green-100 text-green-700'
                            : 'bg-stone-100 text-stone-500'
                        }`}
                      >
                        {post.published ? 'Live' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/blog/${post.id}`}
                        className="text-amber-600 hover:text-amber-800 font-medium"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  )
}
