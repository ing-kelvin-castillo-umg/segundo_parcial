"use client";

import React, { useState, useEffect } from "react";
import { Product } from "@/entities/product.entity";
import { X, Tag, DollarSign, Layers, Calendar, AlertTriangle, Loader2 } from "lucide-react";

/* -------------------------------------------------------------------------- */
/*                                VIEW MODAL                                  */
/* -------------------------------------------------------------------------- */

interface ViewProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ViewProductModal: React.FC<ViewProductModalProps> = ({
  product,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-background/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div role="dialog" aria-modal="true" aria-labelledby="view-product-title" className="relative w-full max-w-2xl bg-surface rounded-2xl shadow-2xl overflow-hidden border border-outline">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline bg-primary-light/35">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-primary-light text-primary-dark">
              <Tag className="w-4 h-4" />
            </span>
            <h3 id="view-product-title" className="text-lg font-bold text-ink">Detalle del Producto</h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar detalle del producto"
            className="icon-button text-muted hover:text-primary-dark hover:bg-primary-light/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Large Image Preview */}
          <div className="w-full h-72 rounded-xl overflow-hidden bg-surface-secondary border border-outline relative group shadow-inner">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=800&q=80";
              }}
            />
            <div className="absolute top-3 right-3">
              <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-md ${product.inStock ? "bg-success text-white" : "bg-danger text-white"}`}>
                {product.inStock ? `${product.stock} en inventario` : "Agotado"}
              </span>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-4">
            <div>
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                {product.category}
              </span>
              <h4 className="text-2xl font-black text-ink mt-1">{product.name}</h4>
            </div>

            <div className="p-4 rounded-xl bg-surface-secondary border border-outline">
              <p className="text-xs font-medium text-muted mb-1">Descripción</p>
              <p className="text-sm text-ink leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-3.5 rounded-xl bg-primary-light/55 border border-primary/20">
                <span className="text-xs text-primary font-medium flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5" /> Precio Unitario
                </span>
                <p className="text-lg font-bold text-primary-dark mt-0.5">{product.formattedPrice}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-success/10 border border-success/20">
                <span className="text-xs text-success font-medium flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5" /> Stock Disponible
                </span>
                <p className="text-lg font-bold text-ink mt-0.5">{product.stock} unidades</p>
              </div>

              <div className="p-3.5 rounded-xl bg-surface-secondary border border-outline col-span-2 sm:col-span-1">
                <span className="text-xs text-muted font-medium flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> ID Registro
                </span>
                <p className="text-lg font-bold text-ink mt-0.5">#{product.id}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-outline bg-surface-secondary/60 flex justify-end">
          <button
            onClick={onClose}
            className="btn-secondary"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                               FORM MODAL (CREATE / EDIT)                   */
/* -------------------------------------------------------------------------- */

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Product>) => Promise<void>;
  product?: Product | null;
  mode: "create" | "edit";
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  product,
  mode,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number | string>("");
  const [stock, setStock] = useState<number | string>("");
  const [imageUrl, setImageUrl] = useState("");
  const [category, setCategory] = useState("Computación");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (product && mode === "edit") {
      setName(product.name || "");
      setDescription(product.description || "");
      setPrice(product.price !== undefined ? product.price : "");
      setStock(product.stock !== undefined ? product.stock : "");
      setImageUrl(product.imageUrl || "");
      setCategory(product.category || "Computación");
    } else {
      setName("");
      setDescription("");
      setPrice("");
      setStock("");
      setImageUrl("");
      setCategory("Computación");
    }
    setError(null);
  }, [product, mode, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("El nombre del producto es obligatorio.");
      return;
    }
    const numPrice = Number(price);
    const numStock = Number(stock);

    if (isNaN(numPrice) || numPrice <= 0) {
      setError("El precio debe ser un número mayor a 0.");
      return;
    }
    if (isNaN(numStock) || numStock < 0) {
      setError("El stock no puede ser un número negativo.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onSubmit({
        name,
        description,
        price: numPrice,
        stock: numStock,
        imageUrl,
        category,
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al guardar el producto");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-background/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div role="dialog" aria-modal="true" aria-labelledby="product-form-title" className="relative w-full max-w-xl bg-surface rounded-2xl shadow-2xl overflow-hidden border border-outline">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline bg-primary-light/35">
          <h3 id="product-form-title" className="text-lg font-bold text-ink">
            {mode === "create" ? "Crear Nuevo Producto" : "Editar Producto"}
          </h3>
          <button
            onClick={onClose}
            aria-label="Cerrar formulario de producto"
            className="icon-button text-muted hover:text-primary-dark hover:bg-primary-light/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-danger/10 border border-danger/25 rounded-xl text-xs text-danger flex items-center gap-2" role="alert">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label htmlFor="product-name" className="block text-xs font-semibold text-ink uppercase mb-1">
              Nombre del Producto *
            </label>
            <input
              type="text"
              id="product-name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. MacBook Pro 16 M3"
              className="field-control"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="product-price" className="block text-xs font-semibold text-ink uppercase mb-1">
                Precio (GTQ) *
              </label>
              <input
                type="number"
                id="product-price"
                step="0.01"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                className="field-control"
              />
            </div>

            <div>
              <label htmlFor="product-stock" className="block text-xs font-semibold text-ink uppercase mb-1">
                Stock (Unidades) *
              </label>
              <input
                type="number"
                id="product-stock"
                required
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="0"
                className="field-control"
              />
            </div>
          </div>

          <div>
            <label htmlFor="product-category" className="block text-xs font-semibold text-ink uppercase mb-1">
              Categoría
            </label>
            <select
              value={category}
              id="product-category"
              onChange={(e) => setCategory(e.target.value)}
              className="field-control"
            >
              <option value="Computación">Computación</option>
              <option value="Monitores">Monitores</option>
              <option value="Audio">Audio</option>
              <option value="Accesorios">Accesorios</option>
              <option value="Wearables">Wearables</option>
              <option value="Redes">Redes</option>
              <option value="Otro">Otro</option>
            </select>
          </div>

          <div>
            <label htmlFor="product-image" className="block text-xs font-semibold text-ink uppercase mb-1">
              URL de Imagen (Dummy o Web)
            </label>
            <input
              type="url"
              id="product-image"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="field-control"
            />
            <p className="text-[11px] text-muted mt-1">
              Puedes pegar cualquier URL de imagen (Unsplash, imgur, etc.)
            </p>
          </div>

          <div>
            <label htmlFor="product-description" className="block text-xs font-semibold text-ink uppercase mb-1">
              Descripción
            </label>
            <textarea
              rows={3}
              id="product-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Características destacadas del producto..."
              className="field-control resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-outline flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{mode === "create" ? "Guardar Producto" : "Actualizar"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                              DELETE CONFIRM MODAL                          */
/* -------------------------------------------------------------------------- */

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  productName: string;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  productName,
}) => {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await onConfirm();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-background/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div role="alertdialog" aria-modal="true" aria-labelledby="delete-product-title" className="relative w-full max-w-md bg-surface rounded-2xl shadow-2xl p-6 border border-outline">
        <div className="w-12 h-12 rounded-2xl bg-danger/10 text-danger flex items-center justify-center mb-4">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <h3 id="delete-product-title" className="text-lg font-bold text-ink mb-2">¿Eliminar este producto?</h3>
        <p className="text-sm text-muted leading-relaxed mb-6">
          Estás a punto de eliminar permanentemente <span className="font-semibold text-ink">&quot;{productName}&quot;</span>. Esta acción no se puede deshacer.
        </p>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="btn-secondary"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-danger hover:bg-danger/90 rounded-xl transition-colors disabled:opacity-50 shadow-sm"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>Eliminar Definitivamente</span>
          </button>
        </div>
      </div>
    </div>
  );
};
