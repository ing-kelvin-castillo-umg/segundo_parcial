"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Product } from "@/entities/product.entity";
import { ProductService } from "@/services/product.service";
import { useAuth } from "@/context/AuthContext";
import { DataTable } from "@/components/DataTable";
import {
  ViewProductModal,
  ProductFormModal,
  DeleteConfirmModal,
} from "@/components/ProductModals";
import {
  Boxes,
  ShieldCheck,
  User as UserIcon,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

export default function ProductsPage() {
  const { user, isAdmin } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Modal states
  const [viewProduct, setViewProduct] = useState<Product | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const [formProduct, setFormProduct] = useState<Product | null>(null);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);

  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await ProductService.getAll();
      setProducts(data);
    } catch (err: any) {
      showToast(err.message || "Error al cargar la lista de productos", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // View Handler
  const handleView = (product: Product) => {
    setViewProduct(product);
    setIsViewModalOpen(true);
  };

  // Create Handler
  const handleCreate = () => {
    setFormProduct(null);
    setFormMode("create");
    setIsFormModalOpen(true);
  };

  // Edit Handler
  const handleEdit = (product: Product) => {
    setFormProduct(product);
    setFormMode("edit");
    setIsFormModalOpen(true);
  };

  // Delete Handler
  const handleDelete = (product: Product) => {
    setDeleteProduct(product);
    setIsDeleteModalOpen(true);
  };

  // Submit Form (Create / Edit)
  const handleFormSubmit = async (data: Partial<Product>) => {
    if (formMode === "create") {
      await ProductService.create(data);
      showToast("¡Producto creado exitosamente!");
    } else if (formMode === "edit" && formProduct) {
      await ProductService.update(formProduct.id, data);
      showToast("¡Producto actualizado exitosamente!");
    }
    await loadProducts();
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!deleteProduct) return;
    await ProductService.delete(deleteProduct.id);
    showToast(`El producto "${deleteProduct.name}" ha sido eliminado.`);
    await loadProducts();
  };

  return (
    <div className="p-4 sm:p-8 lg:p-10 space-y-8 max-w-7xl w-full mx-auto">
      {/* Toast alert */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-5 py-3 rounded-2xl shadow-xl border text-sm font-medium animate-in slide-in-from-bottom-5 duration-300 ${
            toast.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle className="w-5 h-5 text-emerald-600" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-600" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-forest-600 text-xs font-semibold uppercase tracking-[0.16em] mb-2">
            <Boxes className="w-4 h-4 text-mint-600" />
            <span>Módulo de Inventario</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-ink tracking-tight">
            Gestión de Productos
          </h1>
          <p className="text-sm text-forest-700 mt-2">
            Consulta, busca y gestiona el inventario de productos en tiempo real.
          </p>
        </div>

        {/* User Role Badge & Refresh */}
        <div className="flex items-center gap-3">
          <button
            onClick={loadProducts}
            disabled={loading}
            title="Recargar listado"
            className="p-2.5 rounded-xl border border-forest-200 bg-white hover:bg-mint-50 text-forest-700 transition-colors shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-mint-600" : ""}`} />
          </button>

          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-forest-200 shadow-sm text-xs font-semibold text-forest-800">
            {isAdmin ? (
              <ShieldCheck className="w-4 h-4 text-gold-600" />
            ) : (
              <UserIcon className="w-4 h-4 text-mint-600" />
            )}
            <span>Rol:</span>
            <span
              className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                isAdmin
                  ? "bg-gold-100 text-gold-800"
                  : "bg-mint-100 text-mint-800"
              }`}
            >
              {isAdmin ? "ADMINISTRADOR" : "USUARIO"}
            </span>
          </div>
        </div>
      </div>

      <section aria-label="Resumen del inventario" className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <div className="rounded-2xl bg-forest-900 text-white p-4 sm:p-5 border border-forest-800 shadow-sm">
          <p className="text-[11px] uppercase tracking-widest text-forest-200 font-semibold">Productos</p>
          <p className="text-3xl font-black mt-2">{products.length}</p>
          <p className="text-xs text-forest-100 mt-1">Artículos registrados</p>
        </div>
        <div className="rounded-2xl bg-white p-4 sm:p-5 border border-forest-200 shadow-sm">
          <p className="text-[11px] uppercase tracking-widest text-forest-600 font-semibold">Categorías</p>
          <p className="text-3xl font-black text-ink mt-2">{new Set(products.map((p) => p.category)).size}</p>
          <p className="text-xs text-forest-600 mt-1">Líneas del catálogo</p>
        </div>
        <div className="col-span-2 lg:col-span-1 rounded-2xl bg-gold-50 p-4 sm:p-5 border border-gold-200 shadow-sm">
          <p className="text-[11px] uppercase tracking-widest text-gold-700 font-semibold">Disponibles</p>
          <p className="text-3xl font-black text-gold-800 mt-2">{products.filter((p) => p.inStock).length}</p>
          <p className="text-xs text-gold-700 mt-1">Con existencias para consulta</p>
        </div>
      </section>

      {/* Main DataTable */}
      <DataTable
        products={products}
        isAdmin={isAdmin}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onCreate={handleCreate}
      />

      {/* View Modal */}
      <ViewProductModal
        product={viewProduct}
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
      />

      {/* Form Modal (Create / Edit) */}
      <ProductFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        product={formProduct}
        mode={formMode}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        productName={deleteProduct?.name || ""}
      />
    </div>
  );
}
