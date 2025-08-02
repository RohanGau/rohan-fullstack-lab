export function ErrorMessage({ message, detail }: { message: string; detail?: string }) {
  return (
    <div className="text-center text-red-500 py-12">
      <p>{message}</p>
      {detail && <p className="mt-2 text-sm text-red-400">{detail}</p>}
    </div>
  );
}
