import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/auth'

export default async function AdminRoot() {
  const ok = await getAdminSession()
  redirect(ok ? '/admin/dashboard' : '/admin/login')
}
