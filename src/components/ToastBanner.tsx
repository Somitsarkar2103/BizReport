import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface ToastBannerProps {
  message: string | null;
}

export const ToastBanner: React.FC<ToastBannerProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 rounded-xl obsidian-glass px-4 py-3 text-sm text-[#F8FAFC]"
    >
      <CheckCircle2 className="h-4 w-4 text-[#23C8B5] shrink-0" />
      <span>{message}</span>
    </div>
  );
};
