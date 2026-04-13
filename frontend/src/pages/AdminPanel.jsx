import { useEffect, useMemo, useRef, useState } from "react";
import RegisterUserForm from "./RegisterUserForm";
import { useAuth } from "../lib/AuthContext";
import { useToast } from "../lib/ToastContext";
import { useUsers } from "../lib/useUsers";
import userService from "../services/userService";

const createInitialRegisterForm = () => ({
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
});

const validateRegisterForm = (form) => {
  const errors = {};

  if (!form.name.trim()) errors.name = "Name is required";
  else if (form.name.trim().length < 2) errors.name = "Name must be at least 2 characters";

  if (!form.email.trim()) errors.email = "Email is required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = "Invalid email format";

  if (!form.password) errors.password = "Password is required";
  else if (form.password.length < 6) errors.password = "Password must be at least 6 characters";

  if (!form.confirmPassword) errors.confirmPassword = "Please confirm your password";
  else if (form.password !== form.confirmPassword) errors.confirmPassword = "Passwords do not match";

  return errors;
};

const ROLE_OPTIONS = [
  { value: "", label: "All Roles" },
  { value: "admin", label: "Admin" },
  { value: "user", label: "User" },
];

const USERS_PER_PAGE = 10;

const STAT_CARDS = [
  {
    key: "total",
    label: "Total Users",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
  },
  {
    key: "user",
    label: "Active Operators",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
  },
  {
    key: "customer",
    label: "Active Customers",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
      </svg>
    ),
  },
];

const getInitials = (name) => {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "U";
};

const AVATAR_COLORS = [
  "bg-rose-100 text-rose-600",
  "bg-sky-100 text-sky-600",
  "bg-amber-100 text-amber-700",
  "bg-emerald-100 text-emerald-700",
  "bg-violet-100 text-violet-600",
  "bg-orange-100 text-orange-700",
  "bg-teal-100 text-teal-700",
  "bg-pink-100 text-pink-700",
];

const getAvatarClass = (name) => {
  const index = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
};

const FilterSelect = ({ value, onChange, options, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selectedLabel = options.find((option) => option.value === value)?.label || placeholder;
  const isActive = value !== "" && value !== undefined;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className={`flex w-full items-center justify-between rounded-lg border px-3 py-3 text-left text-sm transition-colors ${isActive
          ? "border-red-500/30 bg-red-50 font-medium text-red-500"
          : "border-gray-300 bg-white text-gray-500 hover:border-gray-400"
          } focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500`}
      >
        <span className="truncate">{selectedLabel}</span>
        <svg className="ml-2 h-4 w-4 flex-shrink-0 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen ? (
        <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl bg-white shadow-xl">
          <div className="max-h-60 overflow-y-auto py-1">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full px-3 py-2 text-left text-sm transition-colors ${value === option.value
                  ? "bg-red-50 font-medium text-red-500"
                  : "text-gray-900 hover:bg-gray-50"
                  }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
};

const updateUserStatusInList = (users, userId, isDeleted) => {
  return users.map((item) =>
    item._id === userId ? { ...item, isDeleted } : item
  );
};

const UserEditModal = ({ isOpen, form, errors, saving, onClose, onChange, onSubmit }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Edit User</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-5 flex-1">
          <div className="grid gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-900">Full Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(event) => onChange("name", event.target.value)}
                className={`w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 ${errors.name ? "border-red-400" : "border-gray-300"}`}
                placeholder="Enter full name"
              />
              {errors.name ? <p className="mt-1 text-xs text-red-600">{errors.name}</p> : null}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-900">Email Address</label>
              <input
                type="email"
                value={form.email}
                onChange={(event) => onChange("email", event.target.value)}
                className={`w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 ${errors.email ? "border-red-400" : "border-gray-300"}`}
                placeholder="Enter email address"
              />
              {errors.email ? <p className="mt-1 text-xs text-red-600">{errors.email}</p> : null}
            </div>
          </div>

          <div className="mt-5 flex justify-end gap-3 border-t border-gray-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg font-medium text-sm transition-colors bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-lg font-medium text-sm transition-colors bg-red-500 text-white shadow-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const RegisterUserModal = ({ isOpen, form, errors, saving, onClose, onChange, onSubmit }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Register User</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-5 flex-1">
          <RegisterUserForm
            form={form}
            errors={errors}
            isLoading={saving}
            onChange={onChange}
            onSubmit={onSubmit}
            submitLabel="Create User"
            loadingLabel="Creating..."
            showPasswordHints={false}
            passwordGridClassName="md:grid-cols-2"
            submitButtonClassName="bg-red-500 hover:bg-red-600"
          />
        </div>
      </div>
    </div>
  );
};

