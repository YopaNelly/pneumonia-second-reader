import { motion } from "framer-motion";
import { Check } from "lucide-react";

export function passwordChecks(password, confirm) {
  return [
    { ok: password.length >= 8, text: "At least 8 characters" },
    { ok: /\d/.test(password), text: "One number" },
    { ok: /[A-Z]/.test(password), text: "One uppercase letter" },
    { ok: password.length > 0 && password === confirm, text: "Passwords match" },
  ];
}

export function PasswordChecklist({ checks }) {
  return (
    <ul className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
      {checks.map((r) => (
        <li
          key={r.text}
          className={`flex items-center gap-1.5 transition ${
            r.ok ? "text-emerald-300" : "text-[var(--muted)]"
          }`}
        >
          <motion.span animate={{ scale: r.ok ? [1, 1.4, 1] : 1 }}>
            <Check size={13} />
          </motion.span>
          {r.text}
        </li>
      ))}
    </ul>
  );
}
