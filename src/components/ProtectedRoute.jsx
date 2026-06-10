import { Navigate } from "react-router-dom";
import { getCookie } from "../utils/cookies";

export default function ProtectedRoute({ children, role }) {
  const isLoggedIn = Boolean(getCookie("session"));
  const userRole = getCookie("role");

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (role && userRole !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
}