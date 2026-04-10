import { useEffect, useMemo, useRef, useState } from "react";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import RegisterUserForm from "../components/user/RegisterUserForm";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useUsers } from "../hooks/useUsers";
import userService from "../services/userService";
import { createInitialRegisterForm, validateRegisterForm } from "../utils/registerUserForm";

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
    iconClass: "bg-emerald-50 text-emerald-600",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5V9H2v11h5m10 0v-1a3 3 0 00-3-3H10a3 3 0 00-3 3v1m10 0H7m8-11a2 2 0 11-4 0 2 2 0 014 0zm-8 2a2 2 0 11-4 0 2 2 0 014 0zm12 0a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    key: "user",
    label: "Active Users",
    iconClass: "bg-blue-50 text-blue-500",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A9 9 0 1118.88 17.8M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    key: "customer",
    label: "Customers",
    iconClass: "bg-amber-50 text-amber-600",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 14l6-6m-5.5-.5h.01M18 11.5v5A2.5 2.5 0 0115.5 19h-8A2.5 2.5 0 015 16.5v-8A2.5 2.5 0 017.5 6h5" />
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

const getAvatarClass = (index) => {
  const styles = [
    "bg-cyan-500 text-surface-white",
    "bg-teal-500 text-surface-white",
    "bg-neutral-500 text-surface-white",
    "bg-violet-500 text-surface-white",
    "bg-emerald-500 text-surface-white",
  ];

  return styles[index % styles.length];
};

const PANEL_BUTTON_HOVER_CLASS =
  "cursor-pointer hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none";

const PANEL_ICON_BUTTON_HOVER_CLASS =
  "cursor-pointer hover:-translate-y-0.5 hover:shadow-sm disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none";

const PANEL_CARD_HOVER_CLASS =
  "transition-all duration-200 hover:-translate-y-1 hover:shadow-lg";

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
        className={`flex w-full items-center justify-between rounded-lg border px-3 py-3 text-left text-sm transition-colors ${
          isActive
            ? "border-brand bg-brand-pale font-semibold text-brand"
            : "border-border-main bg-surface-white text-text-primary hover:border-gray-400"
        } focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand`}
      >
        <span className="truncate">{selectedLabel}</span>
        <svg className="ml-2 h-4 w-4 flex-shrink-0 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen ? (
        <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border border-border-main bg-surface-white shadow-xl">
          <div className="max-h-60 overflow-y-auto py-1">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full px-3 py-2 text-left text-sm transition-colors ${
                  value === option.value
                    ? "bg-brand-pale font-medium text-brand"
                    : "text-text-primary hover:bg-surface-gray"
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
  return users.map((item) => (
    item._id === userId
      ? { ...item, isDeleted }
      : item
  ));
};