const DeleteConfirmModal = ({ isOpen, user, deleting, onClose, onConfirm }) => {
  if (!isOpen || !user) return null;

  const isDeletedUser = user.isDeleted;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">
            {isDeletedUser ? "Restore User" : "Delete User"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-5 py-4">
          <div className="rounded-xl p-4 border border-gray-100">
            <p className="text-sm font-medium text-gray-900">{user.name}</p>
            <p className="mt-1 text-sm text-gray-500">{user.email}</p>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-100 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg font-medium text-sm transition-colors bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
              isDeletedUser
                ? "bg-red-600 hover:bg-red-700 focus:ring-red-500/50"
                : "bg-red-600 hover:bg-red-700 focus:ring-red-500"
            }`}
          >
            {deleting ? (isDeletedUser ? "Restoring..." : "Deleting...") : isDeletedUser ? "Restore User" : "Delete User"}
          </button>
        </div>
      </div>
    </div>
  );
};

const AdminPanel = () => {
  const { user: currentUser, checkAuth } = useAuth();
  const currentUserId = currentUser?._id || currentUser?.id;
  const { showToast } = useToast();
  const { users, setUsers, loading, error, refreshUsers } = useUsers();

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [registerForm, setRegisterForm] = useState(createInitialRegisterForm);
  const [registerErrors, setRegisterErrors] = useState({});
  const [isCreating, setIsCreating] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", email: "" });
  const [formErrors, setFormErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [deleteUserTarget, setDeleteUserTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (error) {
      showToast(error.response?.data?.message || "Failed to fetch users", "error");
    }
  }, [error, showToast]);

  const stats = useMemo(() => {
    const total = users.length;
    const userCount = users.filter((item) => item.role === "user" && !item.isDeleted).length;
    return { total, user: userCount, customer: 0 };
  }, [users]);

  const filteredUsers = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    return users.filter((item) => {
      const matchesSearch =
        !normalizedSearch ||
        item.name.toLowerCase().includes(normalizedSearch) ||
        item.email.toLowerCase().includes(normalizedSearch);
      const matchesRole = !roleFilter || item.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [roleFilter, searchTerm, users]);

  const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * USERS_PER_PAGE;
    return filteredUsers.slice(startIndex, startIndex + USERS_PER_PAGE);
  }, [currentPage, filteredUsers]);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, roleFilter]);
  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const openEditModal = (selectedUser) => {
    setEditingUser(selectedUser);
    setEditForm({ name: selectedUser.name, email: selectedUser.email });
    setFormErrors({});
  };

  const closeEditModal = () => { setEditingUser(null); setFormErrors({}); };

  const closeRegisterModal = () => {
    setIsRegisterModalOpen(false);
    setRegisterForm(createInitialRegisterForm());
    setRegisterErrors({});
  };

  const validateForm = () => {
    const errors = {};
    if (!editForm.name.trim()) errors.name = "Name is required";
    else if (editForm.name.trim().length < 2) errors.name = "Name must be at least 2 characters";
    if (!editForm.email.trim()) errors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.email)) errors.email = "Invalid email format";
    return errors;
  };

  const handleEditSubmit = async (event) => {
    event.preventDefault();
    if (!editingUser) return;
    const errors = validateForm();
    if (Object.keys(errors).length > 0) { setFormErrors(errors); return; }

    setIsSaving(true);
    try {
      const isEditingCurrentUser = editingUser._id === currentUserId;
      await userService.updateUser(editingUser._id, {
        name: editForm.name.trim(),
        email: editForm.email.trim(),
      });
      if (isEditingCurrentUser) await checkAuth();
      showToast("User updated successfully", "success");
      closeEditModal();
      await refreshUsers();
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to update user", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteUserTarget) return;
    const targetUser = deleteUserTarget;
    setIsDeleting(true);
    try {
      if (targetUser.isDeleted) {
        await userService.restoreUser(targetUser._id);
        showToast("User restored successfully", "success");
      } else {
        await userService.deleteUser(targetUser._id);
        showToast("User deleted successfully", "success");
      }
      setUsers((currentUsers) => updateUserStatusInList(currentUsers, targetUser._id, !targetUser.isDeleted));
      setDeleteUserTarget(null);
      await refreshUsers({ showLoader: false });
    } catch (error) {
      showToast(
        error.response?.data?.message || (targetUser.isDeleted ? "Failed to restore user" : "Failed to delete user"),
        "error"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRegisterSubmit = async (event) => {
    event.preventDefault();
    const errors = validateRegisterForm(registerForm);
    if (Object.keys(errors).length > 0) { setRegisterErrors(errors); return; }

    setIsCreating(true);
    try {
      await userService.createUser({
        name: registerForm.name.trim(),
        email: registerForm.email.trim(),
        password: registerForm.password,
      });
      showToast("New user registered successfully!", "success");
      closeRegisterModal();
      await refreshUsers();
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to create user", "error");
    } finally {
      setIsCreating(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) setCurrentPage(newPage);
  };

  return (
    <div className="flex h-full min-h-0 w-full flex-col gap-6 p-4 lg:p-6 overflow-hidden">

      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between flex-shrink-0">
        <h1 className="text-3xl font-extrabold italic tracking-tight text-gray-900">
          User Management
        </h1>
        <button
          onClick={() => setIsRegisterModalOpen(true)}
          className="inline-flex items-center gap-2 self-start px-5 py-3 rounded-lg font-medium text-sm transition-colors bg-red-500 text-white shadow-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:ring-offset-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Register User
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 flex-shrink-0">
        {STAT_CARDS.map((card) => (
          <div key={card.key} className="bg-white rounded-xl shadow-sm p-5 min-h-[112px]">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500">
                {card.icon}
              </div>
              <p className="text-base font-semibold text-gray-500">{card.label}</p>
              <p className="ml-auto text-4xl font-bold leading-none text-gray-900">{stats[card.key]}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,2fr)_minmax(220px,1fr)] flex-shrink-0">
        <div className="relative w-full">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by name or email..."
            className={`w-full rounded-lg border bg-white py-3 pl-11 pr-12 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 ${searchTerm ? 'border-red-500/30 bg-red-50 font-medium' : 'border-gray-300'}`}
          />
          {searchTerm ? (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              aria-label="Clear search"
              title="Clear search"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          ) : null}
        </div>

        <FilterSelect
          value={roleFilter}
          onChange={setRoleFilter}
          options={ROLE_OPTIONS}
          placeholder="Select Role"
        />
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl bg-white shadow-sm">
        <div className="grid flex-shrink-0 grid-cols-12 gap-2 bg-red-500 px-6 py-4 text-xs font-bold uppercase tracking-wider text-white">
          <div className="col-span-5">User</div>
          <div className="col-span-2 text-center">Role</div>
          <div className="col-span-2 text-center">Status</div>
          <div className="col-span-3 text-right">Actions</div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <span className="animate-pulse text-gray-400">Loading...</span>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-gray-400">
              <p className="text-lg font-medium text-gray-900">No users found</p>
              <p className="mt-1 text-sm">Try changing the search or role filter.</p>
            </div>
          ) : (
            paginatedUsers.map((item) => {
              const isCurrentUser = currentUserId === item._id;
              const isInactive = item.isDeleted;

              return (
                <div key={item._id} className="grid grid-cols-12 gap-2 px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="col-span-5 flex min-w-0 items-center gap-4">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${getAvatarClass(item.name)}`}>
                      {getInitials(item.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-gray-900">{item.name}</p>
                      <p className="truncate text-sm text-gray-500">{item.email}</p>
                    </div>
                  </div>

                  <div className="col-span-2 flex items-center justify-center">
                    <span className="rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-wide bg-gray-100 text-gray-700">
                      {item.role}
                    </span>
                  </div>

                  <div className="col-span-2 flex items-center justify-center">
                    <span className={`rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-wide ${isInactive ? "bg-red-50 text-red-600" : "bg-green-50 text-green-700"}`}>
                      {isInactive ? "Inactive" : "Active"}
                    </span>
                  </div>

                  <div className="col-span-3 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => openEditModal(item)}
                      className="rounded-lg border border-gray-200 p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
                      title="Edit user"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.5-8.5a2.121 2.121 0 113 3L12 16l-4 1 1-4 8.5-8.5z" />
                      </svg>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeleteUserTarget(item)}
                      disabled={isCurrentUser && !isInactive}
                      className={`rounded-lg border p-2 transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${isInactive
                        ? "border-green-200 text-green-600 hover:bg-green-50"
                        : "border-red-200 text-red-500 hover:bg-red-50"
                        }`}
                      title={isCurrentUser && !isInactive ? "You cannot delete your current account here" : isInactive ? "Restore user" : "Delete user"}
                    >
                      {isInactive ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m14.836 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-14.837-2m14.837 2H15" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3M4 7h16" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {filteredUsers.length > 0 ? (
          <div className="flex flex-shrink-0 items-center justify-between border-t border-gray-100 bg-white px-4 py-3">
            <p className="text-xs text-gray-500">
              Page <span className="font-medium text-gray-900">{currentPage}</span> out of{" "}
              <span className="font-medium text-gray-900">{totalPages}</span>
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 bg-white shadow-sm hover:shadow disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                Prev
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 bg-white shadow-sm hover:shadow disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Next
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <RegisterUserModal
        isOpen={isRegisterModalOpen}
        form={registerForm}
        errors={registerErrors}
        saving={isCreating}
        onClose={closeRegisterModal}
        onChange={(field, value) => {
          setRegisterForm((current) => ({ ...current, [field]: value }));
          setRegisterErrors((current) => ({ ...current, [field]: "" }));
        }}
        onSubmit={handleRegisterSubmit}
      />

      <UserEditModal
        isOpen={Boolean(editingUser)}
        form={editForm}
        errors={formErrors}
        saving={isSaving}
        onClose={closeEditModal}
        onChange={(field, value) => {
          setEditForm((current) => ({ ...current, [field]: value }));
          setFormErrors((current) => ({ ...current, [field]: "" }));
        }}
        onSubmit={handleEditSubmit}
      />

      <DeleteConfirmModal
        isOpen={Boolean(deleteUserTarget)}
        user={deleteUserTarget}
        deleting={isDeleting}
        onClose={() => setDeleteUserTarget(null)}
        onConfirm={handleDeleteUser}
      />
    </div>
  );
};

export default AdminPanel;