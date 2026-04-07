"use client";

import { useState } from "react";

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
};

export default function SecretInput({ value, onChange, placeholder }: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="flex gap-2">
      <input
        type={visible ? "text" : "password"}
        className="flex-1 rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      <button
        type="button"
        onClick={() => setVisible((prev) => !prev)}
        className="rounded-lg border border-neutral-700 px-3 py-2 text-sm hover:bg-neutral-800 cursor-pointer"
      >
        {visible ? "Hide" : "Show"}
      </button>
    </div>
  );
}
