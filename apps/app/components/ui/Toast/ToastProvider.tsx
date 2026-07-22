import { createContext, useContext, useState, ReactNode } from "react";
import { Toast, ToastType } from "./index";

interface ToastContextType {
  showToast: (type: ToastType, message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface ToastProviderProps {
  children: ReactNode;
}

/**
 * ToastProvider component for managing global toast notifications.
 *
 * Wraps the app and provides a showToast function that displays toasts.
 *
 * Usage:
 * <ToastProvider>
 *   <App />
 * </ToastProvider>
 *
 * In components:
 * const { showToast } = useToast();
 * showToast("success", "Busca realizada com sucesso");
 */
export function ToastProvider({ children }: ToastProviderProps) {
  const [toast, setToast] = useState<{ type: ToastType; message: string } | null>(null);

  const showToast = (type: ToastType, message: string) => {
    setToast({ type, message });
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </ToastContext.Provider>
  );
}

/**
 * Hook to use the toast context.
 *
 * Throws an error if used outside ToastProvider.
 *
 * Usage:
 * const { showToast } = useToast();
 * showToast("success", "Busca realizada com sucesso");
 */
export function useToast(): ToastContextType {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}
