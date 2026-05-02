import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Plus, Edit, Trash2, Search, X } from "lucide-react";
import { fetchProducts } from "../store/productSlice";
import api from "../services/api";
import { toast } from "react-toastify";

const AdminProducts = () => {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((state) => state.products);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    categoryId: "",
    brand: "",
    imageUrl: "",
  });

  useEffect(() => {
    dispatch(fetchProducts());
    fetchCategories();
  }, [dispatch]);

  const fetchCategories = async () => {
    try {
      const response = await api.get("/catalog/categories");
      setCategories(response.data);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const seedCategories = async () => {
    const defaultCategories = [
      { name: "Electronic Gadgets", description: "Electronic devices and gadgets" },
      { name: "Mobiles", description: "Smartphones and mobile accessories" },
      { name: "Home Decor", description: "Home decoration and furnishings" },
      { name: "Apparel", description: "Clothing and apparel" },
      { name: "Accessories", description: "Fashion accessories" },
      { name: "Footwear", description: "Shoes and footwear" }
    ];

    try {
      for (const cat of defaultCategories) {
        // Only add if it doesn't already exist by name
        if (!categories.find(c => c.name.toLowerCase() === cat.name.toLowerCase())) {
          await api.post("/catalog/categories", cat);
        }
      }
      toast.success("Categories seeded successfully!");
      fetchCategories();
    } catch (error) {
      toast.error("Failed to seed categories");
      console.error(error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const openModal = (product) => {
    if (product) {
      setEditingId(product.id);
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        stock: product.stock.toString(),
        categoryId: product.categoryId ? product.categoryId.toString() : "",
        brand: product.brand || "",
        imageUrl: product.imageUrl || "",
      });
    } else {
      setEditingId(null);
      setFormData({
        name: "",
        description: "",
        price: "",
        stock: "",
        categoryId: "",
        brand: "",
        imageUrl: "",
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      categoryId: parseInt(formData.categoryId),
    };

    try {
      if (editingId) {
        await api.put(`/catalog/products/${editingId}`, payload);
        toast.success("Product updated successfully");
      } else {
        await api.post("/catalog/products", payload);
        toast.success("Product created successfully");
      }
      dispatch(fetchProducts());
      closeModal();
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation failed");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await api.delete(`/catalog/products/${id}`);
        toast.success("Product deleted successfully");
        dispatch(fetchProducts());
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to delete product",
        );
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4 bg-card p-4 rounded-2xl border border-border shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted" />
          <input
            type="text"
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-primary focus:border-primary bg-secondary/50"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={seedCategories}
            className="flex items-center gap-2 px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary/10 transition-colors font-medium shadow-sm"
          >
            Seed Categories
          </button>
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium shadow-sm"
          >
            <Plus className="h-5 w-5" /> Add Product
          </button>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-secondary/50 border-b border-border text-sm font-semibold text-muted uppercase tracking-wider">
                <th className="p-4 pl-6">ID / Image</th>
                <th className="p-4">Name</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price</th>
                <th className="p-4">Stock</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted">
                    Loading products...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted">
                    No products found.
                  </td>
                </tr>
              ) : (
                items.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-secondary/30 transition-colors"
                  >
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded overflow-hidden bg-secondary border border-border shrink-0">
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-muted">
                              N/A
                            </div>
                          )}
                        </div>
                        <span className="font-mono text-xs text-muted">
                          #{product.id}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 font-medium text-foreground">
                      {product.name}
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-secondary text-foreground/80 border border-border">
                        {product.categoryName || "N/A"}
                      </span>
                    </td>
                    <td className="p-4 font-medium">
                      ₹{product.price.toFixed(2)}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          product.stock > 10
                            ? "bg-green-100 text-green-700"
                            : product.stock > 0
                              ? "bg-orange-100 text-orange-700"
                              : "bg-red-100 text-red-700"
                        }`}
                      >
                        {product.stock}
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-right space-x-2">
                      <button
                        onClick={() => openModal(product)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl border border-border shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-card border-b border-border p-6 flex justify-between items-center z-10">
              <h2 className="text-xl font-bold">
                {editingId ? "Edit Product" : "Add New Product"}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-secondary rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-foreground/80 mb-1">
                    Product Name
                  </label>
                  <input
                    required
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-primary focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-1">
                    Price (₹)
                  </label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    min="0"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-primary focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-1">
                    Brand
                  </label>
                  <input
                    required
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-primary focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-1">
                    Stock Quantity
                  </label>
                  <input
                    required
                    type="number"
                    min="0"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-primary focus:border-primary"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-foreground/80 mb-1">
                    Category
                  </label>
                  <select
                    required
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-primary focus:border-primary bg-card"
                  >
                    <option value="" disabled>Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-foreground/80 mb-1">
                    Image URL (or Local Path)
                  </label>
                  <input
                    type="text"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleInputChange}
                    placeholder="/images/products/example.jpg"
                    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-primary focus:border-primary"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-foreground/80 mb-1">
                    Description
                  </label>
                  <textarea
                    required
                    rows={4}
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-primary focus:border-primary resize-none"
                  ></textarea>
                </div>
              </div>

              <div className="pt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-2 border border-border rounded-lg hover:bg-secondary font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 font-medium transition-colors shadow-sm"
                >
                  {editingId ? "Update Product" : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;

