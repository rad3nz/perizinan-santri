export class AppError extends Error {
  constructor(
    public status: number,
    message: string,
    public errors?: Record<string, string[]>,
  ) {
    super(message);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, errors?: Record<string, string[]>) {
    super(422, message, errors);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Tidak terautentikasi.") {
    super(401, message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Akses ditolak.") {
    super(403, message);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Data tidak ditemukan.") {
    super(404, message);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(409, message);
  }
}
