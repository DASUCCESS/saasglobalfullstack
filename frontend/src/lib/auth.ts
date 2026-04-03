"use client";

export const TOKEN_KEY = "sg_token";

export const getToken = () => (typeof window === "undefined" ? "" : localStorage.getItem(TOKEN_KEY) || "");
export const setToken = (token: string) => {
  if (typeof window !== "undefined") localStorage.setItem(TOKEN_KEY, token);
};
export const clearToken = () => {
  if (typeof window !== "undefined") localStorage.removeItem(TOKEN_KEY);
};
