import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { PageLoader } from "../ui/page-loader";
import { apiRequest } from "../../lib/api";

export default function RequireAuth() {
  const location = useLocation();
  const token = localStorage.getItem("admin_token");
  const [isValidating, setIsValidating] = useState(!!token);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    if (!token) {
      setIsValidating(false);
      return;
    }

    // Validate token by making a test request
    apiRequest('/me/')
      .then(() => {
        setIsValid(true);
      })
      .catch(() => {
        setIsValid(false);
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_refresh_token");
      })
      .finally(() => {
        setIsValidating(false);
      });
  }, [token]);

  if (isValidating) {
    return <PageLoader message="Validating admin session..." />;
  }

  if (!token || !isValid) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
