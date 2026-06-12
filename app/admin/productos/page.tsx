"use client";

import { useEffect, useRef, useState } from "react";
import * as XLSX from "@e965/xlsx";
import { supabase } from "../../lib/supabase";
import { Product, ProductImage } from "../../lib/types";
import { Plus, Pencil, ToggleLeft, ToggleRight, Save, X, Upload, Trash2, AlertTriangle, FileDown, FileUp, CheckCircle2 } from "lucide-react";
import { formatSoles } from "../../lib/money";

interface Category { id: string; name: string; }

interface ImportRow {
  rowNum: number;
  raw: Record<string, any>;
  errors: string[];
  // normalized
  id: string; sku: string; name: string; tagline: string; description: string;
  category: string; price: number; cost: number; stock: number;
  sizes: string[]; colors: string[]; gender: string; material: string;
  has_offer: boolean; active: boolean;
}

const TEMPLATE_COLS = ["name","tagline","description","category","price","cost","stock","sizes","colors","gender","material","has_offer","active"] as const;
const COL_WIDTHS     = [28,22,40,16,9,9,8,24,22,10,24,12,8];

const COST_TEMPLATE_COLS = ["id", "cost"] as const;

interface CostImportRow {
  rowNum: number;
  id: string;
  cost: number;
  /** Nombre actual del producto (lookup contra `products`) — solo para mostrar en el preview. */
  productName: string | null;
  /** Cost actual del producto, para el audit_log y para que el usuario vea el delta. */
  currentCost: number | null;
  errors: string[];
  warnings: string[];
}

const FALLBACK_CATS: Category[] = [
  { id: "conjuntos", name: "Conjuntos" },
  { id: "bodies",   name: "Bodies"    },
  { id: "baberos",  name: "Baberos"   },
  { id: "mantas",   name: "Mantas"    },
];

const EMPTY: any = {
  id: "", sku: "", name: "", tagline: "", description: "",
  category: "conjuntos", price: 0, cost: 0,
  gender: "Unisex", has_offer: false, image_url: "", active: true,
};

interface SizeOption  { id: string; name: string; sort_order: number; active: boolean; }
interface ColorOption { id: string; name: string; hex_code: string | null; active: boolean; }

/** Variant row as the form holds it. id present → existed in DB before the
 *  modal opened; absent → new in this session. The string-typed cost / price
 *  fields let an empty input mean "inherit" (null in DB) without coercing
 *  to 0 by accident. */
interface VariantDraft {
  /** Server id when the variant already exists; undefined for fresh rows. */
  id?: string;
  size_id:            string;
  color_id:           string;
  /** Snapshot of the existing sku so we don't regenerate one on update. */
  sku_variant?:       string;
  stock:              number;
  /** Empty string → inherit products.cost / products.price. */
  cost_str:           string;
  price_override_str: string;
  active:             boolean;
}

function makeVariantSku(productId: string, sizeName: string, colorName: string): string {
  const sizeSlug  = sizeName.toUpperCase().replace(/[^A-Z0-9]+/g, "");
  const colorSlug = colorName.toUpperCase().replace(/[^A-Z0-9]+/g, "");
  return `${productId}-${sizeSlug}-${colorSlug}`;
}

/** Returns the next available LC-NNN id given a list of existing products
 *  plus any ids already reserved in the current batch. */
function nextId(existingProducts: { id: string }[], reserved: string[] = []): string {
  const LC = /^LC-(\d+)$/i;
  const allNums = [...existingProducts.map(p => p.id), ...reserved]
    .map(id => { const m = id.match(LC); return m ? parseInt(m[1], 10) : 0; })
    .filter(n => n > 0);
  const max = allNums.length > 0 ? Math.max(...allNums) : 0;
  return `LC-${String(max + 1).padStart(3, "0")}`;
}

function parseBool(v: any, defaultVal = false): boolean {
  if (typeof v === "boolean") return v;
  const s = String(v ?? "").trim().toUpperCase();
  if (["TRUE","SÍ","SI","1","YES"].includes(s)) return true;
  if (["FALSE","NO","0"].includes(s)) return false;
  return defaultVal;
}

function parseArr(v: any): string[] {
  if (!v) return [];
  return String(v).split(",").map(s => s.trim()).filter(Boolean);
}

