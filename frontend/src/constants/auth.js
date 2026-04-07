export const user = {
  name: "John Doe",
  email: "john.doe@restaurant.com",
  role: "admin", // Change to "staff" to hide admin routes
};

export const PERMISSIONS = {
  VIEW_ANALYTICS: user.role === "admin",
  VIEW_ADMIN_PANEL: user.role === "admin",
};