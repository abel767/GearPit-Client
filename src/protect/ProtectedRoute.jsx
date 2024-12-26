import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  // If not authenticated, redirect to login page
  if (!isAuthenticated) {
    return <Navigate to="/user/login" replace />;
  }

  return <Outlet />;
};

const LoginProtect = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  // If authenticated, redirect to home page or dashboard
  if (isAuthenticated) {
    return <Navigate to="/user/home" replace />;
  }

  return <Outlet />;
};

const AdminProtectRoute = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  // If not authenticated, redirect to admin login
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
};

const AdminProtectRouteLogin = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  // If authenticated, redirect to admin dashboard
  if (isAuthenticated) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Outlet />;
};

export { LoginProtect, ProtectedRoute, AdminProtectRoute, AdminProtectRouteLogin };
