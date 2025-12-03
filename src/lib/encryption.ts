// Client-side encryption utilities using Web Crypto API
// Uses AES-GCM for authenticated encryption

const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const IV_LENGTH = 12;

// Generate a random encryption key
async function generateKey(): Promise<CryptoKey> {
  return await crypto.subtle.generateKey(
    { name: ALGORITHM, length: KEY_LENGTH },
    true,
    ['encrypt', 'decrypt']
  );
}

// Export key to base64 for storage
async function exportKey(key: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey('raw', key);
  return btoa(String.fromCharCode(...new Uint8Array(exported)));
}

// Import key from base64
async function importKey(keyData: string): Promise<CryptoKey> {
  const keyBuffer = Uint8Array.from(atob(keyData), c => c.charCodeAt(0));
  return await crypto.subtle.importKey(
    'raw',
    keyBuffer,
    { name: ALGORITHM, length: KEY_LENGTH },
    true,
    ['encrypt', 'decrypt']
  );
}

// Get or create encryption key for user
export async function getEncryptionKey(userId: string): Promise<CryptoKey> {
  const storageKey = `vita_care_encryption_key_${userId}`;
  let keyData = localStorage.getItem(storageKey);
  
  if (!keyData) {
    const newKey = await generateKey();
    keyData = await exportKey(newKey);
    localStorage.setItem(storageKey, keyData);
  }
  
  return await importKey(keyData);
}

// Encrypt text
export async function encryptText(text: string, key: CryptoKey): Promise<string> {
  if (!text || text.trim() === '') return '';
  
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
    
    const encrypted = await crypto.subtle.encrypt(
      { name: ALGORITHM, iv },
      key,
      data
    );
    
    // Combine IV and encrypted data, then base64 encode
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);
    
    return 'ENC:' + btoa(String.fromCharCode(...combined));
  } catch (error) {
    console.error('Encryption failed:', error);
    return text; // Return original text if encryption fails
  }
}

// Decrypt text
export async function decryptText(encryptedText: string, key: CryptoKey): Promise<string> {
  if (!encryptedText || encryptedText.trim() === '') return '';
  
  // Check if text is encrypted (has our prefix)
  if (!encryptedText.startsWith('ENC:')) {
    return encryptedText; // Return as-is if not encrypted
  }
  
  try {
    const combined = Uint8Array.from(atob(encryptedText.slice(4)), c => c.charCodeAt(0));
    const iv = combined.slice(0, IV_LENGTH);
    const encrypted = combined.slice(IV_LENGTH);
    
    const decrypted = await crypto.subtle.decrypt(
      { name: ALGORITHM, iv },
      key,
      encrypted
    );
    
    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch (error) {
    console.error('Decryption failed:', error);
    return encryptedText; // Return encrypted text if decryption fails
  }
}

// Check if text is encrypted
export function isEncrypted(text: string): boolean {
  return text?.startsWith('ENC:') || false;
}
