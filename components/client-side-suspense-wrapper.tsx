"use client";
import { Suspense, ReactNode } from "react";

interface ClientSideSuspenseWrapperProps {
  children: ReactNode;
  fallback: ReactNode;
}

export function ClientSideSuspenseWrapper({
  children,
  fallback,
}: ClientSideSuspenseWrapperProps) {
  return <Suspense fallback={fallback}>{children}</Suspense>;
}
