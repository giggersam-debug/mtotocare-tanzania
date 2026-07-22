import { ParentPortalPanel } from '@/components/ParentPortalPanel';

export default function ParentPortalPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12">
      <div className="mx-auto mb-8 max-w-lg text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-blue">Parent Portal</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Your child's health record</h1>
        <p className="mt-1 text-sm text-slate-500">No account needed — just your child's QR token and phone number.</p>
      </div>
      <ParentPortalPanel />
    </main>
  );
}