const UserEditModal = ({
  isOpen,
  form,
  errors,
  saving,
  onClose,
  onChange,
  onSubmit,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="w-full max-w-xl rounded-xl border border-border-main bg-surface-white shadow-xl">
        <div className="flex items-center justify-between border-b border-border-main px-5 py-4">
          <div>
            <h2 className="text-lg font-bold text-text-primary">Edit User</h2>
           
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`rounded-lg p-2 text-text-secondary transition-all duration-200 hover:bg-surface-gray hover:text-text-primary ${PANEL_ICON_BUTTON_HOVER_CLASS}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-5">
          <div className="grid gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-primary">Full Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(event) => onChange("name", event.target.value)}
                className={`w-full rounded-lg border bg-surface-gray px-3 py-2.5 text-sm text-text-primary outline-none transition-colors placeholder:text-text-placeholder focus:border-brand focus:ring-2 focus:ring-brand/30 ${
                  errors.name ? "border-red-400" : "border-border-main"
                }`}
                placeholder="Enter full name"
              />
              {errors.name ? <p className="mt-1 text-xs text-red-600">{errors.name}</p> : null}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-primary">Email Address</label>
              <input
                type="email"
                value={form.email}
                onChange={(event) => onChange("email", event.target.value)}
                className={`w-full rounded-lg border bg-surface-gray px-3 py-2.5 text-sm text-text-primary outline-none transition-colors placeholder:text-text-placeholder focus:border-brand focus:ring-2 focus:ring-brand/30 ${
                  errors.email ? "border-red-400" : "border-border-main"
                }`}
                placeholder="Enter email address"
              />
              {errors.email ? <p className="mt-1 text-xs text-red-600">{errors.email}</p> : null}
            </div>
          </div>

          <div className="mt-5 flex justify-end gap-3 border-t border-border-main pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className={PANEL_BUTTON_HOVER_CLASS}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={saving}
              className={PANEL_BUTTON_HOVER_CLASS}
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

const RegisterUserModal = ({
  isOpen,
  form,
  errors,
  saving,
  onClose,
  onChange,
  onSubmit,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="w-full max-w-xl rounded-xl border border-border-main bg-surface-white shadow-xl">
        <div className="flex items-center justify-between border-b border-border-main px-5 py-4">
          <div>
            <h2 className="text-lg font-bold text-text-primary">Register User</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`rounded-lg p-2 text-text-secondary transition-all duration-200 hover:bg-surface-gray hover:text-text-primary ${PANEL_ICON_BUTTON_HOVER_CLASS}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-5">
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
            submitButtonClassName={`bg-emerald-500 hover:bg-emerald-600 ${PANEL_BUTTON_HOVER_CLASS}`}
          />

          <div className="mt-5 flex justify-end gap-3 border-t border-border-main pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className={PANEL_BUTTON_HOVER_CLASS}
            >
              Cancel
            </Button>
          </div>
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
      <div className="w-full max-w-md rounded-xl border border-border-main bg-surface-white shadow-xl">
        <div className="border-b border-border-main px-5 py-4">
          <h2 className="text-lg font-bold text-text-primary">
            {isDeletedUser ? "Restore User" : "Delete User"}
          </h2>
        </div>

        <div className="px-5 py-4">
          <div
            className={`rounded-xl p-4 ${
              isDeletedUser ? "border border-emerald-100 bg-emerald-50" : "border border-red-100 bg-red-50"
            }`}
          >
            <p className="text-sm font-medium text-text-primary">{user.name}</p>
            <p className="mt-1 text-sm text-text-secondary">{user.email}</p>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-border-main px-5 py-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className={PANEL_BUTTON_HOVER_CLASS}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant={isDeletedUser ? "success" : "danger"}
            onClick={onConfirm}
            disabled={deleting}
            className={PANEL_BUTTON_HOVER_CLASS}
          >
            {deleting ? (isDeletedUser ? "Restoring..." : "Deleting...") : isDeletedUser ? "Restore User" : "Delete User"}
          </Button>
        </div>
      </div>
    </div>
  );
};

