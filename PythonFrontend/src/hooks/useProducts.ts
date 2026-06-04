import { useAppState } from '../context/AppContext';

export function useProducts() {
  const {
    products,
    loading,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductById,
    isOfflineMode,
  } = useAppState();

  return {
    products,
    loading,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductById,
    isOfflineMode,
  };
}
export default useProducts;
