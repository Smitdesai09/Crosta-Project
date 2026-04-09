import { useCallback, useEffect, useState } from "react";
import userService from "../services/userService";

export function useUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = useCallback(async (options = {}) => {
    const { showLoader = true } = options;

    if (showLoader) {
      setLoading(true);
    }

    setError(null);

    try {
      const response = await userService.getUsers();
      setUsers(response.data.data || []);
    } catch (err) {
      if (showLoader) {
        setUsers([]);
      }
      setError(err);
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    setUsers,
    loading,
    error,
    refreshUsers: fetchUsers,
  };
}
