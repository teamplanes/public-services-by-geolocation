class AppError extends Error {
  statusCode = 0;
  status = "";

  constructor(statusCode = 0, status = "", message = "") {
    super(message);
    this.statusCode = statusCode;
    this.status = status;
    this.message = message;
  }
}

module.exports = AppError;
