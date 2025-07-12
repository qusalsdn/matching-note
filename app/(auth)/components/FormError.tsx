export function FormError({ error }: { error?: { message?: string } }) {
  return error?.message ? <p className="text-red-500 text-sm">{error.message}</p> : null;
}
