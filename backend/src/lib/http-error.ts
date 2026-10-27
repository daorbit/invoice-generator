export class HttpError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

export function notFoundError(what: string): HttpError {
  return new HttpError(404, 'not_found', `${what} not found`);
}

export function badRequestError(message: string): HttpError {
  return new HttpError(400, 'invalid_input', message);
}
