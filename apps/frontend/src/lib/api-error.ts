// Eden surfaces non-2xx as `{ status, value }` where `value` is our response
// envelope `{ success:false, message, errors? }`. These helpers read that shape.

export function serverErrors(error: unknown): Record<string, string> | null {
  if (error && typeof error === "object" && "value" in error) {
    const value = (error as { value?: { errors?: Record<string, string[]> } }).value;
    if (value?.errors) {
      const out: Record<string, string> = {};
      for (const [field, msgs] of Object.entries(value.errors)) {
        out[field] = msgs[0] ?? "Tidak valid.";
      }
      return out;
    }
  }
  return null;
}

export function serverMessage(error: unknown): string {
  if (error && typeof error === "object" && "value" in error) {
    const value = (error as { value?: { message?: string } }).value;
    if (value?.message) return value.message;
  }
  return "Terjadi kesalahan.";
}
