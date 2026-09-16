export function Spinner({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-gray-500">
      <div className="h-9 w-9 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
      <span className="text-sm">{label}</span>
    </div>
  );
}

export function ErrorBox({ message }: { message: string }) {
  return (
    <div className="mx-auto max-w-2xl rounded-xl border border-red-200 bg-red-50 px-4 py-6 text-center text-sm font-medium text-red-600">
      {message}
    </div>
  );
}

export function EmptyBox({ message, emoji = "🛒" }: { message: string; emoji?: string }) {
  return (
    <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-14 text-center">
      <div className="text-4xl">{emoji}</div>
      <p className="mt-3 text-sm font-medium text-gray-500">{message}</p>
    </div>
  );
}