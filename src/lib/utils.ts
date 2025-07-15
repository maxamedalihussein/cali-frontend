import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function authFetch(url: string, options: RequestInit = {}) {
  const stored = localStorage.getItem("auth");
  let token = null;
  if (stored) {
    try {
      token = JSON.parse(stored).token;
    } catch {}
  }
  const headers = {
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  return fetch(url, { ...options, headers });
}
