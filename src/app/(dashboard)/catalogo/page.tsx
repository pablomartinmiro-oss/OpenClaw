"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from "@/hooks/useProducts";
import type { Product } from "@/hooks/useProducts";
import { ProductTable } from "./_components/ProductTable";
import { ProductModal } from "./_components/ProductModal";
import { PageSkeleton } from "@/components/shared/LoadingSkeleton";

export default function CatalogoPage() {
  const { data: products, isLoading } = useProducts();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  if (isLoading) return <PageSkeleton />;

  const handleAdd = () => {
    setEditingProduct(null);
    setModalOpen(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setModalOpen(true);
  };

  const handleDelete = async (product: Product) => {
    if (!confirm(`¿Eliminar "${product.name}"?`)) return;
    try {
      await deleteProduct.mutateAsync(product.id);
      toast.success("Producto eliminado");
    } catch {
      toast.error("Error al eliminar producto");
    }
  };

  const handleSave = async (data: Partial<Product>) => {
    try {
      if (data.id) {
        await updateProduct.mutateAsync(data as Partial<Product> & { id: string });
        toast.success("Producto actualizado");
      } else {
        await createProduct.mutateAsync(data);
        toast.success("Producto creado");
      }
      setModalOpen(false);
    } catch {
      toast.error("Error al guardar producto");
    }
  };

  return (
    <>
      <ProductTable
        products={products || []}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={handleAdd}
      />
      <ProductModal
        key={editingProduct?.id ?? "new"}
        product={editingProduct}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />
    </>
  );
}