export default function ProductosAdmin() {
  const [products,   setProducts]   = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>(FALLBACK_CATS);
  const [editing,    setEditing]    = useState<any>(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);
  const [saving,     setSaving]     = useState(false);
  const [saveError,  setSaveError]  = useState<string | null>(null);
  const [search,     setSearch]     = useState("");

  // Inline category creation
  const [addingCat,  setAddingCat]  = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [savingCat,  setSavingCat]  = useState(false);

  // Inline size / color creation (inside the variant picker)
  const [addingSize,  setAddingSize]  = useState(false);
  const [newSizeName, setNewSizeName] = useState("");
  const [addingColor, setAddingColor] = useState(false);
  const [newColorName, setNewColorName] = useState("");
  const [newColorHex,  setNewColorHex]  = useState("#CFC3AE");
  const [savingAttr,   setSavingAttr]   = useState(false);

  // Image upload (legacy single-image, kept for backwards compat with rows
  // that have products.image_url set but no product_images yet).
  const [uploading,  setUploading]  = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Gallery (Fase 3) — multiple images per product with star ★ portada and
  // 👁 hover toggles. Persisted to product_images on save.
  const [gallery, setGallery] = useState<ProductImage[]>([]);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const galleryRef = useRef<HTMLInputElement>(null);

  // Delete
  const [deleteTarget,   setDeleteTarget]   = useState<Product | null>(null);
  const [deleteHasSales, setDeleteHasSales] = useState(false);
  const [deleting,       setDeleting]       = useState(false);
  const [deleteError,    setDeleteError]    = useState<string | null>(null);

  // Import
  const importRef   = useRef<HTMLInputElement>(null);
  const [importRows,    setImportRows]    = useState<ImportRow[] | null>(null);
  const [importError,   setImportError]   = useState<string | null>(null);
  const [importSaving,  setImportSaving]  = useState(false);
  const [importResult,  setImportResult]  = useState<{ imported: number; skipped: number } | null>(null);

  // Cost-only import (autodetected from the uploaded sheet — separate state so
  // the UI can show a different preview / confirm action than the full import).
  const [costImportRows,    setCostImportRows]    = useState<CostImportRow[] | null>(null);
  const [costImportResult,  setCostImportResult]  = useState<{ updated: number; skipped: number } | null>(null);

  // Variant catalogs (loaded from product_sizes / product_colors).
  const [sizes,  setSizes]  = useState<SizeOption[]>([]);
  const [colors, setColors] = useState<ColorOption[]>([]);
  // Live drafts of the variants currently being edited on the open modal.
  // Empty array when creating a new product (admin must add at least one).
  // Loaded from product_variants when editing an existing product.
  const [variantDrafts, setVariantDrafts] = useState<VariantDraft[]>([]);
  // Snapshot of the variant ids that existed in the DB when the modal opened,
  // so save() can detect drafts the admin removed (delete-on-save).
  const [originalVariantIds, setOriginalVariantIds] = useState<Set<string>>(new Set());
  // Inline picker state for "+ Agregar variante".
  const [newVariantPicker, setNewVariantPicker] =
    useState<{ size_id: string; color_id: string; stock: string }>({ size_id: "", color_id: "", stock: "" });
  const [pickerError, setPickerError] = useState<string | null>(null);
  // Stock per product, computed from product_variants (sum of variants.stock).
  const [stockByProduct, setStockByProduct] = useState<Record<string, number>>({});

  async function load() {
    setError(null);
    try {
      const [prodRes, catRes, sizeRes, colorRes, variantRes] = await Promise.all([
        supabase.from("products").select("*").order("created_at", { ascending: true }),
        supabase.from("categories").select("id,name").order("name"),
        supabase.from("product_sizes").select("id,name,sort_order,active").order("sort_order"),
        supabase.from("product_colors").select("id,name,hex_code,active").order("name"),
        supabase.from("product_variants").select("product_id,stock,active"),
      ]);
      if (prodRes.error) throw new Error(prodRes.error.message);
      setProducts(prodRes.data ?? []);
      if (catRes.data   && catRes.data.length   > 0) setCategories(catRes.data);
      if (sizeRes.data)  setSizes(sizeRes.data as SizeOption[]);
      if (colorRes.data) setColors(colorRes.data as ColorOption[]);
      // Roll up per-product stock from variants for the table column.
      const stockMap: Record<string, number> = {};
      for (const v of (variantRes.data ?? []) as { product_id: string; stock: number; active: boolean }[]) {
        if (!v.active) continue;
        stockMap[v.product_id] = (stockMap[v.product_id] ?? 0) + v.stock;
      }
      setStockByProduct(stockMap);
    } catch (e: any) {
      console.error("[admin/productos] load failed:", e);
      setError(e?.message ?? "Error al cargar productos");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  /** Opens the modal for an existing product and loads its variants into
   *  draft state so the admin can edit / add / remove without leaving the
   *  page. New-product callers use openNewProduct(). */
  async function openEditProduct(p: Product) {
    setSaveError(null);
    setPickerError(null);
    setNewVariantPicker({ size_id: "", color_id: "", stock: "" });
    setEditing({ ...p });
    setVariantDrafts([]);
    setOriginalVariantIds(new Set());
    setGallery([]);
    void loadGallery(p.id);
    // Pull current variants; failure is non-fatal — the admin will see an
    // empty list and can re-create as needed.
    const { data, error: vErr } = await supabase
      .from("product_variants")
      .select("id, size_id, color_id, sku_variant, stock, cost, price_override, active")
      .eq("product_id", p.id);
    if (vErr) {
      console.error("[admin/productos] variants load failed:", vErr);
      return;
    }
    const rows = (data ?? []) as {
      id: string; size_id: string; color_id: string; sku_variant: string;
      stock: number; cost: number | null; price_override: number | null; active: boolean;
    }[];
    setVariantDrafts(
      rows.map(r => ({
        id:                 r.id,
        size_id:            r.size_id,
        color_id:           r.color_id,
        sku_variant:        r.sku_variant,
        stock:              r.stock,
        cost_str:           r.cost === null ? "" : String(r.cost),
        price_override_str: r.price_override === null ? "" : String(r.price_override),
        active:             r.active,
      }))
    );
    setOriginalVariantIds(new Set(rows.map(r => r.id)));
  }

  function openNewProduct() {
    setSaveError(null);
    setPickerError(null);
    setNewVariantPicker({ size_id: "", color_id: "", stock: "" });
    const autoId = nextId(products);
    setEditing({ ...EMPTY, id: autoId, sku: autoId, _isNew: true });
    setVariantDrafts([]);
    setOriginalVariantIds(new Set());
    setGallery([]);
  }

  /** Adds the picker selection as a fresh draft, if the (size, color) pair
   *  isn't already in the matrix. Resets the picker on success. */
  function addVariantFromPicker() {
    setPickerError(null);
    if (!newVariantPicker.size_id || !newVariantPicker.color_id) {
      setPickerError("Elige talla y color.");
      return;
    }
    const stock = Number(newVariantPicker.stock);
    if (!Number.isFinite(stock) || stock < 0 || !Number.isInteger(stock)) {
      setPickerError("Stock debe ser un entero >= 0.");
      return;
    }
    const dup = variantDrafts.find(
      d => d.size_id === newVariantPicker.size_id && d.color_id === newVariantPicker.color_id
    );
    if (dup) {
      setPickerError("Esa combinación talla/color ya está en la tabla.");
      return;
    }
    setVariantDrafts(prev => [
      ...prev,
      {
        size_id:            newVariantPicker.size_id,
        color_id:           newVariantPicker.color_id,
        stock,
        cost_str:           "",
        price_override_str: "",
        active:             true,
      },
    ]);
    setNewVariantPicker({ size_id: "", color_id: "", stock: "" });
  }

  function patchVariantDraft(idx: number, patch: Partial<VariantDraft>) {
    setVariantDrafts(prev => prev.map((d, i) => (i === idx ? { ...d, ...patch } : d)));
  }

  function removeVariantDraft(idx: number) {
    setVariantDrafts(prev => prev.filter((_, i) => i !== idx));
  }

  // ── Edit / Save ────────────────────────────────────────────────────────────
  async function save() {
    if (!editing) return;
    setSaving(true);
    setSaveError(null);
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { _isNew, has_offer: _ignoredHasOffer, ...payload } = editing;
      if (_isNew) payload.sku = payload.id;
      // products.has_offer is derived from offers (Fase 4 DB trigger) — never
      // write it from the product form. The trigger keeps it in sync.
      void _ignoredHasOffer;

      // Every product must surface at least one active variant or it won't
      // show on the public catalog. Reject the save if the matrix is empty
      // or every row is inactive.
      const activeDrafts = variantDrafts.filter(d => d.active);
      if (activeDrafts.length === 0) {
        throw new Error("Agrega al menos una variante activa (talla + color + stock).");
      }
      // Local duplicate check — same (size, color) twice in the matrix.
      const pairKeys = new Set<string>();
      for (const d of variantDrafts) {
        const k = `${d.size_id}|${d.color_id}`;
        if (pairKeys.has(k)) throw new Error("Hay variantes duplicadas (misma talla y color).");
        pairKeys.add(k);
      }
      for (const d of variantDrafts) {
        if (!Number.isInteger(d.stock) || d.stock < 0) {
          throw new Error("Cada stock debe ser un entero >= 0.");
        }
      }

      // Cada producto debe tener galería con una ★ portada. La portada
      // sincroniza también products.image_url para que el carrito, checkout
      // y tabla admin (que aún leen products.image_url directo) sigan
      // funcionando sin tocarlos en esta fase.
      const primaryImg = gallery.find(g => g.is_primary);
      if (gallery.length > 0 && !primaryImg) {
        throw new Error("Marca una imagen como ★ Portada.");
      }
      if (gallery.length === 0 && !editing.image_url) {
        throw new Error("Sube al menos una imagen del producto.");
      }
      payload.image_url = primaryImg?.url ?? editing.image_url ?? "";

      if (_isNew) {
        const { error: insErr } = await supabase.from("products").insert(payload);
        if (insErr) throw new Error(insErr.message);
        const variantRows = variantDrafts.map(d => buildVariantInsertRow(payload.id, d));
        const { error: vErr } = await supabase.from("product_variants").insert(variantRows);
        if (vErr) {
          // Rollback product so we don't leave an orphan in the catalog.
          await supabase.from("products").delete().eq("id", payload.id);
          throw new Error(`Variantes: ${vErr.message}`);
        }
      } else {
        const { error: updErr } = await supabase.from("products").update(payload).eq("id", editing.id);
        if (updErr) throw new Error(updErr.message);

        // 1) Variants the admin removed from the matrix (originally in DB,
        //    no longer in drafts) — try delete; if there are FK references
        //    (orders, etc.) fall back to deactivation.
        const draftIds = new Set(variantDrafts.filter(d => d.id).map(d => d.id!));
        const removed  = [...originalVariantIds].filter(id => !draftIds.has(id));
        for (const id of removed) {
          const { error: delErr } = await supabase.from("product_variants").delete().eq("id", id);
          if (delErr) {
            // Likely a FK conflict (order_items.variant_id references it).
            // Deactivate so it disappears from the public store but
            // historical orders keep their reference intact.
            await supabase.from("product_variants").update({ active: false }).eq("id", id);
          }
        }

        // 2) Existing variants — UPDATE only the rows the admin touched.
        const existingDrafts = variantDrafts.filter(d => d.id);
        for (const d of existingDrafts) {
          const { error: uErr } = await supabase
            .from("product_variants")
            .update({
              size_id:        d.size_id,
              color_id:       d.color_id,
              sku_variant:    d.sku_variant ?? recomputeSku(editing.id, d),
              stock:          d.stock,
              cost:           d.cost_str === "" ? null : Number(d.cost_str),
              price_override: d.price_override_str === "" ? null : Number(d.price_override_str),
              active:         d.active,
              updated_at:     new Date().toISOString(),
            })
            .eq("id", d.id!);
          if (uErr) throw new Error(`Variante ${d.id}: ${uErr.message}`);
        }

        // 3) New variants added in this session.
        const fresh = variantDrafts.filter(d => !d.id);
        if (fresh.length > 0) {
          const newRows = fresh.map(d => buildVariantInsertRow(editing.id, d));
          const { error: insErr } = await supabase.from("product_variants").insert(newRows);
          if (insErr) throw new Error(`Variantes nuevas: ${insErr.message}`);
        }
      }

      // ─── Persist gallery (Fase 3) ──────────────────────────────────────
      // DELETE + INSERT pattern: simpler than diffing, and the unique partial
      // indexes (one is_primary, one is_hover per product) tolerate it because
      // both ops run within the same statement transaction implied by the
      // PostgREST round-trip on the second call. Storage objects keep their
      // existing public URLs.
      if (gallery.length > 0) {
        const productId = editing.id as string;
        const { error: delImgErr } = await supabase
          .from("product_images")
          .delete()
          .eq("product_id", productId);
        if (delImgErr) throw new Error(`Galería (limpieza): ${delImgErr.message}`);

        const imgRows = gallery.map((g, idx) => ({
          product_id:   productId,
          url:          g.url,
          storage_path: g.storage_path,
          sort_order:   idx,
          is_primary:   g.is_primary,
          is_hover:     g.is_hover,
          alt_text:     g.alt_text,
          image_type:   g.image_type,
          color_id:     g.color_id,
        }));
        const { error: insImgErr } = await supabase.from("product_images").insert(imgRows);
        if (insImgErr) throw new Error(`Galería: ${insImgErr.message}`);
      }

      await load();
      setEditing(null);
      setVariantDrafts([]);
      setOriginalVariantIds(new Set());
      setGallery([]);
    } catch (e: any) {
      console.error("[admin/productos] save failed:", e);
      setSaveError(e?.message ?? "Error al guardar producto");
    } finally {
      setSaving(false);
    }
  }

  /** Builds the insert payload for a variant from its draft, deriving the
   *  SKU from the product id + chosen size/color names. */
  function buildVariantInsertRow(productId: string, d: VariantDraft) {
    return {
      product_id:     productId,
      size_id:        d.size_id,
      color_id:       d.color_id,
      sku_variant:    recomputeSku(productId, d),
      stock:          d.stock,
      cost:           d.cost_str === "" ? null : Number(d.cost_str),
      price_override: d.price_override_str === "" ? null : Number(d.price_override_str),
      active:         d.active,
    };
  }

  function recomputeSku(productId: string, d: VariantDraft): string {
    const sizeName  = sizes.find(s  => s.id === d.size_id)?.name  ?? "";
    const colorName = colors.find(c => c.id === d.color_id)?.name ?? "";
    return makeVariantSku(productId, sizeName, colorName);
  }

  async function toggleActive(p: Product) {
    const { error: e } = await supabase.from("products").update({ active: !p.active }).eq("id", p.id);
    if (!e) setProducts(ps => ps.map(x => x.id === p.id ? { ...x, active: !x.active } : x));
  }

  // ── Delete ─────────────────────────────────────────────────────────────────
  async function handleDeleteClick(p: Product) {
    setDeleteError(null);
    const { count, error: countErr } = await supabase
      .from("order_items")
      .select("id", { count: "exact", head: true })
      .eq("product_id", p.id);
    if (countErr) { setDeleteError(countErr.message); setDeleteTarget(p); setDeleteHasSales(false); return; }
    setDeleteHasSales((count ?? 0) > 0);
    setDeleteTarget(p);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      const { error: delErr } = await supabase.from("products").delete().eq("id", deleteTarget.id);
      if (delErr) throw new Error(delErr.message);
      setDeleteTarget(null);
      await load();
    } catch (e: any) {
      console.error("[admin/productos] delete failed:", e);
      setDeleteError(e?.message ?? "Error al eliminar producto");
    } finally {
      setDeleting(false);
    }
  }

  // ── Image upload ───────────────────────────────────────────────────────────
  async function handleImageUpload(file: File) {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setSaveError("Solo se aceptan jpg, png o webp");
      return;
    }
    setUploading(true);
    setSaveError(null);
    try {
      const ext  = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const path = `products/${(editing?.id as string)?.trim() || `tmp-${Date.now()}`}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from("product-images")
        .upload(path, file, { upsert: true, contentType: file.type });
      if (upErr) throw new Error(`Storage upload: ${upErr.message}`);

      const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(path);
      if (!urlData?.publicUrl) throw new Error("No se pudo obtener la URL pública. Verifica que el bucket existe y es público.");

      console.log("[admin/productos] image uploaded, public URL:", urlData.publicUrl);
      setEditing((prev: any) => ({ ...prev, image_url: urlData.publicUrl }));
    } catch (e: any) {
      console.error("[admin/productos] image upload failed:", e);
      setSaveError("Error al subir imagen: " + (e?.message ?? "desconocido"));
    } finally {
      setUploading(false);
    }
  }

  // ── Gallery (multi-image) helpers ─────────────────────────────────────────
  //
  // The gallery lives in local component state while the modal is open. The
  // user adds files, toggles ★ portada / 👁 hover, or removes thumbnails;
  // the DELETE+REINSERT happens in save() so all the changes commit together.
  // Uploads go to storage immediately so the public URL is available to render
  // the thumbnail — if the modal is cancelled mid-edit, the storage object is
  // an orphan but that's tolerable for an admin tool.

  /** Fetch the existing gallery for a product. Empty array for new products. */
  async function loadGallery(productId: string) {
    const { data, error } = await supabase
      .from("product_images")
      .select("*")
      .eq("product_id", productId)
      .order("sort_order");
    if (error) {
      console.error("[admin/productos] gallery load failed:", error.message);
      setGallery([]);
      return;
    }
    setGallery((data ?? []) as ProductImage[]);
  }

  /** Upload one or more files into the product's storage folder, append them
   *  to the gallery state. The first one uploaded for an empty gallery is
   *  marked is_primary so a product is never published without a cover. */
  async function handleGalleryUpload(files: FileList | null) {
    if (!files || files.length === 0 || !editing) return;
    const productId = (editing.id as string)?.trim();
    if (!productId) {
      setSaveError("ID del producto no disponible — recarga e intenta de nuevo.");
      return;
    }
    setUploadingGallery(true);
    setSaveError(null);
    try {
      const newItems: ProductImage[] = [];
      for (const file of Array.from(files)) {
        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
          console.warn("[admin/productos] skipped non-image file:", file.name);
          continue;
        }
        const ext  = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
        const uuid = crypto.randomUUID();
        const path = `products/${productId}/${uuid}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("product-images")
          .upload(path, file, { contentType: file.type });
        if (upErr) throw new Error(`Storage upload: ${upErr.message}`);
        const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(path);
        if (!urlData?.publicUrl) throw new Error("No se pudo obtener la URL pública.");
        newItems.push({
          id: uuid,                  // temporary id — replaced when persisted
          product_id: productId,
          url: urlData.publicUrl,
          storage_path: path,
          sort_order: gallery.length + newItems.length,
          is_primary: false,
          is_hover: false,
          alt_text: null,
          image_type: null,
          color_id: null,
        });
      }
      setGallery(prev => {
        const merged = [...prev, ...newItems];
        // Ensure at least one ★ portada exists.
        if (!merged.some(g => g.is_primary) && merged.length > 0) {
          merged[0] = { ...merged[0], is_primary: true };
        }
        return merged;
      });
    } catch (e: any) {
      console.error("[admin/productos] gallery upload failed:", e);
      setSaveError("Error al subir imagen: " + (e?.message ?? "desconocido"));
    } finally {
      setUploadingGallery(false);
    }
  }

  /** Mark one item as the single ★ portada (clears the others). */
  function togglePrimary(itemId: string) {
    setGallery(prev => prev.map(g => ({ ...g, is_primary: g.id === itemId })));
  }

  /** Toggle 👁 hover on / off. Only one item can be hover at a time; setting
   *  it on a new one clears any previous hover. */
  function toggleHover(itemId: string) {
    setGallery(prev => prev.map(g => {
      if (g.id === itemId) return { ...g, is_hover: !g.is_hover };
      return { ...g, is_hover: false };
    }));
  }

  /** Remove an item from the local gallery (no DB write yet — save() handles
   *  it). The storage object is also removed eagerly to keep the bucket from
   *  accumulating orphans. */
  async function removeGalleryItem(itemId: string) {
    const item = gallery.find(g => g.id === itemId);
    if (!item) return;
    // Eager storage cleanup — best-effort, swallowed on failure.
    const { error: rmErr } = await supabase.storage
      .from("product-images")
      .remove([item.storage_path]);
    if (rmErr) console.warn("[admin/productos] storage cleanup failed:", rmErr.message);
    setGallery(prev => {
      const next = prev.filter(g => g.id !== itemId);
      // If we removed the portada, promote the first remaining item.
      if (item.is_primary && next.length > 0) {
        next[0] = { ...next[0], is_primary: true };
      }
      return next;
    });
  }

  // ── Inline category ────────────────────────────────────────────────────────
  async function handleAddCategory() {
    if (!newCatName.trim()) return;
    setSavingCat(true);
    setSaveError(null);
    try {
      const slug = newCatName.trim().toLowerCase()
        .normalize("NFD").replace(/[̀-ͯ]/g, "")
        .replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      const { error: catErr } = await supabase.from("categories").insert({ id: slug, name: newCatName.trim() });
      if (catErr && !catErr.message.includes("duplicate") && !catErr.message.includes("unique")) throw new Error(catErr.message);
      const newCat = { id: slug, name: newCatName.trim() };
      setCategories(cats => cats.find(c => c.id === slug) ? cats : [...cats, newCat]);
      setEditing((prev: any) => ({ ...prev, category: slug }));
      setNewCatName("");
      setAddingCat(false);
    } catch (e: any) {
      console.error("[admin/productos] add category failed:", e);
      setSaveError(e?.message ?? "Error al crear categoría");
    } finally {
      setSavingCat(false);
    }
  }

  // Create a size inline and preselect it in the variant picker.
  async function handleAddSize() {
    const name = newSizeName.trim();
    if (!name) return;
    setSavingAttr(true);
    setPickerError(null);
    try {
      const existing = sizes.find(s => s.name.toLowerCase() === name.toLowerCase());
      if (existing) {
        setNewVariantPicker(p => ({ ...p, size_id: existing.id }));
      } else {
        const sort_order = (sizes.reduce((m, s) => Math.max(m, s.sort_order), 0)) + 1;
        const { data, error } = await supabase
          .from("product_sizes")
          .insert({ name, sort_order, active: true })
          .select("id,name,sort_order,active")
          .single();
        if (error) throw new Error(error.message);
        setSizes(prev => [...prev, data as SizeOption].sort((a, b) => a.sort_order - b.sort_order));
        setNewVariantPicker(p => ({ ...p, size_id: (data as SizeOption).id }));
      }
      setNewSizeName("");
      setAddingSize(false);
    } catch (e: any) {
      console.error("[admin/productos] add size failed:", e);
      setPickerError(e?.message ?? "Error al crear talla");
    } finally {
      setSavingAttr(false);
    }
  }

  // Create a color inline and preselect it in the variant picker.
  async function handleAddColor() {
    const name = newColorName.trim();
    if (!name) return;
    setSavingAttr(true);
    setPickerError(null);
    try {
      const existing = colors.find(c => c.name.toLowerCase() === name.toLowerCase());
      if (existing) {
        setNewVariantPicker(p => ({ ...p, color_id: existing.id }));
      } else {
        const { data, error } = await supabase
          .from("product_colors")
          .insert({ name, hex_code: newColorHex || null, active: true })
          .select("id,name,hex_code,active")
          .single();
        if (error) throw new Error(error.message);
        setColors(prev => [...prev, data as ColorOption].sort((a, b) => a.name.localeCompare(b.name)));
        setNewVariantPicker(p => ({ ...p, color_id: (data as ColorOption).id }));
      }
      setNewColorName("");
      setNewColorHex("#CFC3AE");
      setAddingColor(false);
    } catch (e: any) {
      console.error("[admin/productos] add color failed:", e);
      setPickerError(e?.message ?? "Error al crear color");
    } finally {
      setSavingAttr(false);
    }
  }

  // ── Excel template download ────────────────────────────────────────────────
  function downloadTemplate() {
    const catIds = categories.map(c => c.id).join(" | ");
    const header  = [...TEMPLATE_COLS];
    const note     = ["← obligatorio","","","← obligatorio. Categorías: " + catIds,"← obligatorio, número","número (≥0)","entero (≥0)","separar con comas","separar con comas","Unisex | Niño | Niña","","TRUE o FALSE","TRUE o FALSE"];
    const example1 = ["Nombre del Producto","Tagline breve","Descripción completa del producto","conjuntos",59,0,10,"RN,0-3m,3-6m","Blanco,Celeste","Unisex","100% Algodón Pima","FALSE","TRUE"];
    const example2 = ["Otro Producto","","Cuerpo de descripción","bodies",29,0,20,"RN,0-3m","Rosa","Niña","100% Algodón Pima","TRUE","TRUE"];

    const ws = XLSX.utils.aoa_to_sheet([header, note, example1, example2]);
    ws["!cols"] = TEMPLATE_COLS.map((_, i) => ({ wch: COL_WIDTHS[i] }));

    // Style the note row (row index 1) with italic — basic cell metadata
    TEMPLATE_COLS.forEach((_, ci) => {
      const ref = XLSX.utils.encode_cell({ r: 1, c: ci });
      if (ws[ref]) ws[ref].s = { font: { italic: true, color: { rgb: "888888" } } };
    });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Productos");
    XLSX.writeFile(wb, "plantilla-productos-lioncub.xlsx");
  }

  /** Carga masiva de costos: descarga un .xlsx con SOLO `id` y `cost`,
   *  prerellenado con los productos activos ordenados por id. El usuario
   *  edita solo el costo y vuelve a subir el archivo por el mismo botón
   *  "Importar Excel"; el parser detecta el modo automáticamente. */
  function downloadCostTemplate() {
    const header = [...COST_TEMPLATE_COLS];
    const note   = ["", "← editar este número (Soles)"];
    const activeSorted = [...products]
      .filter((p) => p.active)
      .sort((a, b) => a.id.localeCompare(b.id));
    const dataRows = activeSorted.map((p) => [p.id, Number(p.cost) || 0]);
    const ws = XLSX.utils.aoa_to_sheet([header, note, ...dataRows]);
    ws["!cols"] = [{ wch: 12 }, { wch: 14 }];
    // Style the note row in italic / muted.
    COST_TEMPLATE_COLS.forEach((_, ci) => {
      const ref = XLSX.utils.encode_cell({ r: 1, c: ci });
      if (ws[ref]) ws[ref].s = { font: { italic: true, color: { rgb: "888888" } } };
    });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Costos");
    XLSX.writeFile(wb, "plantilla-costos-lioncub.xlsx");
  }

  // ── Excel import ───────────────────────────────────────────────────────────
  function handleImportFile(file: File) {
    setImportError(null);
    setImportResult(null);
    setCostImportResult(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data  = new Uint8Array(e.target!.result as ArrayBuffer);
        const wb    = XLSX.read(data, { type: "array" });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        if (!sheet) throw new Error("El archivo Excel está vacío o no tiene hojas.");

        const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
        if (rows.length < 2) throw new Error("El archivo no tiene filas de datos (solo encabezados o vacío).");

        // ─── Mode detection ──────────────────────────────────────────────
        // Full template starts with "name" in column A. Cost-only template
        // has "id" and "cost" in its header row but NO "name".
        let headerIdx = rows.findIndex(r => String(r[0] ?? "").trim().toLowerCase() === "name");

        if (headerIdx === -1) {
          const costHeaderIdx = rows.findIndex(r => {
            const lower = (r as any[]).map(c => String(c ?? "").trim().toLowerCase());
            return lower.includes("id") && lower.includes("cost") && !lower.includes("name");
          });
          if (costHeaderIdx === -1) {
            throw new Error('No se encontró encabezado "name" ni columnas "id"+"cost". Descarga "Plantilla" o "Plantilla solo costos".');
          }
          // ─── Parse cost-only template ──────────────────────────────────
          const costHeaders  = rows[costHeaderIdx].map((h: any) => String(h ?? "").trim().toLowerCase());
          const idCol        = costHeaders.indexOf("id");
          const costCol      = costHeaders.indexOf("cost");
          const productsById = new Map(products.map(p => [p.id, p]));
          const seenIds      = new Set<string>();
          const parsedCost: CostImportRow[] = [];

          rows.slice(costHeaderIdx + 1).forEach((raw, idx) => {
            const rowNum = costHeaderIdx + idx + 2;
            const rawId   = String(raw[idCol]   ?? "").trim();
            const rawCost = String(raw[costCol] ?? "").trim();
            // Skip blank and instruction rows
            if (!rawId || rawId.startsWith("←")) return;

            const errors:   string[] = [];
            const warnings: string[] = [];
            const product = productsById.get(rawId);
            if (!product) errors.push(`id "${rawId}" no existe en products`);
            if (seenIds.has(rawId)) errors.push("id duplicado en el archivo");
            seenIds.add(rawId);

            const costNum = Number(rawCost);
            if (rawCost === "" || isNaN(costNum)) errors.push("cost debe ser numérico");
            else if (costNum < 0) errors.push("cost debe ser >= 0");
            else if (costNum === 0) warnings.push("cost = 0 — confirma que es correcto");

            parsedCost.push({
              rowNum,
              id: rawId,
              cost: isNaN(costNum) ? 0 : costNum,
              productName: product?.name ?? null,
              currentCost: product ? Number(product.cost ?? 0) : null,
              errors,
              warnings,
            });
          });

          if (parsedCost.length === 0) throw new Error("No se encontraron filas de datos en el archivo.");

          setCostImportRows(parsedCost);
          setImportRows(null);
          return;
        }

        // ─── Parse full template (existing logic) ────────────────────────
        const headers = rows[headerIdx].map((h: any) => String(h ?? "").trim().toLowerCase());
        const missing = TEMPLATE_COLS.filter(c => !headers.includes(c));
        if (missing.length > 0) throw new Error(`Columnas faltantes en el Excel: ${missing.join(", ")}. Usa la plantilla oficial.`);

        const catSet     = new Set(categories.map(c => c.id));
        const reservedIds: string[] = []; // ids assigned to earlier rows in this batch

        const dataRows = rows.slice(headerIdx + 1);
        const parsed: ImportRow[] = [];

        dataRows.forEach((raw, idx) => {
          const rowNum = headerIdx + idx + 2; // 1-based Excel row
          const cell = (col: string) => {
            const ci = headers.indexOf(col);
            return ci >= 0 ? raw[ci] : "";
          };

          // Skip blank rows and instruction rows
          const rawName = String(cell("name") ?? "").trim();
          if (!rawName || rawName.startsWith("←")) return;

          // Auto-generate id for this row (accounts for existing products + already-reserved ids)
          const autoId = nextId(products, reservedIds);
          reservedIds.push(autoId);

          const errors: string[] = [];

          // category
          const rawCat = String(cell("category") ?? "").trim().toLowerCase();
          if (!rawCat) errors.push("category es obligatorio");
          else if (!catSet.has(rawCat)) errors.push(`categoría "${rawCat}" no existe (usa: ${[...catSet].join(", ")})`);

          // price
          const rawPrice = Number(cell("price"));
          if (isNaN(rawPrice) || rawPrice <= 0) errors.push("price debe ser un número mayor a 0");

          // cost
          const rawCost = cell("cost") !== "" ? Number(cell("cost")) : 0;
          if (isNaN(rawCost) || rawCost < 0) errors.push("cost debe ser un número >= 0");

          // stock
          const rawStock = cell("stock") !== "" ? Number(cell("stock")) : 0;
          if (isNaN(rawStock) || rawStock < 0 || !Number.isInteger(rawStock))
            errors.push("stock debe ser un entero >= 0");

          parsed.push({
            rowNum,
            raw: Object.fromEntries(TEMPLATE_COLS.map(c => [c, cell(c)])),
            errors,
            id:          autoId,
            sku:         autoId,
            name:        rawName,
            tagline:     String(cell("tagline") ?? "").trim(),
            description: String(cell("description") ?? "").trim(),
            category:    rawCat,
            price:       rawPrice,
            cost:        isNaN(rawCost)  ? 0 : rawCost,
            stock:       isNaN(rawStock) ? 0 : rawStock,
            sizes:       parseArr(cell("sizes")),
            colors:      parseArr(cell("colors")),
            gender:      String(cell("gender") ?? "Unisex").trim() || "Unisex",
            material:    String(cell("material") ?? "100% Algodón Pima").trim() || "100% Algodón Pima",
            has_offer:   parseBool(cell("has_offer"), false),
            active:      parseBool(cell("active"), true),
          });
        });

        if (parsed.length === 0) throw new Error("No se encontraron filas de datos válidas en el archivo.");

        setImportRows(parsed);
      } catch (e: any) {
        console.error("[admin/productos] import parse failed:", e);
        setImportError(e?.message ?? "Error al leer el archivo");
        setImportRows(null);
        setCostImportRows(null);
      }
    };
    reader.onerror = () => setImportError("No se pudo leer el archivo");
    reader.readAsArrayBuffer(file);
  }

  async function confirmImport() {
    if (!importRows) return;
    const valid = importRows.filter(r => r.errors.length === 0);
    if (valid.length === 0) { setImportError("No hay filas válidas para importar."); return; }

    setImportSaving(true);
    setImportError(null);
    try {
      const payload = valid.map(({ id, sku, name, tagline, description, category, price, cost, stock, sizes, colors, gender, material, has_offer, active }) => ({
        id, sku, name, tagline, description, category, price, cost, stock, sizes, colors, gender, material, has_offer, active,
      }));
      const { error: insErr } = await supabase.from("products").insert(payload);
      if (insErr) throw new Error(insErr.message);

      const skipped = importRows.filter(r => r.errors.length > 0).length;
      setImportResult({ imported: valid.length, skipped });
      setImportRows(null);
      await load();
    } catch (e: any) {
      console.error("[admin/productos] import insert failed:", e);
      setImportError(e?.message ?? "Error al insertar en la base de datos");
    } finally {
      setImportSaving(false);
    }
  }

  function closeImport() {
    setImportRows(null);
    setCostImportRows(null);
    setImportError(null);
    if (importRef.current) importRef.current.value = "";
  }

  /** Aplica los updates de cost del modo "Plantilla solo costos" y
   *  escribe una fila por cambio en audit_log (table_name='products',
   *  field_changed='cost', old/new, changed_by=auth.user.id). */
  async function confirmCostImport() {
    if (!costImportRows) return;
    const valid = costImportRows.filter(r => r.errors.length === 0);
    if (valid.length === 0) {
      setImportError("No hay filas válidas para actualizar.");
      return;
    }
    setImportSaving(true);
    setImportError(null);
    try {
      const { data: userRes } = await supabase.auth.getUser();
      const changedBy = userRes.user?.id ?? null;

      // Updates en serie para que el audit_log refleje exactamente lo
      // aplicado (si una falla a mitad de camino, las anteriores ya están
      // logueadas y vemos en el resumen cuántas se procesaron).
      const failedRows: { rowNum: number; id: string; message: string }[] = [];
      const auditPayload: Record<string, unknown>[] = [];
      let updated = 0;
      for (const row of valid) {
        const { error: upErr } = await supabase
          .from("products")
          .update({ cost: row.cost })
          .eq("id", row.id);
        if (upErr) {
          failedRows.push({ rowNum: row.rowNum, id: row.id, message: upErr.message });
          continue;
        }
        updated += 1;
        auditPayload.push({
          table_name:    "products",
          record_id:     row.id,
          field_changed: "cost",
          old_value:     row.currentCost === null ? null : String(row.currentCost),
          new_value:     String(row.cost),
          changed_by:    changedBy,
        });
      }

      if (auditPayload.length > 0) {
        const { error: auditErr } = await supabase.from("audit_log").insert(auditPayload);
        if (auditErr) {
          console.warn("[admin/productos] audit_log insert failed:", auditErr.message);
        }
      }

      const skipped = costImportRows.filter(r => r.errors.length > 0).length + failedRows.length;
      setCostImportResult({ updated, skipped });
      setCostImportRows(null);
      if (failedRows.length > 0) {
        setImportError(
          "Algunos updates fallaron: " +
          failedRows.slice(0, 3).map(r => `fila ${r.rowNum} (${r.id}): ${r.message}`).join(" · ") +
          (failedRows.length > 3 ? ` y ${failedRows.length - 3} más` : "")
        );
      }
      await load();
    } catch (e: any) {
      console.error("[admin/productos] cost import failed:", e);
      setImportError(e?.message ?? "Error al actualizar costos");
    } finally {
      setImportSaving(false);
    }
  }

  // ── Filtered list ──────────────────────────────────────────────────────────
  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.id.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <p className="text-[#9B6B45]">Cargando...</p>;
  if (error) return (
    <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-700">
      <p className="font-bold mb-1">Error al cargar productos</p>
      <p className="text-sm font-mono">{error}</p>
      <button onClick={load} className="mt-3 text-xs font-bold underline">Reintentar</button>
    </div>
  );

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-[#3D2010]">Productos</h1>
          <p className="text-[#9B6B45] text-sm">{products.length} productos en catálogo</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Plantillas e import por Excel: deshabilitadas en Fase 1 — el modelo
              de variantes (talla x color) cambia las columnas necesarias.
              Se rediseñan junto con el variant matrix en una fase próxima. */}
          <button
            onClick={openNewProduct}
            className="flex items-center gap-2 bg-[#D4A520] text-white font-bold px-4 py-2.5 rounded-xl hover:bg-[#A07D10] transition-colors text-sm"
          >
            <Plus size={16} /> Nuevo producto
          </button>
        </div>
      </div>

      {/* Cost import result banner */}
      {costImportResult && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-2xl px-5 py-3 text-green-700">
          <CheckCircle2 size={18} className="flex-shrink-0" />
          <span className="text-sm font-semibold">
            {costImportResult.updated} costo{costImportResult.updated !== 1 ? "s" : ""} actualizado{costImportResult.updated !== 1 ? "s" : ""}.
            {costImportResult.skipped > 0 && ` ${costImportResult.skipped} omitido${costImportResult.skipped !== 1 ? "s" : ""} por errores.`}
          </span>
        </div>
      )}

      {/* Import result banner */}
      {importResult && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-2xl px-5 py-3 text-green-700">
          <CheckCircle2 size={18} className="flex-shrink-0" />
          <span className="text-sm font-semibold">
            {importResult.imported} producto{importResult.imported !== 1 ? "s" : ""} importado{importResult.imported !== 1 ? "s" : ""} correctamente.
            {importResult.skipped > 0 && ` ${importResult.skipped} omitido${importResult.skipped !== 1 ? "s" : ""} por errores.`}
          </span>
          <button onClick={() => setImportResult(null)} className="ml-auto text-green-600 hover:text-green-800"><X size={16} /></button>
        </div>
      )}

      <input
        placeholder="Buscar por nombre, SKU o categoría..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="bg-white border border-[#F5EDD8] rounded-xl px-4 py-2.5 text-sm text-[#3D2010] focus:outline-none focus:ring-2 focus:ring-[#D4A520] w-full max-w-sm"
      />

      {/* Product table */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#F5EDD8] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#F5EDD8] text-[#6B3D1E]">
              <tr>
                <th className="px-4 py-3 text-left font-bold">Producto</th>
                <th className="px-4 py-3 text-right font-bold">Precio</th>
                <th className="px-4 py-3 text-right font-bold">Costo</th>
                <th className="px-4 py-3 text-right font-bold">Stock</th>
                <th className="px-4 py-3 text-center font-bold">Estado</th>
                <th className="px-4 py-3 text-center font-bold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5EDD8]">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-[#FDF8F0] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {p.image_url && (
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#F5EDD8] flex-shrink-0 flex items-center justify-center text-[#C4956A] text-[10px]">
                          <img
                            src={p.image_url}
                            alt={p.name}
                            className="w-full h-full object-cover"
                            onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                          />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-[#3D2010]">{p.name}</p>
                        <p className="text-[#9B6B45] text-xs">{p.id} · {p.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-[#D4A520]">{formatSoles(p.price)}</td>
                  <td className="px-4 py-3 text-right text-[#9B6B45]">{formatSoles(p.cost ?? 0)}</td>
                  <td className="px-4 py-3 text-right">
                    {(() => {
                      const s = stockByProduct[p.id] ?? 0;
                      return <span className={`font-bold ${s <= 3 ? "text-orange-500" : "text-[#3D2010]"}`}>{s}</span>;
                    })()}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => toggleActive(p)} className={`flex items-center gap-1 mx-auto text-xs font-semibold ${p.active ? "text-green-600" : "text-[#9B6B45]"}`}>
                      {p.active ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                      {p.active ? "Activo" : "Oculto"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => openEditProduct(p)} className="p-1.5 text-[#9B6B45] hover:text-[#D4A520] transition-colors">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => handleDeleteClick(p)} className="p-1.5 text-[#9B6B45] hover:text-red-500 transition-colors">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Delete dialog ───────────────────────────────────────────────────── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-sm flex flex-col gap-4">
            {deleteHasSales ? (
              <>
                <div className="flex items-center gap-3 text-orange-600">
                  <AlertTriangle size={22} />
                  <h2 className="font-extrabold text-[#3D2010] text-lg">No se puede eliminar</h2>
                </div>
                <p className="text-sm text-[#6B3D1E]">
                  <strong>{deleteTarget.name}</strong> tiene ventas registradas y no puede eliminarse.
                </p>
                <p className="text-sm text-[#9B6B45]">
                  Si ya no quieres venderlo, puedes <strong>desactivarlo</strong> para ocultarlo de la tienda sin perder el historial de pedidos.
                </p>
                {deleteError && <p className="text-xs text-red-600 font-mono break-all">{deleteError}</p>}
                <button
                  onClick={() => { setDeleteTarget(null); setDeleteError(null); }}
                  className="w-full py-2.5 bg-[#D4A520] text-white font-bold rounded-xl hover:bg-[#A07D10] transition-colors text-sm"
                >
                  Entendido
                </button>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 text-red-600">
                  <Trash2 size={22} />
                  <h2 className="font-extrabold text-[#3D2010] text-lg">Eliminar producto</h2>
                </div>
                <p className="text-sm text-[#6B3D1E]">
                  ¿Eliminar <strong>{deleteTarget.name}</strong>? Esta acción no se puede deshacer.
                </p>
                {deleteError && <p className="text-xs text-red-600 font-mono break-all">{deleteError}</p>}
                <div className="flex gap-3">
                  <button
                    onClick={() => { setDeleteTarget(null); setDeleteError(null); }}
                    className="flex-1 py-2.5 border border-[#F5EDD8] rounded-xl text-[#9B6B45] font-semibold hover:bg-[#F5EDD8] transition-colors text-sm"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={confirmDelete}
                    disabled={deleting}
                    className="flex-1 py-2.5 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors text-sm disabled:opacity-60"
                  >
                    {deleting ? "Eliminando..." : "Sí, eliminar"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Import preview modal ────────────────────────────────────────────── */}
      {(importRows || costImportRows || importError) && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#F5EDD8]">
              <h2 className="font-extrabold text-[#3D2010] text-lg flex items-center gap-2">
                <FileUp size={20} className="text-[#D4A520]" />
                {costImportRows ? "Vista previa — actualización de costos" : "Vista previa — importación"}
              </h2>
              <button onClick={closeImport} className="text-[#9B6B45] hover:text-[#3D2010]"><X size={20} /></button>
            </div>

            {/* Parse error */}
            {importError && (
              <div className="mx-6 mt-4 bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm font-mono break-all">
                {importError}
              </div>
            )}

            {/* Preview table */}
            {importRows && importRows.length > 0 && (
              <>
                <div className="px-6 pt-3 pb-1 flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1.5 text-green-700 font-semibold">
                    <CheckCircle2 size={15} />
                    {importRows.filter(r => r.errors.length === 0).length} válidas
                  </span>
                  <span className="flex items-center gap-1.5 text-red-600 font-semibold">
                    <AlertTriangle size={15} />
                    {importRows.filter(r => r.errors.length > 0).length} con errores
                  </span>
                  <span className="text-[#9B6B45] text-xs ml-auto">Las filas con error NO se importarán</span>
                </div>

                <div className="overflow-auto flex-1 px-6 pb-4">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#F5EDD8] text-[#6B3D1E]">
                        <th className="px-2 py-2 text-left font-bold border border-[#EDD9B4]">Fila</th>
                        <th className="px-2 py-2 text-left font-bold border border-[#EDD9B4]">ID (auto)</th>
                        <th className="px-2 py-2 text-left font-bold border border-[#EDD9B4]">Nombre</th>
                        <th className="px-2 py-2 text-left font-bold border border-[#EDD9B4]">Categoría</th>
                        <th className="px-2 py-2 text-right font-bold border border-[#EDD9B4]">Precio</th>
                        <th className="px-2 py-2 text-right font-bold border border-[#EDD9B4]">Stock</th>
                        <th className="px-2 py-2 text-left font-bold border border-[#EDD9B4]">Estado / Error</th>
                      </tr>
                    </thead>
                    <tbody>
                      {importRows.map(r => {
                        const ok = r.errors.length === 0;
                        return (
                          <tr key={r.rowNum} className={ok ? "bg-green-50" : "bg-red-50"}>
                            <td className="px-2 py-1.5 border border-[#EDD9B4] text-[#9B6B45]">{r.rowNum}</td>
                            <td className="px-2 py-1.5 border border-[#EDD9B4] font-mono">{r.id}</td>
                            <td className="px-2 py-1.5 border border-[#EDD9B4]">{r.name}</td>
                            <td className="px-2 py-1.5 border border-[#EDD9B4]">{r.category}</td>
                            <td className="px-2 py-1.5 border border-[#EDD9B4] text-right">{formatSoles(r.price)}</td>
                            <td className="px-2 py-1.5 border border-[#EDD9B4] text-right">{r.stock}</td>
                            <td className="px-2 py-1.5 border border-[#EDD9B4]">
                              {ok ? (
                                <span className="text-green-700 font-semibold">✓ Lista para importar</span>
                              ) : (
                                <span className="text-red-600">{r.errors.join(" · ")}</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* Cost-only preview */}
            {costImportRows && costImportRows.length > 0 && (
              <>
                <div className="px-6 pt-3 pb-1 flex items-center gap-4 text-sm flex-wrap">
                  <span className="flex items-center gap-1.5 text-green-700 font-semibold">
                    <CheckCircle2 size={15} />
                    {costImportRows.filter(r => r.errors.length === 0).length} válidas
                  </span>
                  <span className="flex items-center gap-1.5 text-red-600 font-semibold">
                    <AlertTriangle size={15} />
                    {costImportRows.filter(r => r.errors.length > 0).length} con errores
                  </span>
                  {costImportRows.some(r => r.warnings.length > 0) && (
                    <span className="flex items-center gap-1.5 text-amber-600 font-semibold">
                      <AlertTriangle size={15} />
                      {costImportRows.filter(r => r.warnings.length > 0).length} con advertencias
                    </span>
                  )}
                  <span className="text-[#9B6B45] text-xs ml-auto">Las filas con error NO se actualizarán</span>
                </div>

                <div className="overflow-auto flex-1 px-6 pb-4">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#F5EDD8] text-[#6B3D1E]">
                        <th className="px-2 py-2 text-left  font-bold border border-[#EDD9B4]">Fila</th>
                        <th className="px-2 py-2 text-left  font-bold border border-[#EDD9B4]">ID</th>
                        <th className="px-2 py-2 text-left  font-bold border border-[#EDD9B4]">Producto</th>
                        <th className="px-2 py-2 text-right font-bold border border-[#EDD9B4]">Costo actual</th>
                        <th className="px-2 py-2 text-right font-bold border border-[#EDD9B4]">Costo nuevo</th>
                        <th className="px-2 py-2 text-left  font-bold border border-[#EDD9B4]">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {costImportRows.map(r => {
                        const ok      = r.errors.length === 0;
                        const warn    = ok && r.warnings.length > 0;
                        const rowCls  = !ok ? "bg-red-50" : warn ? "bg-amber-50" : "bg-green-50";
                        return (
                          <tr key={r.rowNum} className={rowCls}>
                            <td className="px-2 py-1.5 border border-[#EDD9B4] text-[#9B6B45]">{r.rowNum}</td>
                            <td className="px-2 py-1.5 border border-[#EDD9B4] font-mono">{r.id}</td>
                            <td className="px-2 py-1.5 border border-[#EDD9B4]">{r.productName ?? <span className="text-red-600">no encontrado</span>}</td>
                            <td className="px-2 py-1.5 border border-[#EDD9B4] text-right">{r.currentCost === null ? "—" : formatSoles(r.currentCost)}</td>
                            <td className="px-2 py-1.5 border border-[#EDD9B4] text-right font-semibold">{formatSoles(r.cost)}</td>
                            <td className="px-2 py-1.5 border border-[#EDD9B4]">
                              {!ok ? (
                                <span className="text-red-600">{r.errors.join(" · ")}</span>
                              ) : warn ? (
                                <span className="text-amber-700">{r.warnings.join(" · ")}</span>
                              ) : (
                                <span className="text-green-700 font-semibold">Lista para actualizar</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* Footer actions */}
            {importRows && (
              <div className="flex gap-3 px-6 py-4 border-t border-[#F5EDD8]">
                <button
                  onClick={closeImport}
                  className="flex-1 py-2.5 border border-[#F5EDD8] rounded-xl text-[#9B6B45] font-semibold hover:bg-[#F5EDD8] transition-colors text-sm"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmImport}
                  disabled={importSaving || importRows.filter(r => r.errors.length === 0).length === 0}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#D4A520] text-white font-bold rounded-xl hover:bg-[#A07D10] transition-colors text-sm disabled:opacity-50"
                >
                  <FileUp size={15} />
                  {importSaving
                    ? "Importando..."
                    : `Importar ${importRows.filter(r => r.errors.length === 0).length} producto${importRows.filter(r => r.errors.length === 0).length !== 1 ? "s" : ""}`
                  }
                </button>
              </div>
            )}

            {costImportRows && (
              <div className="flex gap-3 px-6 py-4 border-t border-[#F5EDD8]">
                <button
                  onClick={closeImport}
                  className="flex-1 py-2.5 border border-[#F5EDD8] rounded-xl text-[#9B6B45] font-semibold hover:bg-[#F5EDD8] transition-colors text-sm"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmCostImport}
                  disabled={importSaving || costImportRows.filter(r => r.errors.length === 0).length === 0}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#D4A520] text-white font-bold rounded-xl hover:bg-[#A07D10] transition-colors text-sm disabled:opacity-50"
                >
                  <FileUp size={15} />
                  {importSaving
                    ? "Actualizando..."
                    : `Actualizar ${costImportRows.filter(r => r.errors.length === 0).length} costo${costImportRows.filter(r => r.errors.length === 0).length !== 1 ? "s" : ""}`
                  }
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Edit / Create modal ─────────────────────────────────────────────── */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="font-extrabold text-[#3D2010] text-lg">
                {editing._isNew ? "Nuevo producto" : `Editar: ${editing.name}`}
              </h2>
              <button onClick={() => setEditing(null)} className="text-[#9B6B45] hover:text-[#3D2010]"><X size={20} /></button>
            </div>

            {saveError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm font-mono break-all">
                {saveError}
              </div>
            )}

            {/* ID — read-only for both new and existing products */}
            <div>
              <label className="block text-xs font-bold text-[#6B3D1E] mb-1">ID / SKU</label>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-[#D4A520] bg-[#FDF8F0] border border-[#F5EDD8] rounded-xl px-3 py-2 text-sm">
                  {editing.id || "—"}
                </span>
                {editing._isNew && (
                  <span className="text-xs text-[#9B6B45]">generado automáticamente</span>
                )}
              </div>
            </div>

            {([
              { key: "name",        label: "Nombre",               type: "text",     ph: "" },
              { key: "tagline",     label: "Tagline (opcional)",   type: "text",     ph: "" },
              { key: "description", label: "Descripción",          type: "textarea", ph: "" },
              { key: "price",       label: "Precio (S/)",          type: "number",   ph: "" },
              { key: "cost",        label: "Costo base (S/) — opcional", type: "number", ph: "" },
            ] as const).map(({ key, label, type, ph }) => (
              <div key={key}>
                <label className="block text-xs font-bold text-[#6B3D1E] mb-1">{label}</label>
                {type === "textarea" ? (
                  <textarea
                    rows={2}
                    value={editing[key] ?? ""}
                    onChange={e => setEditing((prev: any) => ({ ...prev, [key]: e.target.value }))}
                    className="w-full border border-[#F5EDD8] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A520]"
                  />
                ) : (
                  <input
                    type={type}
                    placeholder={ph}
                    value={editing[key] ?? ""}
                    onChange={e => setEditing((prev: any) => ({
                      ...prev,
                      [key]: type === "number" ? Number(e.target.value) : e.target.value,
                    }))}
                    className="w-full border border-[#F5EDD8] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A520]"
                  />
                )}
              </div>
            ))}

            {/* Gallery (Fase 3) — varias imágenes por producto con toggles
                ★ Portada (la miniatura del catálogo) y 👁 Hover (la que cambia
                al pasar el mouse en la card). */}
            <div>
              <label className="block text-xs font-bold text-[#6B3D1E] mb-1">Galería de imágenes</label>
              <p className="text-[10px] text-[#9B6B45] mb-3">
                Sube varias. Marca <strong>★ Portada</strong> en la principal y <strong>👁 Hover</strong> en la del detalle (la que aparece al pasar el mouse).
              </p>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {gallery.map((img) => (
                  <div key={img.id} className="relative border border-[#F5EDD8] rounded-xl p-2 bg-white">
                    <div className="w-full aspect-square rounded-lg overflow-hidden bg-[#F5EDD8] mb-2">
                      <img
                        src={img.url}
                        alt={img.alt_text ?? ""}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <button
                        type="button"
                        onClick={() => togglePrimary(img.id)}
                        className={`text-[10px] font-bold py-1 px-2 rounded transition-colors ${
                          img.is_primary
                            ? "bg-[#D4A520] text-white"
                            : "bg-white border border-[#F5EDD8] text-[#9B6B45] hover:border-[#D4A520]"
                        }`}
                      >
                        {img.is_primary ? "★ Portada" : "☆ Portada"}
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleHover(img.id)}
                        className={`text-[10px] font-bold py-1 px-2 rounded transition-colors ${
                          img.is_hover
                            ? "bg-[#6B3D1E] text-white"
                            : "bg-white border border-[#F5EDD8] text-[#9B6B45] hover:border-[#6B3D1E]"
                        }`}
                      >
                        👁 Hover
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeGalleryItem(img.id)}
                      title="Eliminar"
                      className="absolute top-1 right-1 bg-white rounded-full p-1 shadow border border-[#F5EDD8] text-[#9B6B45] hover:text-red-500"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}

                {/* Add tile */}
                <label
                  className={`border-2 border-dashed border-[#F5EDD8] rounded-xl flex flex-col items-center justify-center aspect-square cursor-pointer hover:bg-[#FDF8F0] transition-colors ${
                    uploadingGallery ? "opacity-50 cursor-wait" : ""
                  }`}
                >
                  <input
                    ref={galleryRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    className="hidden"
                    disabled={uploadingGallery}
                    onChange={e => { void handleGalleryUpload(e.target.files); e.target.value = ""; }}
                  />
                  {uploadingGallery ? (
                    <>
                      <Upload size={20} className="text-[#9B6B45] animate-pulse" />
                      <span className="text-[10px] text-[#9B6B45] mt-1">Subiendo…</span>
                    </>
                  ) : (
                    <>
                      <Plus size={22} className="text-[#9B6B45]" />
                      <span className="text-[10px] text-[#9B6B45] mt-1 text-center px-1">+ Subir<br/>imágenes</span>
                    </>
                  )}
                </label>
              </div>

              {/* Legacy: si el producto tiene products.image_url pero la galería
                  todavía no se cargó (productos viejos), muestro la portada
                  histórica con una nota. Reemplazar = sube nuevas en la
                  galería y guarda; la primary se sincroniza con image_url. */}
              {gallery.length === 0 && editing.image_url && (
                <div className="mt-3 flex items-center gap-3 border border-[#F5EDD8] bg-[#FDF8F0] rounded-xl p-2">
                  <img
                    src={editing.image_url}
                    alt="legacy"
                    className="w-14 h-14 object-cover rounded-lg border border-[#F5EDD8]"
                  />
                  <p className="text-[10px] text-[#9B6B45]">
                    Portada actual (Fase 1/2). Sube imágenes nuevas arriba para reemplazar y aprovechar el hover.
                  </p>
                </div>
              )}

              <p className="text-[10px] text-[#9B6B45] mt-2">jpg · png · webp — bucket <code>product-images</code> debe ser público.</p>
            </div>

            {/* Variantes — matriz editable de talla × color con stock por
                combinación. Para producto nuevo arranca vacía; para editar
                viene poblada desde product_variants. */}
            <div className="border border-[#F5EDD8] bg-[#FDF8F0] rounded-2xl p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-[#6B3D1E]">
                  Variantes ({variantDrafts.length})
                </p>
                <p className="text-[10px] text-[#9B6B45]">
                  Stock total: {variantDrafts.filter(d => d.active).reduce((s, d) => s + (Number.isFinite(d.stock) ? d.stock : 0), 0)}
                </p>
              </div>

              {variantDrafts.length === 0 ? (
                <p className="text-[11px] text-[#9B6B45] italic">
                  Aún no hay variantes. Agrega al menos una talla / color con stock para guardar.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#F5EDD8] text-[#6B3D1E]">
                        <th className="px-2 py-1.5 text-left  font-bold border border-[#EDD9B4]">Talla</th>
                        <th className="px-2 py-1.5 text-left  font-bold border border-[#EDD9B4]">Color</th>
                        <th className="px-2 py-1.5 text-right font-bold border border-[#EDD9B4]">Stock</th>
                        <th className="px-2 py-1.5 text-right font-bold border border-[#EDD9B4]">Costo</th>
                        <th className="px-2 py-1.5 text-right font-bold border border-[#EDD9B4]">Precio</th>
                        <th className="px-2 py-1.5 text-center font-bold border border-[#EDD9B4]">Activo</th>
                        <th className="px-2 py-1.5 text-center font-bold border border-[#EDD9B4]"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {variantDrafts.map((d, idx) => {
                        const sizeName  = sizes.find(s  => s.id === d.size_id)?.name  ?? "—";
                        const colorObj  = colors.find(c => c.id === d.color_id);
                        const colorName = colorObj?.name ?? "—";
                        const isNewDraft = !d.id;
                        return (
                          <tr key={d.id ?? `new-${idx}`} className={d.active ? "bg-white" : "bg-[#FDF8F0] opacity-60"}>
                            <td className="px-2 py-1.5 border border-[#EDD9B4]">
                              <select
                                value={d.size_id}
                                onChange={e => patchVariantDraft(idx, { size_id: e.target.value })}
                                className="w-full bg-transparent text-xs"
                              >
                                {sizes.filter(s => s.active || s.id === d.size_id).map(s => (
                                  <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                              </select>
                            </td>
                            <td className="px-2 py-1.5 border border-[#EDD9B4]">
                              <div className="flex items-center gap-1.5">
                                {colorObj?.hex_code && (
                                  <span className="inline-block w-3 h-3 rounded-full border border-[#EDD9B4]" style={{ background: colorObj.hex_code }} />
                                )}
                                <select
                                  value={d.color_id}
                                  onChange={e => patchVariantDraft(idx, { color_id: e.target.value })}
                                  className="flex-1 bg-transparent text-xs"
                                >
                                  {colors.filter(c => c.active || c.id === d.color_id).map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                  ))}
                                </select>
                              </div>
                            </td>
                            <td className="px-2 py-1.5 border border-[#EDD9B4] text-right">
                              <input
                                type="number"
                                min={0}
                                value={d.stock}
                                onChange={e => patchVariantDraft(idx, { stock: Number(e.target.value) || 0 })}
                                className="w-16 bg-transparent text-right text-xs"
                              />
                            </td>
                            <td className="px-2 py-1.5 border border-[#EDD9B4] text-right">
                              <input
                                type="number"
                                min={0}
                                step="0.01"
                                placeholder="—"
                                value={d.cost_str}
                                onChange={e => patchVariantDraft(idx, { cost_str: e.target.value })}
                                className="w-16 bg-transparent text-right text-xs"
                                title="Vacío = hereda costo base del producto"
                              />
                            </td>
                            <td className="px-2 py-1.5 border border-[#EDD9B4] text-right">
                              <input
                                type="number"
                                min={0}
                                step="0.01"
                                placeholder="—"
                                value={d.price_override_str}
                                onChange={e => patchVariantDraft(idx, { price_override_str: e.target.value })}
                                className="w-16 bg-transparent text-right text-xs"
                                title="Vacío = hereda precio base del producto"
                              />
                            </td>
                            <td className="px-2 py-1.5 border border-[#EDD9B4] text-center">
                              <input
                                type="checkbox"
                                checked={d.active}
                                onChange={e => patchVariantDraft(idx, { active: e.target.checked })}
                              />
                            </td>
                            <td className="px-2 py-1.5 border border-[#EDD9B4] text-center">
                              <button
                                type="button"
                                onClick={() => removeVariantDraft(idx)}
                                className="text-red-500 hover:text-red-700"
                                title={isNewDraft ? "Quitar de la tabla" : "Eliminar (se desactiva si tiene ventas)"}
                              >
                                <Trash2 size={12} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Inline picker — add a new (size, color, stock) row */}
              <div className="border-t border-[#EDD9B4] pt-3 flex flex-col gap-2">
                <p className="text-[10px] font-bold text-[#9B6B45]">+ Agregar variante</p>
                <div className="grid grid-cols-12 gap-2">
                  <select
                    value={newVariantPicker.size_id}
                    onChange={e => {
                      if (e.target.value === "__new__") { setAddingSize(true); }
                      else { setNewVariantPicker(p => ({ ...p, size_id: e.target.value })); }
                    }}
                    className="col-span-4 border border-[#F5EDD8] rounded-lg px-2 py-1.5 text-xs bg-white"
                  >
                    <option value="">talla</option>
                    {sizes.filter(s => s.active).map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                    <option value="__new__">+ Nueva talla</option>
                  </select>
                  <select
                    value={newVariantPicker.color_id}
                    onChange={e => {
                      if (e.target.value === "__new__") { setAddingColor(true); }
                      else { setNewVariantPicker(p => ({ ...p, color_id: e.target.value })); }
                    }}
                    className="col-span-4 border border-[#F5EDD8] rounded-lg px-2 py-1.5 text-xs bg-white"
                  >
                    <option value="">color</option>
                    {colors.filter(c => c.active).map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                    <option value="__new__">+ Nuevo color</option>
                  </select>
                  <input
                    type="number"
                    min={0}
                    placeholder="stock"
                    value={newVariantPicker.stock}
                    onChange={e => setNewVariantPicker(p => ({ ...p, stock: e.target.value }))}
                    className="col-span-2 border border-[#F5EDD8] rounded-lg px-2 py-1.5 text-xs bg-white text-right"
                  />
                  <button
                    type="button"
                    onClick={addVariantFromPicker}
                    className="col-span-2 bg-[#D4A520] text-white text-xs font-bold rounded-lg px-2 py-1.5 hover:bg-[#A07D10]"
                  >
                    + Agregar
                  </button>
                </div>

                {/* Inline: create new size */}
                {addingSize && (
                  <div className="flex gap-2 items-center bg-white border border-[#D4A520] rounded-lg p-2">
                    <input
                      autoFocus
                      placeholder="Nueva talla (ej. 3M, 6M)"
                      value={newSizeName}
                      onChange={e => setNewSizeName(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === "Enter") { e.preventDefault(); handleAddSize(); }
                        if (e.key === "Escape") { setAddingSize(false); setNewSizeName(""); }
                      }}
                      className="flex-1 border border-[#F5EDD8] rounded-lg px-2 py-1.5 text-xs"
                    />
                    <button type="button" onClick={handleAddSize} disabled={savingAttr || !newSizeName.trim()}
                      className="bg-[#D4A520] text-white text-xs font-bold rounded-lg px-3 py-1.5 hover:bg-[#A07D10] disabled:opacity-50 whitespace-nowrap">
                      {savingAttr ? "..." : "Crear"}
                    </button>
                    <button type="button" onClick={() => { setAddingSize(false); setNewSizeName(""); }}
                      className="border border-[#F5EDD8] text-[#9B6B45] rounded-lg px-2 py-1.5"><X size={14} /></button>
                  </div>
                )}

                {/* Inline: create new color */}
                {addingColor && (
                  <div className="flex gap-2 items-center bg-white border border-[#D4A520] rounded-lg p-2">
                    <input
                      type="color"
                      value={newColorHex}
                      onChange={e => setNewColorHex(e.target.value)}
                      className="w-9 h-9 rounded-lg border border-[#F5EDD8] shrink-0 cursor-pointer"
                      title="Color de muestra"
                    />
                    <input
                      autoFocus
                      placeholder="Nuevo color (ej. Coral)"
                      value={newColorName}
                      onChange={e => setNewColorName(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === "Enter") { e.preventDefault(); handleAddColor(); }
                        if (e.key === "Escape") { setAddingColor(false); setNewColorName(""); }
                      }}
                      className="flex-1 border border-[#F5EDD8] rounded-lg px-2 py-1.5 text-xs"
                    />
                    <button type="button" onClick={handleAddColor} disabled={savingAttr || !newColorName.trim()}
                      className="bg-[#D4A520] text-white text-xs font-bold rounded-lg px-3 py-1.5 hover:bg-[#A07D10] disabled:opacity-50 whitespace-nowrap">
                      {savingAttr ? "..." : "Crear"}
                    </button>
                    <button type="button" onClick={() => { setAddingColor(false); setNewColorName(""); }}
                      className="border border-[#F5EDD8] text-[#9B6B45] rounded-lg px-2 py-1.5"><X size={14} /></button>
                  </div>
                )}

                {pickerError && <p className="text-[11px] text-red-600">{pickerError}</p>}
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-[#6B3D1E] mb-1">Categoría</label>
              {!addingCat ? (
                <select
                  value={editing.category ?? ""}
                  onChange={e => {
                    if (e.target.value === "__new__") { setAddingCat(true); }
                    else { setEditing((prev: any) => ({ ...prev, category: e.target.value })); }
                  }}
                  className="w-full border border-[#F5EDD8] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A520]"
                >
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  <option value="__new__">+ Nueva categoría</option>
                </select>
              ) : (
                <div className="flex gap-2">
                  <input
                    autoFocus
                    placeholder="Nombre de la nueva categoría"
                    value={newCatName}
                    onChange={e => setNewCatName(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === "Enter") { e.preventDefault(); handleAddCategory(); }
                      if (e.key === "Escape") { setAddingCat(false); setNewCatName(""); }
                    }}
                    className="flex-1 border border-[#D4A520] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A520]"
                  />
                  <button
                    onClick={handleAddCategory}
                    disabled={savingCat || !newCatName.trim()}
                    className="px-3 py-2 bg-[#D4A520] text-white text-xs font-bold rounded-xl hover:bg-[#A07D10] disabled:opacity-50 whitespace-nowrap"
                  >
                    {savingCat ? "..." : "Crear"}
                  </button>
                  <button
                    onClick={() => { setAddingCat(false); setNewCatName(""); }}
                    className="px-3 py-2 border border-[#F5EDD8] text-[#9B6B45] text-xs font-bold rounded-xl hover:bg-[#F5EDD8]"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>

            {/* Ofertas — ahora se gestionan desde /admin/ofertas. El flag
                products.has_offer es derivado (trigger DB) y el badge sólo
                aparece cuando hay una oferta vigente que afecta a este
                producto, sea por id o por categoría. */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900">
              <strong>Ofertas:</strong> ya no se marcan aquí. Crea o edita ofertas en{" "}
              <a href="/admin/ofertas" className="underline font-bold">Ofertas</a> — el badge en el
              catálogo se enciende automáticamente cuando una oferta está vigente.
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setEditing(null)}
                className="flex-1 py-2.5 border border-[#F5EDD8] rounded-xl text-[#9B6B45] font-semibold hover:bg-[#F5EDD8] transition-colors text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={save}
                disabled={saving || uploading}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#D4A520] text-white font-bold rounded-xl hover:bg-[#A07D10] transition-colors text-sm disabled:opacity-60"
              >
                <Save size={15} /> {saving ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
