import { useAuth } from "../context/AuthContext";

export const usePermissions = () => {
  const { user } = useAuth();

  return {
    VIEW_ANALYTICS: user?.role === "admin",
    VIEW_ADMIN_PANEL: user?.role === "admin",
    CAN_REGISTER_USER: user?.role === "admin", 
  };
};
