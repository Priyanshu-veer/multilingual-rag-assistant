import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  X,
} from "lucide-react";

export type ToastType =
  | "success"
  | "warning"
  | "error"
  | "info";

interface ToastProps {
  type: ToastType;
  message: string;
  onClose: () => void;
}

export default function Toast({
  type,
  message,
  onClose,
}: ToastProps) {

  const config = {

    success: {
      icon: <CheckCircle2 size={18} />,
      className: "toast-success",
    },

    warning: {
      icon: <AlertTriangle size={18} />,
      className: "toast-warning",
    },

    error: {
      icon: <XCircle size={18} />,
      className: "toast-error",
    },

    info: {
      icon: <Info size={18} />,
      className: "toast-info",
    },

  }[type];


  return (
    <div
      className={`toast ${config.className}`}
    >

      <div className="toast-icon">
        {config.icon}
      </div>

      <div className="toast-message">
        {message}
      </div>

      <button
        className="toast-close"
        onClick={onClose}
      >
        <X size={15} />
      </button>

    </div>
  );
}
