import { useCallback, useEffect, useMemo, useState } from "react";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import productService from "../services/productService";

const PRODUCT_STATS = [
  {
    key: "total",
    label: "Total Products",
    iconClass: "bg-emerald-50 text-emerald-600",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V7a2 2 0 00-2-2h-3V3H9v2H6a2 2 0 00-2 2v6m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0H4m5 4h6" />
      </svg>
    ),
  },
  {
    key: "available",
    label: "Available",
    iconClass: "bg-blue-50 text-blue-500",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
      </svg>
    ),
  },
  {
    key: "unavailable",
    label: "Unavailable",
    iconClass: "bg-amber-50 text-amber-600",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
  },
];

const PRODUCT_CARD_HOVER_CLASS =
  "transition-all duration-200 hover:-translate-y-1 hover:shadow-lg";

const PRODUCT_ACTION_BUTTON_CLASS =
  "cursor-pointer hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none";

const PRODUCT_SKELETON_COUNT = 6;
const PRODUCT_SKELETON_VARIANT_COUNT = 3;

const createInitialProductForm = () => ({
  name: "",
  category: "",
  isAvailable: true,
  variants: [{ name: "", price: "" }],
});

const createInitialProductErrors = (variantCount = 1) => ({
  name: "",
  category: "",
  variants: Array.from({ length: variantCount }, () => ({ name: "", price: "" })),
});

