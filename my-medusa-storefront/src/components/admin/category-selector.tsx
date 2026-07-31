"use client";

import { useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ChevronDown, ChevronLeft, Folder, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { MEDUSA_BACKEND_URL } from "@/lib/constants";

type Category = {
  id: string;
  name: string;
  parent_category_id: string | null;
  category_children?: Category[];
};

type CategorySelectorProps = {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  token: string;
};

const CategoryItem = ({
  category,
  level = 0,
  selectedIds,
  onToggle
}: {
  category: Category;
  level?: number;
  selectedIds: string[];
  onToggle: (id: string) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = category.category_children && category.category_children.length > 0;
  const isSelected = selectedIds.includes(category.id);

  return (
    <div className="select-none">
      <div
        className={cn(
          "flex items-center gap-2 py-1.5 rounded hover:bg-gray-50 transition-colors",
          level > 0 && "mr-4 border-r border-gray-200 pr-2"
        )}
      >
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "p-0.5 rounded text-gray-400 hover:text-gray-800 transition-colors",
            !hasChildren && "opacity-0 cursor-default"
          )}
        >
          {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>

        <Checkbox
          id={category.id}
          checked={isSelected}
          onCheckedChange={() => onToggle(category.id)}
        />

        <Label
          htmlFor={category.id}
          className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer flex-1"
        >
          <Folder className={cn("h-4 w-4", isSelected ? "text-blue-500" : "text-gray-400")} />
          {category.name}
        </Label>
      </div>

      {isOpen && hasChildren && (
        <div className="mr-2">
          {category.category_children!.map((child) => (
            <CategoryItem
              key={child.id}
              category={child}
              level={level + 1}
              selectedIds={selectedIds}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default function CategorySelector({ selectedIds, onChange, token }: CategorySelectorProps) {
  const [rootCategories, setRootCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const BASE_URL = MEDUSA_BACKEND_URL;

  useEffect(() => {
    const fetchCategories = async () => {
      if (!token) return;

      try {
        const res = await fetch(
          `${BASE_URL}/admin/product-categories?include_descendants_tree=true&fields=id,name,parent_category_id,category_children`,
          {
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            cache: "no-store"
          }
        );

        if (!res.ok) return;

        const data = await res.json();
        const allCategories = data.product_categories || [];
        const roots = allCategories.filter((cat: Category) => cat.parent_category_id === null);
        setRootCategories(roots);
      } catch {
        // silently fail — categories are optional
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [token, BASE_URL]);

  const handleToggle = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((item) => item !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  if (loading) return <div className="flex items-center justify-center py-4 text-gray-400 gap-2 text-sm"><Loader2 className="h-4 w-4 animate-spin" /> در حال دریافت...</div>;

  if (rootCategories.length === 0) return <div className="text-sm text-gray-400 italic py-2 text-center border rounded p-4">دسته بندی یافت نشد.</div>;

  return (
    <div className="border rounded-md p-2 max-h-[300px] overflow-y-auto bg-white/50">
      {rootCategories.map((cat) => (
        <CategoryItem
          key={cat.id}
          category={cat}
          selectedIds={selectedIds}
          onToggle={handleToggle}
        />
      ))}
    </div>
  );
}
