export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number = 500,
    public readonly code?: string,
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export class ValidationError extends AppError {
  constructor(message: string) { super(message, 400, 'VALIDATION_ERROR') }
}

export class AuthError extends AppError {
  constructor(message = 'Unauthenticated') { super(message, 401, 'UNAUTHENTICATED') }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') { super(message, 403, 'FORBIDDEN') }
}

export class NotFoundError extends AppError {
  constructor(resource: string) { super(`${resource} not found`, 404, 'NOT_FOUND') }
}

export class ConflictError extends AppError {
  constructor(message: string) { super(message, 409, 'CONFLICT') }
}

export class BusinessError extends AppError {
  constructor(message: string) { super(message, 422, 'BUSINESS_LOGIC') }
}
