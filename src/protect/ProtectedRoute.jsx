import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  const { isAuthenticated, isLoading, user } = useSelector((state) => state.user);
  
  // Debug logs
  console.log('Protected Route State:', { isAuthenticated, isLoading, user });

  // Show loading state
  if (isLoading) {
    return <div>Loading...</div>; // Or your loading component
  }

  // Check both authentication and user data
  if (!isAuthenticated || !user) {
    console.log('Redirecting to login - Not authenticated');
    return <Navigate to="/user/login" replace />;
  }

  return <Outlet />;
};

const LoginProtect = () => {
  const { isAuthenticated, isLoading, user } = useSelector((state) => state.user);

  // Debug logs
  console.log('Login Protect State:', { isAuthenticated, isLoading, user });

  // Show loading state
  if (isLoading) {
    return <div>Loading...</div>; // Or your loading component
  }

  // If authenticated and has user data, redirect to home
  if (isAuthenticated && user) {
    console.log('Redirecting to home - Already authenticated');
    return <Navigate to="/user/home" replace />;
  }

  return <Outlet />;
};

const AdminProtectRoute = () => {
  const { isAuthenticated, isLoading, user } = useSelector((state) => state.admin);

  // Debug logs
  console.log('Admin Protected Route State:', { isAuthenticated, isLoading, user });

  if (isLoading) {
    return <div>Loading...</div>; // Or your loading component
  }

  if (!isAuthenticated || !user) {
    console.log('Redirecting to admin login - Not authenticated');
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
};

const AdminProtectRouteLogin = () => {
  const { isAuthenticated, isLoading, user } = useSelector((state) => state.admin);

  // Debug logs
  console.log('Admin Login Protect State:', { isAuthenticated, isLoading, user });

  if (isLoading) {
    return <div>Loading...</div>; // Or your loading component
  }

  if (isAuthenticated && user) {
    console.log('Redirecting to dashboard - Already authenticated');
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Outlet />;
};

export { LoginProtect, ProtectedRoute, AdminProtectRoute, AdminProtectRouteLogin };