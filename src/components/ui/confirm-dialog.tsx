"use client";
import { useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
}

export function ConfirmDialog({ isOpen, onClose, onConfirm, title, description }: ConfirmDialogProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (isOpen) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-[20px] shadow-[0_24px_64px_rgba(0,0,0,0.25)] p-6 w-full max-w-sm mx-4 z-10 animate-in fade-in zoom-in-95 duration-200 flex flex-col gap-4">
        
        <div className="flex items-start gap-4">
          <div className="p-2.5 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex-shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-1 mt-1">
            <h3 className="font-semibold text-[16px] text-foreground leading-tight">{title}</h3>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        <div className="flex gap-3 pt-2 mt-2">
          <button 
            type="button" 
            onClick={onClose}
            className="flex-1 py-2.5 border border-border rounded-[12px] text-[13px] font-medium hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button 
            type="button" 
            onClick={() => onConfirm()}
            className="flex-1 py-2.5 bg-red-500 text-white rounded-[12px] text-[13px] font-medium hover:bg-red-600 hover:brightness-110 transition-all shadow-sm"
          >
            Confirm
          </button>
        </div>

      </div>
    </div>
  );
}
