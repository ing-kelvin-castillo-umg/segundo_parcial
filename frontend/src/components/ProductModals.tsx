"use client";

import React, { useState, useEffect, useId } from "react";
import { Product } from "@/entities/product.entity";
import { getStockLevel, STOCK_BADGE } from "@/lib/stock";
import { X, Tag, DollarSign, Layers, Hash, AlertTriangle, Loader2, Eye, PackagePlus, Pencil } from "lucide-react";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=800&q=80";

/* -------------------------------------------------------------------------- */
/*                                MODAL SHELL                                 */
/* -------------------------------------------------------------------------- */

interface ModalShellProps {
  onClose: () => void;
  labelledBy: string;
  maxWidth: string;
  children: React.ReactNode;
  /** Bloquea el cierre con Escape/backdrop (ej. mientras se guarda). */
  locked?: boolean;
  role?: "dialog" | "alertdialog";
}

/** Contenedor común: backdrop con blur, animación de entrada, Escape y clic fuera para cerrar. */
const ModalShell: React.FC<ModalShellProps> = ({
  onClose,
  labelledBy,
  maxWidth,
  children,
  locked = false,
  role = "dialog",
}) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !locked) onClose();
    };
    window.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose, locked]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-secondary-950/60 backdrop-blur-sm animate-fade-in"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !locked) onClose();
      }}
    >
      <div
        role={role}
        aria-modal="true"
        aria-labelledby={labelledBy}
        className={`relative w-full ${maxWidth} max-h-[92vh] flex flex-col bg-surface rounded-t-3xl sm:rounded-2xl shadow-2xl border border-border overflow-hidden animate-scale-in`}
      >
        {children}
      </div>
    </div>
  );
};

const ModalHeader: React.FC<{
  id: string;
  title: string;
  icon: React.ReactNode;
  onClose: () => void;
  disabled?: boolean;
}> = ({ id, title, icon, onClose, disabled }) => (
  <div className="flex items-center justify-between gap-3 px-5 sm:px-6 py-4 border-b border-border bg-muted/40">
    <div className="flex items-center gap-2.5">
      <span className="p-2 rounded-lg bg-primary-50 text-primary-700">{icon}</span>
      <h3 id={id} className="text-lg font-bold text-foreground">
        {title}
      </h3>
    </div>
    <button
      type="button"
      onClick={onClose}
      disabled={disabled}
      aria-label="Cerrar"
      className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
    >
      <X className="w-5 h-5" aria-hidden="true" />
    </button>
  </div>
);

/* -------------------------------------------------------------------------- */
/*                                VIEW MODAL                                  */
/* -------------------------------------------------------------------------- */

interface ViewProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ViewProductModal: React.FC<ViewProductModalProps> = ({ product, isOpen, onClose }) => {
  const titleId = useId();
  if (!isOpen || !product) return null;

  const stockBadge = STOCK_BADGE[getStockLevel(product.stock)];

