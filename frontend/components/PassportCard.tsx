interface PassportCardProps {
  childName: string;
  dateOfBirth: string;
  childId: string;
  qrCodeImage: string;
  qrToken?: string;
}

export function PassportCard({ childName, dateOfBirth, childId, qrCodeImage, qrToken }: PassportCardProps) {
  return (
    <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
      <div className="flex items-center gap-3 bg-navy px-5 py-4">
        <div className="h-8 w-8 rounded-md bg-gold" />
        <div>
          <p className="text-sm font-bold text-white">MtotoCare Tanzania</p>
          <p className="text-[10px] uppercase tracking-widest text-white/60">Digital Child Health Passport</p>
        </div>
      </div>

      <div className="flex gap-5 p-5">
        <div>
          <p className="text-[10px] uppercase tracking-wide text-slate-400">Child ID</p>
          <p className="font-mono text-sm font-semibold text-blue">{childId.slice(0, 8).toUpperCase()}</p>

          <p className="mt-3 text-[10px] uppercase tracking-wide text-slate-400">Name</p>
          <p className="text-sm font-semibold text-slate-900">{childName}</p>

          <p className="mt-3 text-[10px] uppercase tracking-wide text-slate-400">Date of birth</p>
          <p className="text-sm font-semibold text-slate-900">{dateOfBirth}</p>
        </div>

        <div className="ml-auto flex flex-col items-center gap-1">
          <img
            src={qrCodeImage}
            alt="Child passport QR code"
            className="h-28 w-28 rounded-lg border border-slate-100"
          />
          {qrToken && (
            <p className="max-w-[7.5rem] break-all text-center font-mono text-[9px] text-slate-400">{qrToken}</p>
          )}
        </div>
      </div>

      <div className="h-1.5 w-full bg-gradient-to-r from-navy via-white to-green" />
      <p className="px-5 py-3 text-center text-[11px] font-semibold text-slate-500">
        Every Child. Every Visit. Everywhere.
      </p>
    </div>
  );
}
