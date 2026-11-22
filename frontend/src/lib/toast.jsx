import { createContext, useCallback, useContext, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Info, XCircle } from "lucide-react";

const ToastContext = createContext(() => {});

const icons = { success: CheckCircle2, error: XCircle, info: Info };
const colors = { success: "text-emerald-300", error: "text-rose-300", info: "text-sky-300" };

export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);

  const push = useCallback((message, type = "info") => {
    const id = `${Date.now()}-${Math.random()}`;
    setItems((a) => [...a, { id, message, type }]);
    setTimeout(() => setItems((a) => a.filter((t) => t.id !== id)), 3800);
  }, []);

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="fixed right-4 top-4 z-50 flex flex-col gap-2">
        <AnimatePresence>
          {items.map((t) => {
            const Icon = icons[t.type] || Info;
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, x: 60, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 60 }}
                className="glass flex items-center gap-3 px-4 py-3 text-sm shadow-xl"
              >
                <Icon size={18} className={colors[t.type] || colors.info} />
                {t.message}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
