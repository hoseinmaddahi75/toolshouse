import { jsxs, jsx } from "react/jsx-runtime";
import { defineRouteConfig } from "@medusajs/admin-sdk";
import { ChatBubbleLeftRightIcon, TrashIcon, PlusIcon, PencilIcon, ArrowLeftIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
const config = defineRouteConfig({
  label: "Blog",
  icon: ChatBubbleLeftRightIcon
});
function BlogList() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  useEffect(() => {
    fetchPosts();
  }, []);
  const fetchPosts = () => {
    fetch("/admin/blog").then((res) => res.json()).then((data) => {
      setPosts(data.posts || []);
      setLoading(false);
    }).catch((err) => console.error(err));
  };
  const handleDelete = async (id) => {
    if (!confirm("آیا از حذف این مقاله مطمئن هستید؟")) return;
    await fetch(`/admin/blog/${id}`, { method: "DELETE" });
    setPosts(posts.filter((p) => p.id !== id));
  };
  const handleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((itemId) => itemId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(posts.map((p) => p.id));
    } else {
      setSelectedIds([]);
    }
  };
  const handleBulkDelete = async () => {
    if (!confirm(`آیا مطمئن هستید که می‌خواهید ${selectedIds.length} مقاله را حذف کنید؟`)) return;
    await Promise.all(
      selectedIds.map((id) => fetch(`/admin/blog/${id}`, { method: "DELETE" }))
    );
    fetchPosts();
    setSelectedIds([]);
  };
  return /* @__PURE__ */ jsxs("div", { className: "p-8", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "مدیریت وبلاگ" }),
        selectedIds.length > 0 && /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: handleBulkDelete,
            className: "bg-red-50 text-red-600 px-3 py-1.5 rounded-lg text-sm font-medium border border-red-200 hover:bg-red-100 flex items-center gap-2 transition-all animate-fadeIn",
            children: [
              /* @__PURE__ */ jsx(TrashIcon, { className: "w-4 h-4" }),
              "حذف (",
              selectedIds.length,
              ")"
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx(
          Link,
          {
            to: "/blog/categories",
            className: "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors",
            children: "مدیریت دسته‌بندی‌ها"
          }
        ),
        /* @__PURE__ */ jsxs(
          Link,
          {
            to: "/blog/create",
            className: "bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors shadow-sm",
            children: [
              /* @__PURE__ */ jsx(PlusIcon, { className: "w-5 h-5" }),
              "نوشته جدید"
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-right", children: [
      /* @__PURE__ */ jsx("thead", { className: "bg-gray-50 text-gray-500 text-sm", children: /* @__PURE__ */ jsxs("tr", { children: [
        /* @__PURE__ */ jsx("th", { className: "w-12 px-6 py-4", children: /* @__PURE__ */ jsx(
          "input",
          {
            type: "checkbox",
            className: "rounded border-gray-300 w-4 h-4 focus:ring-blue-500",
            onChange: handleSelectAll,
            checked: posts.length > 0 && selectedIds.length === posts.length
          }
        ) }),
        /* @__PURE__ */ jsx("th", { className: "px-6 py-4 font-medium", children: "تصویر" }),
        /* @__PURE__ */ jsx("th", { className: "px-6 py-4 font-medium", children: "عنوان" }),
        /* @__PURE__ */ jsx("th", { className: "px-6 py-4 font-medium", children: "وضعیت" }),
        /* @__PURE__ */ jsx("th", { className: "px-6 py-4 font-medium", children: "تاریخ انتشار" }),
        /* @__PURE__ */ jsx("th", { className: "px-6 py-4 font-medium text-left", children: "عملیات" })
      ] }) }),
      /* @__PURE__ */ jsxs("tbody", { className: "divide-y divide-gray-100", children: [
        posts.map((post) => /* @__PURE__ */ jsxs("tr", { className: `transition-colors ${selectedIds.includes(post.id) ? "bg-blue-50" : "hover:bg-gray-50"}`, children: [
          /* @__PURE__ */ jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsx(
            "input",
            {
              type: "checkbox",
              className: "rounded border-gray-300 w-4 h-4 focus:ring-blue-500",
              checked: selectedIds.includes(post.id),
              onChange: () => handleSelect(post.id)
            }
          ) }),
          /* @__PURE__ */ jsx("td", { className: "px-6 py-4", children: post.image ? /* @__PURE__ */ jsx("img", { src: post.image, alt: "", className: "w-12 h-12 rounded-lg object-cover border border-gray-200" }) : /* @__PURE__ */ jsx("div", { className: "w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400", children: "📷" }) }),
          /* @__PURE__ */ jsx("td", { className: "px-6 py-4 font-medium text-gray-900", children: /* @__PURE__ */ jsx(Link, { to: `/blog/${post.id}`, className: "hover:text-blue-600 hover:underline", children: post.title }) }),
          /* @__PURE__ */ jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsx("span", { className: `px-2 py-1 rounded text-xs font-medium ${post.status === "published" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`, children: post.status === "published" ? "منتشر شده" : "پیش‌نویس" }) }),
          /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-gray-500 text-sm", children: new Date(post.published_at).toLocaleDateString("fa-IR") }),
          /* @__PURE__ */ jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-end gap-3", children: [
            /* @__PURE__ */ jsx(Link, { to: `/blog/${post.id}`, className: "text-gray-400 hover:text-blue-600", title: "ویرایش", children: /* @__PURE__ */ jsx(PencilIcon, { className: "w-5 h-5" }) }),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => handleDelete(post.id),
                className: "text-gray-400 hover:text-red-600",
                title: "حذف",
                children: /* @__PURE__ */ jsx(TrashIcon, { className: "w-5 h-5" })
              }
            )
          ] }) })
        ] }, post.id)),
        posts.length === 0 && !loading && /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 6, className: "px-6 py-12 text-center text-gray-400", children: "هنوز مقاله‌ای نوشته نشده است." }) })
      ] })
    ] }) })
  ] });
}
function CategoriesPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({ title: "", value: "" });
  const [editingId, setEditingId] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [catToDelete, setCatToDelete] = useState(null);
  const [targetCategory, setTargetCategory] = useState("");
  useEffect(() => {
    fetchCats();
  }, []);
  const fetchCats = () => {
    fetch("/admin/blog-categories").then((res) => res.json()).then((data) => setCategories(data.categories || []));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.value) return;
    if (editingId) {
      await fetch(`/admin/blog-categories/${editingId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      setEditingId(null);
    } else {
      await fetch("/admin/blog-categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
    }
    setFormData({ title: "", value: "" });
    fetchCats();
  };
  const startEdit = (cat) => {
    setFormData({ title: cat.title, value: cat.value });
    setEditingId(cat.id);
  };
  const cancelEdit = () => {
    setFormData({ title: "", value: "" });
    setEditingId(null);
  };
  const openDeleteModal = (cat) => {
    setCatToDelete(cat);
    setDeleteModalOpen(true);
    const otherCats = categories.filter((c) => c.id !== cat.id);
    if (otherCats.length > 0) setTargetCategory(otherCats[0].title);
    else setTargetCategory("");
  };
  const confirmDelete = async () => {
    if (!catToDelete) return;
    await fetch(`/admin/blog-categories/${catToDelete.id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ move_to: targetCategory })
      // ارسال دسته‌بندی مقصد
    });
    setDeleteModalOpen(false);
    setCatToDelete(null);
    fetchCats();
  };
  return /* @__PURE__ */ jsxs("div", { className: "p-8 max-w-4xl mx-auto", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 mb-8", children: [
      /* @__PURE__ */ jsx("button", { onClick: () => navigate("/blog"), className: "text-gray-500 hover:text-black", children: /* @__PURE__ */ jsx(ArrowLeftIcon, { className: "w-6 h-6" }) }),
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold", children: "مدیریت دسته‌بندی‌ها" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-8", children: [
      /* @__PURE__ */ jsx("div", { className: "md:col-span-1", children: /* @__PURE__ */ jsxs("div", { className: "bg-white p-6 rounded-xl border border-gray-200 shadow-sm sticky top-8", children: [
        /* @__PURE__ */ jsx("h2", { className: "font-bold text-lg mb-4", children: editingId ? "ویرایش دسته‌بندی" : "افزودن دسته‌بندی جدید" }),
        /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium mb-1", children: "عنوان (فارسی)" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                value: formData.title,
                onChange: (e) => setFormData({ ...formData, title: e.target.value }),
                placeholder: "مثال: آموزشی",
                className: "w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium mb-1", children: "شناسه (انگلیسی)" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                value: formData.value,
                onChange: (e) => setFormData({ ...formData, value: e.target.value }),
                placeholder: "مثال: educational",
                className: "w-full p-2 border rounded-lg ltr focus:ring-2 focus:ring-blue-500 outline-none"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsx("button", { type: "submit", className: "flex-1 bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors", children: editingId ? "ذخیره تغییرات" : "افزودن" }),
            editingId && /* @__PURE__ */ jsx("button", { type: "button", onClick: cancelEdit, className: "bg-gray-100 text-gray-600 p-2 rounded-lg hover:bg-gray-200", children: /* @__PURE__ */ jsx(XMarkIcon, { className: "w-5 h-5" }) })
          ] })
        ] })
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: "md:col-span-2", children: /* @__PURE__ */ jsx("div", { className: "bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-right", children: [
        /* @__PURE__ */ jsx("thead", { className: "bg-gray-50 text-gray-500 text-xs uppercase", children: /* @__PURE__ */ jsxs("tr", { children: [
          /* @__PURE__ */ jsx("th", { className: "px-6 py-3", children: "عنوان" }),
          /* @__PURE__ */ jsx("th", { className: "px-6 py-3", children: "شناسه" }),
          /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left", children: "عملیات" })
        ] }) }),
        /* @__PURE__ */ jsxs("tbody", { className: "divide-y divide-gray-100", children: [
          categories.map((cat) => /* @__PURE__ */ jsxs("tr", { className: `hover:bg-gray-50 transition-colors ${editingId === cat.id ? "bg-blue-50" : ""}`, children: [
            /* @__PURE__ */ jsx("td", { className: "px-6 py-4 font-medium text-gray-900", children: cat.title }),
            /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-gray-500 font-mono text-sm", children: cat.value }),
            /* @__PURE__ */ jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-end gap-3", children: [
              /* @__PURE__ */ jsx("button", { onClick: () => startEdit(cat), className: "text-blue-600 hover:text-blue-800", title: "ویرایش", children: /* @__PURE__ */ jsx(PencilIcon, { className: "w-5 h-5" }) }),
              /* @__PURE__ */ jsx("button", { onClick: () => openDeleteModal(cat), className: "text-red-500 hover:text-red-700", title: "حذف", children: /* @__PURE__ */ jsx(TrashIcon, { className: "w-5 h-5" }) })
            ] }) })
          ] }, cat.id)),
          categories.length === 0 && /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 3, className: "px-6 py-8 text-center text-gray-400", children: "هیچ دسته‌بندی وجود ندارد." }) })
        ] })
      ] }) }) })
    ] }),
    deleteModalOpen && catToDelete && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm", children: /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-xl shadow-xl w-full max-w-md p-6 animate-fadeIn", children: [
      /* @__PURE__ */ jsxs("h3", { className: "text-xl font-bold text-gray-900 mb-4", children: [
        'حذف دسته‌بندی "',
        catToDelete.title,
        '"'
      ] }),
      /* @__PURE__ */ jsxs("p", { className: "text-gray-600 mb-6 text-sm leading-relaxed", children: [
        "با حذف این دسته‌بندی، مقالاتی که در آن هستند بی‌سرپرست می‌شوند.",
        /* @__PURE__ */ jsx("br", {}),
        "آیا می‌خواهید آنها را به دسته‌بندی دیگری منتقل کنید؟"
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium mb-2 text-gray-700", children: "انتقال مقالات به:" }),
        /* @__PURE__ */ jsxs(
          "select",
          {
            className: "w-full p-2.5 border border-gray-300 rounded-lg bg-gray-50",
            value: targetCategory,
            onChange: (e) => setTargetCategory(e.target.value),
            children: [
              categories.filter((c) => c.id !== catToDelete.id).map((c) => /* @__PURE__ */ jsx("option", { value: c.title, children: c.title }, c.id)),
              /* @__PURE__ */ jsx("option", { value: "", children: "(بدون دسته‌بندی - حذف برچسب)" })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-3 justify-end", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setDeleteModalOpen(false),
            className: "px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 font-medium",
            children: "انصراف"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: confirmDelete,
            className: "px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 font-medium shadow-sm",
            children: "تایید و حذف"
          }
        )
      ] })
    ] }) })
  ] });
}
function CreateBlogPost() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    seo_title: "",
    seo_desc: "",
    category: "",
    status: "draft",
    excerpt: "",
    image: "",
    content: ""
    // متن اصلی مقاله
  });
  useEffect(() => {
    fetch("/admin/blog-categories").then((res) => res.json()).then((data) => setCategories(data.categories || [])).catch((err) => console.error("Error fetching categories:", err));
  }, []);
  const handleImageUpload = async (e) => {
    var _a, _b, _c;
    if (!((_a = e.target.files) == null ? void 0 : _a.length)) return;
    const file = e.target.files[0];
    const payload = new FormData();
    payload.append("files", file);
    try {
      const res = await fetch("/admin/blog-uploads", {
        method: "POST",
        body: payload
      });
      const data = await res.json();
      if ((_c = (_b = data.uploads) == null ? void 0 : _b[0]) == null ? void 0 : _c.url) {
        setFormData({ ...formData, image: data.uploads[0].url });
      }
    } catch (err) {
      alert("خطا در آپلود تصویر");
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/admin/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        alert("مقاله با موفقیت ذخیره شد!");
        navigate("/blog");
      } else {
        const err = await res.json();
        alert("خطا: " + err.message);
      }
    } catch (error) {
      console.error(error);
      alert("خطای ارتباط با سرور");
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "p-8 max-w-5xl mx-auto pb-20", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 mb-8", children: [
      /* @__PURE__ */ jsx("button", { onClick: () => navigate("/blog"), className: "text-gray-500 hover:text-black", children: /* @__PURE__ */ jsx(ArrowLeftIcon, { className: "w-6 h-6" }) }),
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold", children: "نوشتن مقاله جدید" })
    ] }),
    /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "grid grid-cols-1 lg:grid-cols-3 gap-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "lg:col-span-2 space-y-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-white p-6 rounded-xl border border-gray-200 shadow-sm", children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium mb-2", children: "عنوان مقاله" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              required: true,
              type: "text",
              className: "w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none",
              value: formData.title,
              onChange: (e) => setFormData({ ...formData, title: e.target.value }),
              placeholder: "مثال: راهنمای انتخاب لباس مجلسی"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white p-6 rounded-xl border border-gray-200 shadow-sm", children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium mb-2", children: "متن کامل مقاله" }),
          /* @__PURE__ */ jsxs("div", { className: "h-96 mb-12", children: [
            " ",
            /* @__PURE__ */ jsx(
              ReactQuill,
              {
                theme: "snow",
                value: formData.content,
                onChange: (value) => setFormData({ ...formData, content: value }),
                className: "h-full"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4", children: [
          /* @__PURE__ */ jsx("h3", { className: "font-semibold text-gray-900", children: "تنظیمات سئو (SEO)" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm text-gray-600 mb-1", children: "آدرس URL (Slug)" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                required: true,
                type: "text",
                className: "w-full p-2 border border-gray-300 rounded-lg ltr text-left font-mono text-sm",
                value: formData.slug,
                onChange: (e) => setFormData({ ...formData, slug: e.target.value }),
                placeholder: "how-to-choose-dress"
              }
            ),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-400 mt-1", children: "فقط حروف انگلیسی و خط تیره (-)" })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm text-gray-600 mb-1", children: "توضیحات متا (Description)" }),
            /* @__PURE__ */ jsx(
              "textarea",
              {
                rows: 3,
                className: "w-full p-2 border border-gray-300 rounded-lg",
                value: formData.seo_desc,
                onChange: (e) => setFormData({ ...formData, seo_desc: e.target.value })
              }
            )
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-white p-6 rounded-xl border border-gray-200 shadow-sm", children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium mb-2", children: "وضعیت" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              className: "w-full p-2 border border-gray-300 rounded-lg mb-4",
              value: formData.status,
              onChange: (e) => setFormData({ ...formData, status: e.target.value }),
              children: [
                /* @__PURE__ */ jsx("option", { value: "draft", children: "پیش‌نویس" }),
                /* @__PURE__ */ jsx("option", { value: "published", children: "منتشر شده" })
              ]
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "submit",
              disabled: loading,
              className: "w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50",
              children: loading ? "در حال ذخیره..." : "ذخیره تغییرات"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white p-6 rounded-xl border border-gray-200 shadow-sm", children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium mb-4", children: "تصویر شاخص" }),
          formData.image ? /* @__PURE__ */ jsxs("div", { className: "relative mb-4 group", children: [
            /* @__PURE__ */ jsx("img", { src: formData.image, className: "w-full h-48 object-cover rounded-lg" }),
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: () => setFormData({ ...formData, image: "" }),
                className: "absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity",
                children: /* @__PURE__ */ jsx(TrashIcon, { className: "w-4 h-4" })
              }
            )
          ] }) : /* @__PURE__ */ jsx("div", { className: "w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 mb-4", children: "بدون تصویر" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "file",
              accept: "image/*",
              onChange: handleImageUpload,
              className: "block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white p-6 rounded-xl border border-gray-200 shadow-sm", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-2", children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium", children: "دسته‌بندی" }),
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: () => navigate("/blog/categories"),
                className: "text-xs text-blue-600 hover:underline",
                children: "+ مدیریت دسته‌بندی‌ها"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              className: "w-full p-2 border border-gray-300 rounded-lg",
              value: formData.category || "",
              onChange: (e) => setFormData({ ...formData, category: e.target.value }),
              children: [
                /* @__PURE__ */ jsx("option", { value: "", children: "انتخاب کنید..." }),
                categories.map((cat) => /* @__PURE__ */ jsx("option", { value: cat.title, children: cat.title }, cat.id))
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white p-6 rounded-xl border border-gray-200 shadow-sm", children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium mb-2", children: "خلاصه متن (Excerpt)" }),
          /* @__PURE__ */ jsx(
            "textarea",
            {
              rows: 4,
              className: "w-full p-2 border border-gray-300 rounded-lg text-sm",
              value: formData.excerpt,
              onChange: (e) => setFormData({ ...formData, excerpt: e.target.value }),
              placeholder: "متنی که در کارت مقاله نمایش داده می‌شود..."
            }
          )
        ] })
      ] })
    ] })
  ] });
}
function EditBlogPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    seo_title: "",
    seo_desc: "",
    category: "",
    status: "draft",
    excerpt: "",
    image: "",
    content: ""
  });
  useEffect(() => {
    const fetchPost = fetch(`/admin/blog/${id}`).then((res) => res.json()).then((data) => {
      if (data.post) {
        setFormData(data.post);
      } else {
        alert("مقاله یافت نشد!");
        navigate("/blog");
      }
    });
    const fetchCats = fetch("/admin/blog-categories").then((res) => res.json()).then((data) => setCategories(data.categories || []));
    Promise.all([fetchPost, fetchCats]).catch((err) => console.error(err)).finally(() => setFetching(false));
  }, [id]);
  const handleImageUpload = async (e) => {
    var _a, _b, _c;
    if (!((_a = e.target.files) == null ? void 0 : _a.length)) return;
    const file = e.target.files[0];
    const payload = new FormData();
    payload.append("files", file);
    try {
      const res = await fetch("/admin/blog-uploads", {
        method: "POST",
        body: payload
      });
      const data = await res.json();
      if ((_c = (_b = data.uploads) == null ? void 0 : _b[0]) == null ? void 0 : _c.url) {
        setFormData({ ...formData, image: data.uploads[0].url });
      }
    } catch (err) {
      alert("خطا در آپلود تصویر");
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/admin/blog/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        alert("مقاله با موفقیت ویرایش شد!");
        navigate("/blog");
      } else {
        const err = await res.json();
        alert("خطا: " + err.message);
      }
    } catch (error) {
      console.error(error);
      alert("خطای ارتباط با سرور");
    } finally {
      setLoading(false);
    }
  };
  if (fetching) return /* @__PURE__ */ jsx("div", { className: "p-8", children: "در حال دریافت اطلاعات..." });
  return /* @__PURE__ */ jsxs("div", { className: "p-8 max-w-5xl mx-auto pb-20", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 mb-8", children: [
      /* @__PURE__ */ jsx("button", { onClick: () => navigate("/blog"), className: "text-gray-500 hover:text-black", children: /* @__PURE__ */ jsx(ArrowLeftIcon, { className: "w-6 h-6" }) }),
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold", children: "ویرایش مقاله" })
    ] }),
    /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "grid grid-cols-1 lg:grid-cols-3 gap-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "lg:col-span-2 space-y-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-white p-6 rounded-xl border border-gray-200 shadow-sm", children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium mb-2", children: "عنوان مقاله" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              required: true,
              type: "text",
              className: "w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none",
              value: formData.title,
              onChange: (e) => setFormData({ ...formData, title: e.target.value })
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white p-6 rounded-xl border border-gray-200 shadow-sm", children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium mb-2", children: "متن کامل مقاله" }),
          /* @__PURE__ */ jsx("div", { className: "h-96 mb-12", children: /* @__PURE__ */ jsx(
            ReactQuill,
            {
              theme: "snow",
              value: formData.content || "",
              onChange: (value) => setFormData({ ...formData, content: value }),
              className: "h-full"
            }
          ) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4", children: [
          /* @__PURE__ */ jsx("h3", { className: "font-semibold text-gray-900", children: "تنظیمات سئو" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm text-gray-600 mb-1", children: "آدرس URL (Slug)" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                required: true,
                type: "text",
                className: "w-full p-2 border border-gray-300 rounded-lg ltr text-left font-mono text-sm",
                value: formData.slug,
                onChange: (e) => setFormData({ ...formData, slug: e.target.value })
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm text-gray-600 mb-1", children: "توضیحات متا" }),
            /* @__PURE__ */ jsx(
              "textarea",
              {
                rows: 3,
                className: "w-full p-2 border border-gray-300 rounded-lg",
                value: formData.seo_desc || "",
                onChange: (e) => setFormData({ ...formData, seo_desc: e.target.value })
              }
            )
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-white p-6 rounded-xl border border-gray-200 shadow-sm", children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium mb-2", children: "وضعیت" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              className: "w-full p-2 border border-gray-300 rounded-lg mb-4",
              value: formData.status,
              onChange: (e) => setFormData({ ...formData, status: e.target.value }),
              children: [
                /* @__PURE__ */ jsx("option", { value: "draft", children: "پیش‌نویس" }),
                /* @__PURE__ */ jsx("option", { value: "published", children: "منتشر شده" })
              ]
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "submit",
              disabled: loading,
              className: "w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50",
              children: loading ? "در حال ذخیره..." : "بروزرسانی مقاله"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white p-6 rounded-xl border border-gray-200 shadow-sm", children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium mb-4", children: "تصویر شاخص" }),
          formData.image ? /* @__PURE__ */ jsxs("div", { className: "relative mb-4 group", children: [
            /* @__PURE__ */ jsx("img", { src: formData.image, className: "w-full h-48 object-cover rounded-lg" }),
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: () => setFormData({ ...formData, image: "" }),
                className: "absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity",
                children: /* @__PURE__ */ jsx(TrashIcon, { className: "w-4 h-4" })
              }
            )
          ] }) : /* @__PURE__ */ jsx("div", { className: "w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 mb-4", children: "بدون تصویر" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "file",
              accept: "image/*",
              onChange: handleImageUpload,
              className: "block w-full text-sm text-gray-500"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white p-6 rounded-xl border border-gray-200 shadow-sm", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-2", children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium", children: "دسته‌بندی" }),
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: () => navigate("/blog/categories"),
                className: "text-xs text-blue-600 hover:underline",
                children: "+ مدیریت دسته‌بندی‌ها"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              className: "w-full p-2 border border-gray-300 rounded-lg",
              value: formData.category || "",
              onChange: (e) => setFormData({ ...formData, category: e.target.value }),
              children: [
                /* @__PURE__ */ jsx("option", { value: "", children: "انتخاب کنید..." }),
                categories.map((cat) => /* @__PURE__ */ jsx("option", { value: cat.title, children: cat.title }, cat.id))
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white p-6 rounded-xl border border-gray-200 shadow-sm", children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium mb-2", children: "خلاصه متن" }),
          /* @__PURE__ */ jsx(
            "textarea",
            {
              rows: 4,
              className: "w-full p-2 border border-gray-300 rounded-lg text-sm",
              value: formData.excerpt || "",
              onChange: (e) => setFormData({ ...formData, excerpt: e.target.value })
            }
          )
        ] })
      ] })
    ] })
  ] });
}
const widgetModule = { widgets: [] };
const routeModule = {
  routes: [
    {
      Component: BlogList,
      path: "/blog"
    },
    {
      Component: CategoriesPage,
      path: "/blog/categories"
    },
    {
      Component: CreateBlogPost,
      path: "/blog/create"
    },
    {
      Component: EditBlogPost,
      path: "/blog/:id"
    }
  ]
};
const menuItemModule = {
  menuItems: [
    {
      label: config.label,
      icon: config.icon,
      path: "/blog",
      nested: void 0,
      rank: void 0,
      translationNs: void 0
    }
  ]
};
const formModule = { customFields: {} };
const displayModule = {
  displays: {}
};
const i18nModule = { resources: {} };
const plugin = {
  widgetModule,
  routeModule,
  menuItemModule,
  formModule,
  displayModule,
  i18nModule
};
export {
  plugin as default
};
