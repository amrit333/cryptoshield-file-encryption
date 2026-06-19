import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const KEY_LENGTH = 32;
const ITERATIONS = 100000;
const AUTH_TAG_LENGTH = 16;

export function deriveKey(password: string, salt: string): Buffer {
  return crypto.pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, "sha256");
}

export function generateSalt(): string {
  return crypto.randomBytes(16).toString("hex");
}

export function generateIV(): string {
  return crypto.randomBytes(12).toString("hex"); // 12 bytes recommended for GCM
}

export function encryptBuffer(buffer: Buffer, key: Buffer, ivHex: string): Buffer {
  const iv = Buffer.from(ivHex, "hex");
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
  const authTag = cipher.getAuthTag();
  
  // Append auth tag to the end of the encrypted payload
  return Buffer.concat([encrypted, authTag]);
}

export function decryptBuffer(encryptedWithTag: Buffer, key: Buffer, ivHex: string): Buffer {
  const iv = Buffer.from(ivHex, "hex");
  
  // Extract auth tag from the end
  const encrypted = encryptedWithTag.subarray(0, encryptedWithTag.length - AUTH_TAG_LENGTH);
  const authTag = encryptedWithTag.subarray(encryptedWithTag.length - AUTH_TAG_LENGTH);

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  
  return Buffer.concat([decipher.update(encrypted), decipher.final()]);
}
