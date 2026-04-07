export type ToastTone = "success" | "error" | "info";

export type ToastPayload = {
  id: number;
  tone: ToastTone;
  title?: string;
  message: string;
  duration?: number;
};

type Listener = (toast: ToastPayload) => void;

const listeners = new Set<Listener>();

function emit(toast: ToastPayload) {
  listeners.forEach((listener) => listener(toast));
}

export function subscribeToasts(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function show(tone: ToastTone, message: string, title?: string, duration = 3500) {
  emit({
    id: Date.now() + Math.floor(Math.random() * 1000),
    tone,
    title,
    message,
    duration,
  });
}

export const toast = {
  success(message: string, title?: string, duration?: number) {
    show("success", message, title, duration);
  },
  error(message: string, title?: string, duration?: number) {
    show("error", message, title, duration);
  },
  info(message: string, title?: string, duration?: number) {
    show("info", message, title, duration);
  },
};