const AdminPanel = () => {
  const { user: currentUser } = useAuth();
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

    return {
      total,
      user: userCount,
      customer: 0,
    };
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

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter]);

  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const openEditModal = (selectedUser) => {
    setEditingUser(selectedUser);
    setEditForm({
      name: selectedUser.name,
      email: selectedUser.email,
    });
    setFormErrors({});
  };

  const closeEditModal = () => {
    setEditingUser(null);
    setFormErrors({});
  };

  const closeRegisterModal = () => {
    setIsRegisterModalOpen(false);
    setRegisterForm(createInitialRegisterForm());
    setRegisterErrors({});
  };

  const validateForm = () => {
    const errors = {};

    if (!editForm.name.trim()) {
      errors.name = "Name is required";
    } else if (editForm.name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters";
    }

    if (!editForm.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.email)) {
      errors.email = "Invalid email format";
    }

    return errors;
  };

  const handleEditSubmit = async (event) => {
    event.preventDefault();

    if (!editingUser) return;

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSaving(true);

    try {
      await userService.updateUser(editingUser._id, {
        name: editForm.name.trim(),
        email: editForm.email.trim(),
      });

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

      setUsers((currentUsers) =>
        updateUserStatusInList(currentUsers, targetUser._id, !targetUser.isDeleted)
      );
      setDeleteUserTarget(null);
      await refreshUsers({ showLoader: false });
    } catch (error) {
      showToast(
        error.response?.data?.message ||
          (targetUser.isDeleted ? "Failed to restore user" : "Failed to delete user"),
        "error"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRegisterSubmit = async (event) => {
    event.preventDefault();

    const errors = validateRegisterForm(registerForm);
    if (Object.keys(errors).length > 0) {
      setRegisterErrors(errors);
      return;
    }

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
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="h-full w-full bg-surface-gray">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">
              User <span className="text-brand">Management</span>
            </h1>
          </div>

          <Button
            variant="success"
            className={`inline-flex items-center gap-2 self-start px-5 py-3 ${PANEL_BUTTON_HOVER_CLASS}`}
            onClick={() => setIsRegisterModalOpen(true)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Register User
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {STAT_CARDS.map((card) => (
            <Card key={card.key} className={`min-h-[112px] ${PANEL_CARD_HOVER_CLASS}`}>
              <div className="flex items-center gap-4">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${card.iconClass}`}>
                  {card.icon}
                </div>
                <p className="text-base font-semibold text-text-secondary">{card.label}</p>
                <p className="ml-auto text-4xl font-bold leading-none text-text-primary">{stats[card.key]}</p>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,2fr)_minmax(220px,1fr)]">
          <div className="relative w-full">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by name or email..."
              className="w-full rounded-lg border border-border-main bg-surface-white py-3 pl-11 pr-12 text-sm text-text-primary outline-none transition-colors placeholder:text-text-placeholder focus:border-brand focus:ring-2 focus:ring-brand/30"
            />
            {searchTerm ? (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-surface-gray hover:text-text-primary"
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

        <div className="overflow-hidden rounded-xl border border-border-main bg-surface-white shadow-sm">
          <div className="grid grid-cols-12 gap-2 border-b border-border-main bg-surface-gray px-6 py-4 text-xs font-semibold uppercase tracking-wider text-text-secondary">
            <div className="col-span-5">User</div>
            <div className="col-span-2 text-center">Role</div>
            <div className="col-span-2 text-center">Status</div>
            <div className="col-span-3 text-right">Actions</div>
          </div>

          <div className="divide-y divide-border-main">
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <span className="animate-pulse text-text-secondary">Loading...</span>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-text-secondary">
                <p className="text-lg font-medium">No users found</p>
                <p className="mt-1 text-sm">Try changing the search or role filter.</p>
              </div>
            ) : (
              paginatedUsers.map((item, index) => {
                const isCurrentUser = currentUser?.email === item.email;
                const avatarIndex = (currentPage - 1) * USERS_PER_PAGE + index;
                const isInactive = item.isDeleted;

                return (
                  <div key={item._id} className="grid grid-cols-12 gap-2 px-6 py-4">
                    <div className="col-span-5 flex min-w-0 items-center gap-4">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${getAvatarClass(avatarIndex)}`}>
                        {getInitials(item.name)}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-text-primary">{item.name}</p>
                        <p className="truncate text-sm text-text-secondary">{item.email}</p>
                      </div>
                    </div>

                    <div className="col-span-2 flex items-center justify-center">
                      <span
                        className={`rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-wide ${
                          item.role === "admin"
                            ? "bg-violet-50 text-violet-700"
                            : "bg-sky-50 text-sky-700"
                        }`}
                      >
                        {item.role}
                      </span>
                    </div>

                    <div className="col-span-2 flex items-center justify-center">
                      <span
                        className={`rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-wide ${
                          isInactive
                            ? "bg-red-50 text-red-600"
                            : "bg-emerald-50 text-emerald-600"
                        }`}
                      >
                        {isInactive ? "Inactive" : "Active"}
                      </span>
                    </div>

                    <div className="col-span-3 flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(item)}
                        className={`rounded-lg border border-border-main p-2 text-text-secondary transition-all duration-200 hover:bg-surface-gray hover:text-text-primary ${PANEL_ICON_BUTTON_HOVER_CLASS}`}
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
                        className={`rounded-lg border p-2 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40 ${
                          isInactive
                            ? "border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                            : "border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600"
                        } ${PANEL_ICON_BUTTON_HOVER_CLASS}`}
                        title={
                          isCurrentUser && !isInactive
                            ? "You cannot delete your current account here"
                            : isInactive
                              ? "Restore user"
                              : "Delete user"
                        }
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
            <div className="flex items-center justify-between border-t border-border-main bg-surface-gray px-4 py-3">
              <p className="text-xs text-text-secondary">
                Page <span className="font-medium text-text-primary">{currentPage}</span> out of{" "}
                <span className="font-medium text-text-primary">{totalPages}</span>
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`flex items-center gap-1 rounded-lg border border-border-main px-3 py-1.5 text-sm font-medium text-text-secondary transition-all duration-200 hover:bg-surface-white disabled:cursor-not-allowed disabled:opacity-40 ${PANEL_BUTTON_HOVER_CLASS}`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                  Prev
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`flex items-center gap-1 rounded-lg border border-border-main px-3 py-1.5 text-sm font-medium text-text-secondary transition-all duration-200 hover:bg-surface-white disabled:cursor-not-allowed disabled:opacity-40 ${PANEL_BUTTON_HOVER_CLASS}`}
                >
                  Next
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          ) : null}
        </div>
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