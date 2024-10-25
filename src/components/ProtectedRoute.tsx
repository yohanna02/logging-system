import { ReactNode, useContext } from "react";
import { Navigate } from "react-router-dom";
import { LoginContext } from "../context/LoginContext";

interface ProtectedRouteProps {
  redirectPath?: string;
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { loginedIn } = useContext(LoginContext);

  if (!loginedIn) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