const formatCategory = (value = "") => {
  return value
    .split(/[\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);
};

const SkeletonBlock = ({ className = "" }) => (
  <div aria-hidden="true" className={`animate-pulse rounded-lg bg-surface-gray ${className}`} />
);

const ProductStatsSkeleton = () => (
  <>
    {PRODUCT_STATS.map((card) => (
      <Card key={`product-stat-skeleton-${card.key}`} className={`min-h-[160px] ${PRODUCT_CARD_HOVER_CLASS}`}>
        <SkeletonBlock className="mb-6 h-12 w-12 rounded-xl" />
        <SkeletonBlock className="h-10 w-20" />
        <SkeletonBlock className="mt-3 h-4 w-28" />
      </Card>
    ))}
  </>
);

const ProductFiltersSkeleton = () => (
  <div className="flex flex-col gap-3 md:flex-row md:items-center">
    <SkeletonBlock className="h-12 w-full md:max-w-md" />
    <SkeletonBlock className="h-12 w-full md:w-56" />
  </div>
);

const ProductCardSkeleton = ({ showActions }) => (
  <Card className={`pointer-events-none ${PRODUCT_CARD_HOVER_CLASS}`}>
    <div className="flex items-start justify-between gap-3">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <SkeletonBlock className="h-6 w-32" />
          <SkeletonBlock className="h-5 w-20 rounded-full" />
        </div>
        <SkeletonBlock className="mt-3 h-4 w-40" />
      </div>

      <div className="rounded-xl bg-brand-pale/50 px-3 py-2">
        <SkeletonBlock className="h-3 w-16 bg-brand/10" />
        <SkeletonBlock className="mt-2 h-4 w-20 bg-brand/15" />
      </div>
    </div>

    <div className="mt-5 grid gap-2">
      {Array.from({ length: PRODUCT_SKELETON_VARIANT_COUNT }, (_, index) => (
        <div
          key={`product-variant-skeleton-${index}`}
          className="flex items-center justify-between rounded-xl border border-border-main bg-surface-gray px-4 py-3"
        >
          <div>
            <SkeletonBlock className="h-4 w-24" />
            <SkeletonBlock className="mt-2 h-3 w-16" />
          </div>
          <SkeletonBlock className="h-4 w-14" />
        </div>
      ))}
    </div>

    {showActions ? (
      <div className="mt-5 flex gap-3 border-t border-border-main pt-4">
        <SkeletonBlock className="h-10 flex-1" />
        <SkeletonBlock className="h-10 flex-1" />
      </div>
    ) : null}
  </Card>
);

const ProductFormModal = ({
  isOpen,
  mode,
  form,
  errors,
  saving,
  onClose,
  onChange,
  onVariantChange,
  onAddVariant,
  onRemoveVariant,
  onSubmit,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl border border-border-main bg-surface-white shadow-xl">
        <div className="flex items-start justify-between border-b border-border-main px-5 py-4">
          <div>
            <h2 className="text-lg font-bold text-text-primary">
              {mode === "edit" ? "Update Product" : "Add New Product"}
            </h2>
            <p className="mt-1 text-sm text-text-secondary">
              {mode === "edit"
                ? "Update product details, variants and availability."
                : "Create a new product that only admins can manage."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-lg p-2 text-text-secondary transition-all duration-200 hover:bg-surface-gray hover:text-text-primary"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-primary">Product Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(event) => onChange("name", event.target.value)}
                placeholder="Enter product name"
                className={`w-full rounded-lg border bg-surface-gray px-3 py-2.5 text-sm text-text-primary outline-none transition-colors placeholder:text-text-placeholder focus:border-brand focus:ring-2 focus:ring-brand/30 ${
                  errors.name ? "border-red-400" : "border-border-main"
                }`}
              />
              {errors.name ? <p className="mt-1 text-xs text-red-600">{errors.name}</p> : null}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-primary">Category</label>
              <input
                type="text"
                value={form.category}
                onChange={(event) => onChange("category", event.target.value)}
                placeholder="e.g. pizza, beverage"
                className={`w-full rounded-lg border bg-surface-gray px-3 py-2.5 text-sm text-text-primary outline-none transition-colors placeholder:text-text-placeholder focus:border-brand focus:ring-2 focus:ring-brand/30 ${
                  errors.category ? "border-red-400" : "border-border-main"
                }`}
              />
              {errors.category ? <p className="mt-1 text-xs text-red-600">{errors.category}</p> : null}
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-border-main bg-surface-gray/40 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-text-primary">Variants</h3>
                <p className="text-xs text-text-secondary">Add at least one size or variant with a price.</p>
              </div>

              <Button
                type="button"
                variant="secondary"
                className={PRODUCT_ACTION_BUTTON_CLASS}
                onClick={onAddVariant}
              >
                Add Variant
              </Button>
            </div>

            <div className="grid gap-3">
              {form.variants.map((variant, index) => (
                <div
                  key={`variant-${index}`}
                  className="grid gap-3 rounded-xl border border-border-main bg-surface-white p-3 md:grid-cols-[1fr_180px_auto]"
                >
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-secondary">
                      Variant Name
                    </label>
                    <input
                      type="text"
                      value={variant.name}
                      onChange={(event) => onVariantChange(index, "name", event.target.value)}
                      placeholder="Regular, Medium, Large"
                      className={`w-full rounded-lg border bg-surface-gray px-3 py-2.5 text-sm text-text-primary outline-none transition-colors placeholder:text-text-placeholder focus:border-brand focus:ring-2 focus:ring-brand/30 ${
                        errors.variants[index]?.name ? "border-red-400" : "border-border-main"
                      }`}
                    />
                    {errors.variants[index]?.name ? (
                      <p className="mt-1 text-xs text-red-600">{errors.variants[index].name}</p>
                    ) : null}
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-secondary">
                      Price
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={variant.price}
                      onChange={(event) => onVariantChange(index, "price", event.target.value)}
                      placeholder="0.00"
                      className={`w-full rounded-lg border bg-surface-gray px-3 py-2.5 text-sm text-text-primary outline-none transition-colors placeholder:text-text-placeholder focus:border-brand focus:ring-2 focus:ring-brand/30 ${
                        errors.variants[index]?.price ? "border-red-400" : "border-border-main"
                      }`}
                    />
                    {errors.variants[index]?.price ? (
                      <p className="mt-1 text-xs text-red-600">{errors.variants[index].price}</p>
                    ) : null}
                  </div>

                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="danger"
                      className={`w-full ${PRODUCT_ACTION_BUTTON_CLASS}`}
                      onClick={() => onRemoveVariant(index)}
                      disabled={form.variants.length === 1}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <label className="mt-4 flex items-center gap-3 rounded-xl border border-border-main bg-surface-gray/40 px-4 py-3">
            <input
              type="checkbox"
              checked={form.isAvailable}
              onChange={(event) => onChange("isAvailable", event.target.checked)}
              className="h-4 w-4 rounded border-border-main text-brand focus:ring-brand/30"
            />
            <div>
              <p className="text-sm font-medium text-text-primary">Available for sale</p>
              <p className="text-xs text-text-secondary">
                Turn this off to hide the product from operators and other users.
              </p>
            </div>
          </label>

          <div className="mt-5 flex justify-end gap-3 border-t border-border-main pt-4">
            <Button
              type="button"
              variant="secondary"
              className={PRODUCT_ACTION_BUTTON_CLASS}
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className={PRODUCT_ACTION_BUTTON_CLASS}
              disabled={saving}
            >
              {saving ? "Saving..." : mode === "edit" ? "Update Product" : "Create Product"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ProductStatusModal = ({ isOpen, product, deleting, onClose, onConfirm }) => {
  if (!isOpen || !product) return null;

  const isUnavailable = !product.isAvailable;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl border border-border-main bg-surface-white shadow-xl">
        <div className="border-b border-border-main px-5 py-4">
          <h2 className="text-lg font-bold text-text-primary">
            {isUnavailable ? "Restore Product" : "Delete Product"}
          </h2>
          <p className="mt-1 text-sm text-text-secondary">
            {isUnavailable
              ? "This will make the product visible again for operators and other users."
              : "This will hide the product from operators and other users."}
          </p>
        </div>

        <div className="px-5 py-4">
          <div
            className={`rounded-xl border p-4 ${
              isUnavailable ? "border-emerald-100 bg-emerald-50" : "border-red-100 bg-red-50"
            }`}
          >
            <p className="text-sm font-semibold text-text-primary">{product.name}</p>
            <p className="mt-1 text-sm text-text-secondary">{formatCategory(product.category)}</p>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-border-main px-5 py-4">
          <Button
            type="button"
            variant="secondary"
            className={PRODUCT_ACTION_BUTTON_CLASS}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant={isUnavailable ? "success" : "danger"}
            className={PRODUCT_ACTION_BUTTON_CLASS}
            onClick={onConfirm}
            disabled={deleting}
          >
            {deleting ? (isUnavailable ? "Restoring..." : "Deleting...") : isUnavailable ? "Restore Product" : "Delete Product"}
          </Button>
        </div>
      </div>
    </div>
  );
};

const ProductManagement = () => {
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const isAdmin = user?.role === "admin";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState("create");
  const [productForm, setProductForm] = useState(createInitialProductForm());
  const [formErrors, setFormErrors] = useState(createInitialProductErrors());
  const [isSaving, setIsSaving] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const isPageLoading = authLoading || loading;

  const fetchProducts = useCallback(async () => {
    if (!user) return;

    setLoading(true);

    try {
      const response = isAdmin
        ? await productService.getAllProductsAdmin()
        : await productService.getAvailableProducts();

      setProducts(response.data.data || []);
    } catch (error) {
      setProducts([]);
      showToast(error.response?.data?.message || "Failed to load products", "error");
    } finally {
      setLoading(false);
    }
  }, [isAdmin, showToast, user]);

  useEffect(() => {
    if (authLoading) return;
    fetchProducts();
  }, [authLoading, fetchProducts]);

  const categoryOptions = useMemo(() => {
    return [...new Set(products.map((product) => product.category))].sort((a, b) => a.localeCompare(b));
  }, [products]);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return products.filter((product) => {
      const matchesCategory = !categoryFilter || product.category === categoryFilter;
      const matchesSearch =
        !normalizedSearch ||
        product.name.toLowerCase().includes(normalizedSearch) ||
        product.category.toLowerCase().includes(normalizedSearch) ||
        product.variants.some((variant) => variant.name.toLowerCase().includes(normalizedSearch));

      return matchesCategory && matchesSearch;
    });
  }, [categoryFilter, products, searchTerm]);

  const stats = useMemo(() => {
    return {
      total: products.length,
      available: products.filter((product) => product.isAvailable).length,
      unavailable: products.filter((product) => !product.isAvailable).length,
    };
  }, [products]);

  const resetProductForm = () => {
    setProductForm(createInitialProductForm());
    setFormErrors(createInitialProductErrors());
  };

  const validateProductForm = () => {
    const nextErrors = createInitialProductErrors(productForm.variants.length);

    if (!productForm.name.trim()) {
      nextErrors.name = "Product name is required";
    }

    if (!productForm.category.trim()) {
      nextErrors.category = "Category is required";
    }

    productForm.variants.forEach((variant, index) => {
      if (!variant.name.trim()) {
        nextErrors.variants[index].name = "Variant name is required";
      }

      if (variant.price === "" || Number.isNaN(Number(variant.price)) || Number(variant.price) < 0) {
        nextErrors.variants[index].price = "Enter a valid price";
      }
    });

    setFormErrors(nextErrors);

    return (
      !nextErrors.name &&
      !nextErrors.category &&
      nextErrors.variants.every((variant) => !variant.name && !variant.price)
    );
  };

  const openCreateModal = () => {
    setFormMode("create");
    setSelectedProduct(null);
    resetProductForm();
    setIsFormModalOpen(true);
  };

  const openEditModal = (product) => {
    setFormMode("edit");
    setSelectedProduct(product);
    setProductForm({
      name: product.name,
      category: product.category,
      isAvailable: product.isAvailable,
      variants: product.variants.map((variant) => ({
        name: variant.name,
        price: String(variant.price),
      })),
    });
    setFormErrors(createInitialProductErrors(product.variants.length));
    setIsFormModalOpen(true);
  };

  const closeFormModal = () => {
    setIsFormModalOpen(false);
    setSelectedProduct(null);
    resetProductForm();
  };

  const handleFormChange = (field, value) => {
    setProductForm((current) => ({ ...current, [field]: value }));
    setFormErrors((current) => ({ ...current, [field]: "" }));
  };

  const handleVariantChange = (index, field, value) => {
    setProductForm((current) => ({
      ...current,
      variants: current.variants.map((variant, currentIndex) => (
        currentIndex === index ? { ...variant, [field]: value } : variant
      )),
    }));

    setFormErrors((current) => ({
      ...current,
      variants: current.variants.map((variant, currentIndex) => (
        currentIndex === index ? { ...variant, [field]: "" } : variant
      )),
    }));
  };

  const handleAddVariant = () => {
    setProductForm((current) => ({
      ...current,
      variants: [...current.variants, { name: "", price: "" }],
    }));
    setFormErrors((current) => ({
      ...current,
      variants: [...current.variants, { name: "", price: "" }],
    }));
  };

  const handleRemoveVariant = (index) => {
    if (productForm.variants.length === 1) return;

    setProductForm((current) => ({
      ...current,
      variants: current.variants.filter((_, currentIndex) => currentIndex !== index),
    }));
    setFormErrors((current) => ({
      ...current,
      variants: current.variants.filter((_, currentIndex) => currentIndex !== index),
    }));
  };

  const handleProductSubmit = async (event) => {
    event.preventDefault();

    if (!validateProductForm()) return;

    const payload = {
      name: productForm.name.trim(),
      category: productForm.category.trim(),
      isAvailable: productForm.isAvailable,
      variants: productForm.variants.map((variant) => ({
        name: variant.name.trim(),
        price: Number(variant.price),
      })),
    };

    setIsSaving(true);

    try {
      if (formMode === "edit" && selectedProduct) {
        await productService.updateProduct(selectedProduct._id, payload);
        showToast("Product updated successfully", "success");
      } else {
        await productService.createProduct(payload);
        showToast("Product created successfully", "success");
      }

      closeFormModal();
      await fetchProducts();
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to save product", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const openStatusModal = (product) => {
    setSelectedProduct(product);
    setIsStatusModalOpen(true);
  };

  const closeStatusModal = () => {
    setSelectedProduct(null);
    setIsStatusModalOpen(false);
  };

  const handleStatusChange = async () => {
    if (!selectedProduct) return;

    setIsDeleting(true);

    try {
      if (selectedProduct.isAvailable) {
        await productService.deleteProduct(selectedProduct._id);
        showToast("Product deleted successfully", "success");
      } else {
        await productService.restoreProduct(selectedProduct._id);
        showToast("Product restored successfully", "success");
      }

      closeStatusModal();
      await fetchProducts();
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to update product status", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="h-full w-full bg-surface-gray">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-text-primary">
                Product <span className="text-brand">Management</span>
              </h1>
              <span className="rounded-full bg-brand-pale px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand">
                {isAdmin ? "Admin View" : "Operator View"}
              </span>
            </div>
            <p className="mt-1 text-sm text-text-secondary">
              {isAdmin
                ? "Admins can add, update, delete and restore products from the live catalog."
                : "Browse only the products that are currently available for sale."}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              variant="secondary"
              className={`inline-flex items-center gap-2 self-start px-5 py-3 ${PRODUCT_ACTION_BUTTON_CLASS}`}
              onClick={() => {
                setSearchTerm("");
                setCategoryFilter("");
              }}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m14.836 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-14.837-2m14.837 2H15" />
              </svg>
              Reset Filters
            </Button>

            {isAdmin ? (
              <Button
                type="button"
                variant="success"
                className={`inline-flex items-center gap-2 self-start px-5 py-3 ${PRODUCT_ACTION_BUTTON_CLASS}`}
                onClick={openCreateModal}
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Add Product
              </Button>
            ) : null}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {isPageLoading ? (
            <ProductStatsSkeleton />
          ) : (
            PRODUCT_STATS.map((card) => (
              <Card key={card.key} className={`min-h-[160px] ${PRODUCT_CARD_HOVER_CLASS}`}>
                <div className={`mb-6 flex h-12 w-12 items-center justify-center rounded-xl ${card.iconClass}`}>
                  {card.icon}
                </div>
                <p className="text-4xl font-bold leading-none text-text-primary">{stats[card.key]}</p>
                <p className="mt-2 text-sm text-text-secondary">{card.label}</p>
              </Card>
            ))
          )}
        </div>

        {isPageLoading ? (
          <ProductFiltersSkeleton />
        ) : (
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative w-full md:max-w-md">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by product, category or variant..."
                className="w-full rounded-lg border border-border-main bg-surface-white py-3 pl-11 pr-4 text-sm text-text-primary outline-none transition-colors placeholder:text-text-placeholder focus:border-brand focus:ring-2 focus:ring-brand/30"
              />
            </div>

            <div className="relative w-full md:w-56">
              <select
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
                className="w-full cursor-pointer appearance-none rounded-lg border border-border-main bg-surface-white px-4 py-3 pr-10 text-sm font-medium text-text-primary outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/30"
              >
                <option value="">All Categories</option>
                {categoryOptions.map((category) => (
                  <option key={category} value={category}>
                    {formatCategory(category)}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {isPageLoading ? (
            Array.from({ length: PRODUCT_SKELETON_COUNT }, (_, index) => (
              <ProductCardSkeleton
                key={`product-card-skeleton-${index}`}
                showActions={isAdmin}
              />
            ))
          ) : filteredProducts.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center rounded-xl border border-border-main bg-surface-white py-16 text-text-secondary shadow-sm">
              <p className="text-lg font-medium text-text-primary">No products found</p>
              <p className="mt-1 text-sm">Try changing the search text or category filter.</p>
            </div>
          ) : (
            filteredProducts.map((product) => {
              const sortedVariants = [...product.variants].sort((first, second) => first.price - second.price);
              const lowestPrice = sortedVariants[0]?.price || 0;

              return (
                <Card key={product._id} className={PRODUCT_CARD_HOVER_CLASS}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-bold text-text-primary">{product.name}</h2>
                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${
                            product.isAvailable
                              ? "bg-emerald-50 text-emerald-600"
                              : "bg-red-50 text-red-600"
                          }`}
                        >
                          {product.isAvailable ? "Available" : "Unavailable"}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-text-secondary">
                        Category: <span className="font-medium text-text-primary">{formatCategory(product.category)}</span>
                      </p>
                    </div>

                    <div className="rounded-xl bg-brand-pale px-3 py-2 text-right">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-brand">Starting At</p>
                      <p className="text-sm font-bold text-brand">{formatCurrency(lowestPrice)}</p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-2">
                    {sortedVariants.map((variant) => (
                      <div
                        key={`${product._id}-${variant.name}`}
                        className="flex items-center justify-between rounded-xl border border-border-main bg-surface-gray px-4 py-3 transition-colors hover:border-brand/40 hover:bg-brand-pale/40"
                      >
                        <div>
                          <p className="text-sm font-semibold text-text-primary">{variant.name}</p>
                          <p className="text-xs text-text-secondary">Variant option</p>
                        </div>
                        <span className="text-sm font-bold text-text-primary">{formatCurrency(variant.price)}</span>
                      </div>
                    ))}
                  </div>

                  {isAdmin ? (
                    <div className="mt-5 flex gap-3 border-t border-border-main pt-4">
                      <Button
                        type="button"
                        variant="secondary"
                        className={`flex-1 ${PRODUCT_ACTION_BUTTON_CLASS}`}
                        onClick={() => openEditModal(product)}
                      >
                        Edit Product
                      </Button>
                      <Button
                        type="button"
                        variant={product.isAvailable ? "danger" : "success"}
                        className={`flex-1 ${PRODUCT_ACTION_BUTTON_CLASS}`}
                        onClick={() => openStatusModal(product)}
                      >
                        {product.isAvailable ? "Delete Product" : "Restore Product"}
                      </Button>
                    </div>
                  ) : null}
                </Card>
              );
            })
          )}
        </div>
      </div>

      {isAdmin ? (
        <>
          <ProductFormModal
            isOpen={isFormModalOpen}
            mode={formMode}
            form={productForm}
            errors={formErrors}
            saving={isSaving}
            onClose={closeFormModal}
            onChange={handleFormChange}
            onVariantChange={handleVariantChange}
            onAddVariant={handleAddVariant}
            onRemoveVariant={handleRemoveVariant}
            onSubmit={handleProductSubmit}
          />

          <ProductStatusModal
            isOpen={isStatusModalOpen}
            product={selectedProduct}
            deleting={isDeleting}
            onClose={closeStatusModal}
            onConfirm={handleStatusChange}
          />
        </>
      ) : null}
    </div>
  );
};

export default ProductManagement;
