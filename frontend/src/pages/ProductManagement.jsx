import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
    label: "Available Products",
    iconClass: "bg-blue-50 text-blue-500",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
      </svg>
    ),
  },
  {
    key: "unavailable",
    label: "Unavailable Products",
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

const PRODUCT_ICON_BUTTON_CLASS =
  "cursor-pointer rounded-lg border p-2 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40";

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
      <Card
        key={`product-stat-skeleton-${card.key}`}
        className={`min-h-[112px] ${PRODUCT_CARD_HOVER_CLASS}`}
      >
        <div className="flex items-center gap-4">
          <SkeletonBlock className="h-12 w-12 rounded-xl" />
          <SkeletonBlock className="h-4 w-28" />
          <SkeletonBlock className="ml-auto h-10 w-16" />
        </div>
      </Card>
    ))}
  </>
);

const ProductFiltersSkeleton = () => (
  <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
    <SkeletonBlock className="h-12 w-full md:col-span-7" />
    <SkeletonBlock className="h-12 w-full md:col-span-3" />
    <SkeletonBlock className="h-12 w-full md:col-span-2" />
  </div>
);

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
  const [productStats, setProductStats] = useState({
    total: 0,
    available: 0,
    unavailable: 0,
  });
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
      const [productsResponse, statsResponse] = await Promise.all([
        isAdmin
          ? productService.getAllProductsAdmin()
          : productService.getAvailableProducts(),
        productService.getProductStats(),
      ]);

      setProducts(productsResponse.data.data || []);
      setProductStats(
        statsResponse.data.data || {
          total: 0,
          available: 0,
          unavailable: 0,
        }
      );
    } catch (error) {
      setProducts([]);
      setProductStats({
        total: 0,
        available: 0,
        unavailable: 0,
      });
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

  const categoryFilterOptions = useMemo(() => {
    return [
      { value: "", label: "All Categories" },
      ...categoryOptions.map((category) => ({
        value: category,
        label: formatCategory(category),
      })),
    ];
  }, [categoryOptions]);

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
              
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
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
              <Card key={card.key} className={`min-h-[112px] ${PRODUCT_CARD_HOVER_CLASS}`}>
                <div className="flex items-center gap-4">
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${card.iconClass}`}>
                    {card.icon}
                  </div>
                  <p className="text-base font-semibold text-text-secondary">{card.label}</p>
                  <p className="ml-auto text-4xl font-bold leading-none text-text-primary">{productStats[card.key]}</p>
                </div>
              </Card>
            ))
          )}
        </div>

        {isPageLoading ? (
          <ProductFiltersSkeleton />
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
            <div className="relative w-full md:col-span-7">
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
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              ) : null}
            </div>

            <div className="md:col-span-3">
              <FilterSelect
                value={categoryFilter}
                onChange={setCategoryFilter}
                options={categoryFilterOptions}
                placeholder="Select Category"
              />
            </div>

            <div className="md:col-span-2">
              <Button
                type="button"
                variant="secondary"
                className={`inline-flex w-full items-center justify-center gap-2 px-4 py-3 ${PRODUCT_ACTION_BUTTON_CLASS}`}
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
                      <div className="mt-2">
                        <div className="flex items-center gap-2 text-xs font-semibold text-text-secondary">
                          <span className="inline-flex rounded-full bg-surface-gray px-2.5 py-1 text-text-primary">
                            {formatCategory(product.category)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {isAdmin ? (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className={`border-border-main text-text-secondary hover:bg-surface-gray hover:text-text-primary ${PRODUCT_ICON_BUTTON_CLASS}`}
                          onClick={() => openEditModal(product)}
                          title="Update product"
                          aria-label="Update product"
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.5-8.5a2.121 2.121 0 113 3L12 16l-4 1 1-4 8.5-8.5z" />
                          </svg>
                        </button>

                        <button
                          type="button"
                          className={`${
                            product.isAvailable
                              ? "border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600"
                              : "border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                          } ${PRODUCT_ICON_BUTTON_CLASS}`}
                          onClick={() => openStatusModal(product)}
                          title={product.isAvailable ? "Delete product" : "Restore product"}
                          aria-label={product.isAvailable ? "Delete product" : "Restore product"}
                        >
                          {product.isAvailable ? (
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3M4 7h16" />
                            </svg>
                          ) : (
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m14.836 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-14.837-2m14.837 2H15" />
                            </svg>
                          )}
                        </button>
                      </div>
                    ) : null}
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