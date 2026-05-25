import AdminNav from '@/components/admin/AdminNav'
import ContentEditor from '@/components/admin/ContentEditor'
import { getAllContent } from '@/lib/content'

export const dynamic = 'force-dynamic'

export default function ContentPage() {
  const content = getAllContent()
  return (
    <>
      <AdminNav />
      <ContentEditor initial={content} />
    </>
  )
}
