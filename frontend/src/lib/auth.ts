"use client";

import { env } from "@/lib/env";

export const TOKEN_KEY = env.authTokenStorageKey;
export const POST_LOGIN_PATH_KEY = env.postLoginPathStorageKey;

export const getToken = () => (typeof window === "undefined" ? "" : localStorage.getItem(TOKEN_KEY) || "");

export const setToken = (token: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(TOKEN_KEY, token);
  }
};

export const clearToken = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_KEY);
  }
};

export const rememberPostLoginPath = (path: string) => {
  if (typeof window !== "undefined" && path) {
    localStorage.setItem(POST_LOGIN_PATH_KEY, path);
  }
};

export const getPostLoginPath = () =>
  typeof window === "undefined" ? "" : localStorage.getItem(POST_LOGIN_PATH_KEY) || "";

export const consumePostLoginPath = () => {
  if (typeof window === "undefined") return "";
  const value = localStorage.getItem(POST_LOGIN_PATH_KEY) || "";
  localStorage.removeItem(POST_LOGIN_PATH_KEY);
  return value;
};
