export class DamaruException extends Error {
  constructor(
    readonly message: string,
    readonly stack: string
  ) {
    super(message);
  }
}
