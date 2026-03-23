import { Navigate, Outlet } from "react-router-dom";

/**
 * Himoyalangan route — token bo'lmasa login sahifasiga yo'naltiradi.
 * Ishlatish: <Route element={<PrivateRoute />}> ... </Route>
 */
export default function PrivateRoute() {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}
