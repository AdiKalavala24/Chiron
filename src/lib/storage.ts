import { createMMKV } from 'react-native-mmkv';
import type { StateStorage } from 'zustand/middleware';

/**
 * One on-device MMKV instance backs every persisted store. MMKV requires
 * a custom dev client / release build — it does not run inside Expo Go.
 * v4's API is a `createMMKV()` factory rather than a `new MMKV()` class.
 */
export const mmkv = createMMKV({ id: 'chiron-storage' });

/** Adapts MMKV's sync string API to zustand's `persist` middleware contract. */
export const mmkvStorage: StateStorage = {
  setItem: (name, value) => {
    mmkv.set(name, value);
  },
  getItem: (name) => {
    const value = mmkv.getString(name);
    return value ?? null;
  },
  removeItem: (name) => {
    mmkv.remove(name);
  },
};
