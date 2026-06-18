export const envelope = {
  ok<T>(data: T, message = "Berhasil.") {
    return { success: true, data, message };
  },
  fail(message: string, errors?: Record<string, string[]>) {
    return { success: false, data: null, message, ...(errors ? { errors } : {}) };
  },
};
