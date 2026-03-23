import type { ReactNode } from "react";

/** Barcha ichki sahifalar uchun bir xil fon va pastki navigatsiya bo‘shlig‘i */
export function AppPage({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`app-page ${className}`.trim()}>{children}</div>;
}
