import { useState, useEffect, FormEvent } from "react";
import { ArrowLeftIcon, TrashIcon, PlusIcon, PencilIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

interface Category {
  id: string;
  title: string;
  value: string;
}

export default function CategoriesPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({ title: "", value: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [catToDelete, setCatToDelete] = useState<Category | null>(null);
  const [targetCategory, setTargetCategory] = useState<string>("");

  useEffect(() => {
    fetchCats();
  }, []);

  const fetchCats = () => {
    fetch("/admin/blog-categories")
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || []));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.value) return;

    if (editingId) {
      await fetch(`/admin/blog-categories/${editingId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      setEditingId(null);
    } else {
      await fetch("/admin/blog-categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
    }

    setFormData({ title: "", value: "" });
    fetchCats();
  };

  const startEdit = (cat: Category) => {
    setFormData({ title: cat.title, value: cat.value });
    setEditingId(cat.id);
  };

  const cancelEdit = () => {
    setFormData({ title: "", value: "" });
    setEditingId(null);
  };

  const openDeleteModal = (cat: Category) => {
    setCatToDelete(cat);
    setDeleteModalOpen(true);
    const otherCats = categories.filter((c) => c.id !== cat.id);
    setTargetCategory(otherCats.length > 0 ? otherCats[0].title : "");
  };

  const confirmDelete = async () => {
    if (!catToDelete) return;

    await fetch(`/admin/blog-categories/${catToDelete.id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ move_to: targetCategory }),
    });

    setDeleteModalOpen(false);
    setCatToDelete(null);
    fetchCats();
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate("/blog")} className="text-gray-500 hover:text-black">
          <ArrowLeftIcon className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-bold">Manage Categories</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm sticky top-8">
            <h2 className="font-bold text-lg mb-4">
              {editingId ? "Edit Category" : "Add New Category"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Technology"
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Slug</label>
                <input
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  placeholder="e.g., technology"
                  className="w-full p-2 border rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingId ? "Save Changes" : "Add Category"}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="bg-gray-100 text-gray-600 p-2 rounded-lg hover:bg-gray-200"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <table className="w-full">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="px-6 py-3 text-left">Title</th>
                  <th className="px-6 py-3 text-left">Slug</th>
                  <th className="px-6 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {categories.map((cat) => (
                  <tr
                    key={cat.id}
                    className={`hover:bg-gray-50 transition-colors ${
                      editingId === cat.id ? "bg-blue-50" : ""
                    }`}
                  >
                    <td className="px-6 py-4 font-medium text-gray-900">{cat.title}</td>
                    <td className="px-6 py-4 text-gray-500 font-mono text-sm">{cat.value}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => startEdit(cat)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Edit"
                        >
                          <PencilIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(cat)}
                          className="text-red-500 hover:text-red-700"
                          title="Delete"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {categories.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-gray-400">
                      No categories yet. Create one to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {deleteModalOpen && catToDelete && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Delete Category "{catToDelete.title}"?
            </h3>

            <p className="text-gray-600 mb-6 text-sm leading-relaxed">
              Posts in this category will need to be reassigned. Choose where to move them:
            </p>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2 text-gray-700">Move posts to:</label>
              <select
                className="w-full p-2.5 border border-gray-300 rounded-lg bg-gray-50"
                value={targetCategory}
                onChange={(e) => setTargetCategory(e.target.value)}
              >
                {categories
                  .filter((c) => c.id !== catToDelete.id)
                  .map((c) => (
                    <option key={c.id} value={c.title}>
                      {c.title}
                    </option>
                  ))}
                <option value="">(No category - remove tag)</option>
              </select>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 font-medium shadow-sm"
              >
                Delete Category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
