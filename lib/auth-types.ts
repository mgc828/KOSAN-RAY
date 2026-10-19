export interface ResetToken {
  /** SHA-256 dari token (token asli hanya ada di email). */
  id: string;
  email: string;
  expires: number;
}