  return (
    <ModalShell onClose={onClose} labelledBy={titleId} maxWidth="sm:max-w-2xl">
      <ModalHeader id={titleId} title="Detalle del Producto" icon={<Eye className="w-4 h-4" />} onClose={onClose} />

      <div className="p-5 sm:p-6 space-y-6 overflow-y-auto">
        <div className="w-full h-56 sm:h-72 rounded-xl overflow-hidden bg-muted border border-border relative group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.imageUrl || FALLBACK_IMAGE}
            alt={product.name}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
            }}
          />
          <span className={`absolute top-3 right-3 badge shadow-md ${stockBadge.className}`}>
            {stockBadge.label(product.stock)}
          </span>
        </div>

        <div className="space-y-4">
          <div>
            <span className="badge badge-primary">
              <Tag className="w-3 h-3" aria-hidden="true" />
              {product.category}
            </span>
            <h4 className="text-2xl font-black text-foreground mt-2">{product.name}</h4>
          </div>

          <div className="p-4 rounded-xl bg-muted border border-border">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Descripción</p>
            <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line">{product.description}</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="p-3.5 rounded-xl bg-accent-50 border border-accent-200">
              <span className="text-xs text-accent-800 font-semibold flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5" aria-hidden="true" /> Precio unitario
              </span>
              <p className="text-lg font-black text-accent-900 mt-0.5 tabular-nums">{product.formattedPrice}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-primary-50 border border-primary-100">
              <span className="text-xs text-primary-800 font-semibold flex items-center gap-1">
                <Layers className="w-3.5 h-3.5" aria-hidden="true" /> Stock disponible
              </span>
              <p className="text-lg font-black text-primary-900 mt-0.5 tabular-nums">{product.stock} unidades</p>
            </div>

            <div className="p-3.5 rounded-xl bg-muted border border-border col-span-2 sm:col-span-1">
              <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
                <Hash className="w-3.5 h-3.5" aria-hidden="true" /> ID de registro
              </span>
              <p className="text-lg font-black text-foreground mt-0.5">#{product.id}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 sm:px-6 py-4 border-t border-border bg-muted/40 flex justify-end">
        <button onClick={onClose} className="btn btn-secondary w-full sm:w-auto">
          Cerrar
        </button>
      </div>
    </ModalShell>
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
  const idPrefix = useId();
  const titleId = `${idPrefix}-title`;

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
    } catch (err: any) {
      setError(err.message || "Error al guardar el producto");
    } finally {
      setLoading(false);
    }
  };

  const fieldId = (name: string) => `${idPrefix}-${name}`;

  return (
    <ModalShell onClose={onClose} labelledBy={titleId} maxWidth="sm:max-w-xl" locked={loading}>
      <ModalHeader
        id={titleId}
        title={mode === "create" ? "Crear Nuevo Producto" : "Editar Producto"}
        icon={mode === "create" ? <PackagePlus className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
        onClose={onClose}
        disabled={loading}
      />

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto">
          {error && (
            <div
              role="alert"
              className="p-3 rounded-xl border border-danger-200 bg-danger-50 text-sm text-danger-800 flex items-center gap-2 animate-slide-down"
            >
              <AlertTriangle className="w-4 h-4 shrink-0 text-danger-700" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label htmlFor={fieldId("name")} className="label">
              Nombre del producto <span className="text-danger-700">*</span>
            </label>
            <input
              id={fieldId("name")}
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. MacBook Pro 16 M3"
              className="input"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor={fieldId("price")} className="label">
                Precio (GTQ) <span className="text-danger-700">*</span>
              </label>
              <input
                id={fieldId("price")}
                type="number"
                step="0.01"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                className="input"
              />
            </div>

            <div>
              <label htmlFor={fieldId("stock")} className="label">
                Stock (unidades) <span className="text-danger-700">*</span>
              </label>
              <input
                id={fieldId("stock")}
                type="number"
                required
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="0"
                className="input"
              />
            </div>
          </div>

          <div>
            <label htmlFor={fieldId("category")} className="label">
              Categoría
            </label>
            <select
              id={fieldId("category")}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="input"
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
            <label htmlFor={fieldId("image")} className="label">
              URL de imagen
            </label>
            <input
              id={fieldId("image")}
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="input"
              aria-describedby={fieldId("image-hint")}
            />
            <p id={fieldId("image-hint")} className="text-xs text-muted-foreground mt-1.5">
              Puedes pegar cualquier URL de imagen (Unsplash, imgur, etc.)
            </p>
          </div>

          <div>
            <label htmlFor={fieldId("description")} className="label">
              Descripción
            </label>
            <textarea
              id={fieldId("description")}
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Características destacadas del producto..."
              className="input resize-none"
            />
          </div>
        </div>

        <div className="px-5 sm:px-6 py-4 border-t border-border bg-muted/40 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3">
          <button type="button" onClick={onClose} disabled={loading} className="btn btn-secondary">
            Cancelar
          </button>
          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
            <span>{mode === "create" ? "Guardar Producto" : "Actualizar"}</span>
          </button>
        </div>
      </form>
    </ModalShell>
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
  const titleId = useId();

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
    <ModalShell onClose={onClose} labelledBy={titleId} maxWidth="sm:max-w-md" locked={loading} role="alertdialog">
      <div className="p-6">
        <div className="w-12 h-12 rounded-2xl bg-danger-100 text-danger-700 flex items-center justify-center mb-4">
          <AlertTriangle className="w-6 h-6" aria-hidden="true" />
        </div>

        <h3 id={titleId} className="text-lg font-bold text-foreground mb-2">
          ¿Eliminar este producto?
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Estás a punto de eliminar permanentemente{" "}
          <span className="font-semibold text-foreground">&quot;{productName}&quot;</span>. Esta acción no se puede
          deshacer.
        </p>
      </div>

      <div className="px-6 py-4 border-t border-border bg-muted/40 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3">
        <button type="button" onClick={onClose} disabled={loading} className="btn btn-secondary">
          Cancelar
        </button>
        <button type="button" onClick={handleConfirm} disabled={loading} className="btn btn-danger">
          {loading && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
          <span>Eliminar definitivamente</span>
        </button>
      </div>
    </ModalShell>
  );
};
