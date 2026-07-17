import { useContext, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import { toast } from 'react-toastify';

function ProtectedRoute({ children, role }) {
  const { user, authChecked } = useContext(AuthContext);

  useEffect(() => {
    if (authChecked && !user) {
      toast.error("Only authorised user can access");
    }
  }, [user, authChecked]);

  if (!authChecked) return <div className="text-center mt-5">Checking access...</div>;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;