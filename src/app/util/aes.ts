/**
 * @file util/aes.ts
 * @summary Used to safely store values in client, as decryption key is only available server side.
 */

import crypto from "crypto";

/**
 * create a key for AES-256-GCM.
 * @returns {string} Base 64 encoded 256 bit key.
 */
export function createBase64Key() {
  const key = crypto.randomBytes(32);
  return key.toString("base64");
}

/**
 * Encrypts the given data using AES-256-GCM with the provided key.
 *
 * @param {string} base64Key - The encryption key. It should be a base 64 string.
 * @param {string} data - The data to encrypt.
 * @returns {string} The base64-encoded string containing the IV, ciphertext, and authentication tag.
 */
export function encrypt(base64Key: string, data: string): string {
  // Decode the Base64 key
  const key = Buffer.from(base64Key, "base64");

  // Ensure the key is 32 bytes (256 bits)
  if (key.length !== 32) {
    throw new Error("Invalid AES key length");
  }

  const iv = crypto.randomBytes(12); // 12 bytes for AES-GCM
  const cipher = crypto.createCipheriv("aes-256-gcm", Buffer.from(key), iv);
  let ciphertext = cipher.update(data);
  ciphertext = Buffer.concat([ciphertext, cipher.final()]);
  const tag = cipher.getAuthTag();

  // Combine data, iv, and tag for transmission
  const combinedData = Buffer.concat([iv, ciphertext, tag]);
  return combinedData.toString("base64");
}

/**
 * Decrypts the given encrypted data using AES-256-GCM with the provided key.
 *
 * @param {string} base64Key - The decryption key. It should be a base 64 string.
 * @param {string} encryptedData - The base64-encoded string containing the IV, ciphertext, and authentication tag.
 * @returns {string | null} The decrypted plaintext string, or null if decryption fails.
 */
export function decrypt(
  base64Key: string,
  encryptedData: string
): string | null {
  try {
    // Decode the Base64 key
    const key = Buffer.from(base64Key, "base64");

    // Ensure the key is 32 bytes (256 bits)
    if (key.length !== 32) {
      throw new Error("Invalid AES key length");
    }

    const combinedData = Buffer.from(encryptedData, "base64");
    const iv = combinedData.subarray(0, 12);
    const encrypted = combinedData.subarray(12, combinedData.length - 16);
    const tag = combinedData.subarray(combinedData.length - 16);

    const decipher = crypto.createDecipheriv(
      "aes-256-gcm",
      Buffer.from(key),
      iv
    );
    decipher.setAuthTag(tag);
    const decrypted = decipher.update(encrypted);
    const plaintext = Buffer.concat([decrypted, decipher.final()]).toString();
    return plaintext;
  } catch (error) {
    console.error("Error decrypting data:", error);
    return null;
  }
}
