/**
 * AWS KMS Encryption Utility
 * AES-256-GCM encryption/decryption for sensitive data (DigiLocker tokens)
 * DPDP Act 2023 Compliance - No hardcoded keys, all via AWS KMS
 */

import {
  EncryptClient,
  DecryptClient,
  GenerateDataKeyClient
} from "@aws-crypto/client-node";
import { KMSClient } from "@aws-sdk/client-kms";

const getKmsClient = () => {
  const region = process.env.AWS_REGION || "ap-south-1"; // Mumbai region for India
  return new KMSClient({
    region,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });
};

const getEncryptionClient = () => {
  const keyId = process.env.AWS_KMS_KEY_ID!;
  const region = process.env.AWS_REGION || "ap-south-1";

  return new EncryptClient({
    keyId,
    clientProvider: () => getKmsClient(),
  });
};

const getDecryptionClient = () => {
  const region = process.env.AWS_REGION || "ap-south-1";

  return new DecryptClient({
    clientProvider: () => getKmsClient(),
  });
};

export interface EncryptedData {
  ciphertext: string;
  iv: string;
  authTag: string;
}

/**
 * Encrypt sensitive data using AES-256-GCM via AWS KMS
 * @param plaintext - The data to encrypt
 * @returns EncryptedData with ciphertext, iv, and authTag (all base64 encoded)
 */
export const encryptWithKMS = async (plaintext: string): Promise<EncryptedData> => {
  try {
    const encryptClient = getEncryptionClient();
    const result = await encryptClient.encrypt(plaintext);

    return {
      ciphertext: result.result.toString("base64"),
      iv: result.iv.toString("base64"),
      authTag: result.tag.toString("base64"),
    };
  } catch (error) {
    console.error("KMS Encryption failed:", error);
    throw new Error("ENCRYPTION_FAILED");
  }
};

/**
 * Decrypt data using AWS KMS
 * @param ciphertext - Base64 encoded ciphertext
 * @param iv - Base64 encoded initialization vector
 * @param authTag - Base64 encoded authentication tag
 * @returns Decrypted plaintext string
 */
export const decryptWithKMS = async (
  ciphertext: string,
  iv: string,
  authTag: string
): Promise<string> => {
  try {
    const decryptClient = getDecryptionClient();

    const ciphertextBuffer = Buffer.from(ciphertext, "base64");
    const ivBuffer = Buffer.from(iv, "base64");
    const authTagBuffer = Buffer.from(authTag, "base64");

    // Combine ciphertext and authTag for GCM mode
    const combinedBuffer = Buffer.concat([ciphertextBuffer, authTagBuffer]);

    const result = await decryptClient.decrypt(combinedBuffer, {
      iv: ivBuffer,
    });

    return result.plaintext.toString("utf8");
  } catch (error) {
    console.error("KMS Decryption failed:", error);
    throw new Error("DECRYPTION_FAILED");
  }
};

/**
 * Generate a data key for client-side encryption
 * @returns Plaintext and encrypted data keys
 */
export const generateDataKey = async () => {
  const kmsClient = getKmsClient();
  const keyId = process.env.AWS_KMS_KEY_ID!;

  try {
    const { Plaintext, CiphertextBlob } = await kmsClient.send(
      new (require("@aws-sdk/client-kms").GenerateDataKeyCommand)({
        KeyId: keyId,
        KeySpec: "AES_256",
      })
    );

    return {
      plaintextKey: Plaintext?.toString("base64"),
      encryptedKey: CiphertextBlob?.toString("base64"),
    };
  } catch (error) {
    console.error("Data key generation failed:", error);
    throw new Error("DATA_KEY_GENERATION_FAILED");
  }
};
