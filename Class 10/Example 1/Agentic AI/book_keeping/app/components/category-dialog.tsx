"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Category = { id: string; name: string; color: string; icon: string | null };

export function CategoryDialog({
  open,
  onOpenChange,
  category,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: Category | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const isEdit = !!category;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const body = {
      name: form.get("name") as string,
      color: form.get("color") as string,
      icon: (form.get("icon") as string) || undefined,
    };

    const url = isEdit ? `/api/categories/${category.id}` : "/api/categories";
    const method = isEdit ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setLoading(false);

    if (res.ok) {
      toast.success(isEdit ? "Category updated" : "Category created");
      onOpenChange(false);
      router.refresh();
    } else {
      const data = await res.json();
      toast.error(data.error ?? "Something went wrong");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Category" : "Add Category"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update the category details." : "Create a new category for organizing expenses."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              defaultValue={category?.name ?? ""}
              required
              placeholder="e.g. Office Supplies"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="color">Color</Label>
            <div className="flex gap-2 items-center">
              <Input
                id="color"
                name="color"
                type="color"
                defaultValue={category?.color ?? "#6b7280"}
                className="w-12 h-10 p-1"
              />
              <Input
                name="color-text"
                defaultValue={category?.color ?? "#6b7280"}
                className="font-mono"
                readOnly
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="icon">Icon name (optional)</Label>
            <Input
              id="icon"
              name="icon"
              defaultValue={category?.icon ?? ""}
              placeholder="e.g. shopping-bag"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : isEdit ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
