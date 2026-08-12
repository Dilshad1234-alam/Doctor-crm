"use client";

import { AuthProvider } from "@/frontend/context/AuthContext";
import { SidebarProvider } from "@/frontend/context/SidebarContext";

export default function AppProviders({ children }) {
  return (
    <AuthProvider>
      <SidebarProvider>
        {children}
      </SidebarProvider>
    </AuthProvider>
  );
}
