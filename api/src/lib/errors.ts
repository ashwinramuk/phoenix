// A typed error carrying an HTTP status, so route code can throw intent
// and the central error handler translates it to a safe response.
export class ApiError extends Error {
  statusCode: number;
  constructor(statusCode: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
  }
}
