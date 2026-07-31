"use client";

import { useEffect } from "react";
import { useCartStore } from "@/lib/store";

export default function ClearCartEffect() {
  useEffect(() => {
    useCartStore.setState({ cartId: null, items: [] });
    useCartStore.persist.clearStorage();
  }, []);

  return null;
}