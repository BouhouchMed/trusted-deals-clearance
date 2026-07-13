"use client";

import { Plus } from "lucide-react";

export function CreateProductButton() {
  return (
    <button className="button" type="button" onClick={() => window.dispatchEvent(new Event("tdc-open-create-product"))}>
      <Plus size={18} /> Create Product
    </button>
  );
}
