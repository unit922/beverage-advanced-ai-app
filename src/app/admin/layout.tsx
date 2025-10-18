import Sidebar from '@/components/Sidebar';
import { getSupabaseServer } from '@/lib/supabaseServer';
import { redirect } from 'next/navigation';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await getSupabaseServer();
  const { data } = await supabase.auth.getUser();
  if (!data?.user) redirect('/login');
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6 bg-gray-50">{children}</main>
    </div>
  );
}
