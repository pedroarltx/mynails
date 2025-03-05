// protected-route.tsx
"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../lib/useAuth";

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log("Estado do usuário:", user); // Log para depuração
    console.log("Carregando:", loading); // Log para depuração

    if (!loading && !user) {
      console.log("Usuário não autenticado. Redirecionando para /login..."); // Log para depuração
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return <p>Carregando...</p>;
  }

  return user ? <>{children}</> : null;
}