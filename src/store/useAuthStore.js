import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = process.env.NEXT_PUBLIC_API_KEY || "fallback-secret-key-9988";

const encrypt = (text) => {
  return CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
};

const decrypt = (cipherText) => {
  try {
    const bytes = CryptoJS.AES.decrypt(cipherText, ENCRYPTION_KEY);
    const decryptedStr = bytes.toString(CryptoJS.enc.Utf8);
    return decryptedStr;
  } catch {
    return null;
  }
};

const secureStorage = {
  getItem: (name) => {
    if (typeof localStorage === "undefined") return null;
    const encryptedStr = localStorage.getItem(name);
    if (!encryptedStr) return null;
    const decryptedStr = decrypt(encryptedStr);
    return decryptedStr || null;
  },
  setItem: (name, value) => {
    const encryptedStr = encrypt(value);
    if (typeof localStorage !== "undefined") localStorage.setItem(name, encryptedStr);
  },
  removeItem: (name) => {
    if (typeof localStorage !== "undefined") localStorage.removeItem(name);
  },
};

export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      _hasHydrated: false,
      setToken: (token) => set({ token }),
      logout: () => set({ token: null }),
      setHasHydrated: (value) => set({ _hasHydrated: value }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => secureStorage),
      onRehydrateStorage: () => (state) => state?.setHasHydrated(true),
    }
  )
);
