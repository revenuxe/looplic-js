import { useEffect, useRef, useState } from "react";
import { createClient } from "@/src/lib/supabase/client";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Plus, Trash2, Pencil, Loader2, X, Check, Shield, Tag, Smartphone, Layers, ChevronDown, Grid3X3, ListTree, GripVertical, Download, Upload
} from "lucide-react";
import * as XLSX from "xlsx";
import { slugify } from "@/src/lib/slug";
import { convertFileToWebp } from "@/src/lib/images/webp";
import ImageUpload from "./ImageUpload";

const supabase = createClient() as any;

type Brand = { id: string; name: string; slug?: string | null; letter: string; gradient: string; sort_order: number; image_url: string | null; service_type: string };
type Series = { id: string; brand_id: string; name: string; image_url?: string | null };
type Model = { id: string; series_id: string; name: string; image_url?: string | null };
type Guard = { id: string; model_id: string; guard_type: string; price: number; image_url?: string | null };
type GuardCategory = { id: string; name: string };
type GuardType = { id: string; category_id: string; name: string; image_url: string | null; price: number };

const sortByName = <T extends { name: string }>(items: T[]) => [...items].sort((a, b) => a.name.localeCompare(b.name));
const sortBrandsForAdmin = (items: Brand[]) => [...items].sort((a, b) => (a.sort_order - b.sort_order) || a.name.localeCompare(b.name));
const SCREEN_GUARD_IMPORT_TEMPLATE = [
  { Model: "iPhone 14", "Image URL": "https://example.com/images/iphone-14.webp" },
  { Model: "Samsung Galaxy S23", "Image URL": "https://example.com/images/s23.webp" },
];

const normalizeSheetValue = (value: unknown) => String(value ?? "").trim();
const normalizeGuardKey = (value: string) => value.trim().toLowerCase();

const downloadScreenGuardTemplate = () => {
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(SCREEN_GUARD_IMPORT_TEMPLATE);
  XLSX.utils.book_append_sheet(workbook, worksheet, "ScreenGuards");
  XLSX.writeFile(workbook, "screen-guard-import-template.xlsx");
};

const parseScreenGuardImportFile = async (file: File) => {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const firstSheetName = workbook.SheetNames[0];

  if (!firstSheetName) {
    return [];
  }

  const worksheet = workbook.Sheets[firstSheetName];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
    defval: "",
    raw: false,
  });

  return rows.map((row) => ({
    modelName: normalizeSheetValue(row.Model || row.model || row.MODEL),
    imageUrl: normalizeSheetValue(row["Image URL"] || row.image_url || row.image || row.Image),
  }));
};

// ─── Reusable Modal ─────────────────────────────
const Modal = ({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative bg-card w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl border border-border shadow-xl max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-card rounded-t-3xl sm:rounded-t-2xl z-10">
          <span className="text-sm font-bold text-foreground">{title}</span>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-secondary text-muted-foreground"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};

const uploadServiceImage = async (bucket: string, id: string, file: File) => {
  const optimizedFile = await convertFileToWebp(file);
  const path = `${id}.webp`;
  const { error } = await supabase.storage.from(bucket).upload(path, optimizedFile, {
    upsert: true,
    contentType: "image/webp",
    cacheControl: "31536000",
  });
  if (error) return null;
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
};

const hasMissingSlugColumnError = (error: { message?: string } | null | undefined, table: "brands" | "series" | "models") =>
  Boolean(error?.message && error.message.includes(`Could not find the 'slug' column of '${table}' in the schema cache`));

const stripSlugField = <T extends Record<string, unknown>>(payload: T) => {
  const { slug: _slug, ...rest } = payload;
  return rest;
};

const insertWithOptionalSlug = async (table: "brands" | "series" | "models", payload: Record<string, unknown>) => {
  const primaryAttempt = await (supabase.from(table) as any).insert(payload).select().single();
  if (!hasMissingSlugColumnError(primaryAttempt.error, table)) {
    return primaryAttempt;
  }

  return (supabase.from(table) as any).insert(stripSlugField(payload)).select().single();
};

const updateWithOptionalSlug = async (table: "brands" | "series" | "models", id: string, payload: Record<string, unknown>) => {
  const primaryAttempt = await (supabase.from(table) as any).update(payload).eq("id", id);
  if (!hasMissingSlugColumnError(primaryAttempt.error, table)) {
    return primaryAttempt;
  }

  return (supabase.from(table) as any).update(stripSlugField(payload)).eq("id", id);
};

const getBrandByIdWithOptionalSlug = async (brandId: string) => {
  const withSlug = await (supabase.from("brands") as any)
    .select("id, name, slug")
    .eq("id", brandId)
    .maybeSingle();

  if (!hasMissingSlugColumnError(withSlug.error, "brands")) {
    return withSlug;
  }

  const withoutSlug = await (supabase.from("brands") as any)
    .select("id, name")
    .eq("id", brandId)
    .maybeSingle();

  if (!withoutSlug.data) {
    return withoutSlug;
  }

  return {
    ...withoutSlug,
    data: {
      ...withoutSlug.data,
      slug: slugify(withoutSlug.data.name) || withoutSlug.data.id,
    },
  };
};

const getSeriesRevalidationPaths = async (seriesId: string, serviceType: string) => {
  const { data: series } = await (supabase.from("series") as any)
    .select("id, name, slug, brand_id")
    .eq("id", seriesId)
    .maybeSingle();

  if (!series?.brand_id) {
    return [];
  }

  const { data: brand } = await getBrandByIdWithOptionalSlug(series.brand_id);

  if (!brand) {
    return [];
  }

  const brandSlug = brand.slug || slugify(brand.name) || brand.id;
  const seriesSlug = series.slug || slugify(series.name) || series.id;
  const paths = [serviceType === "laptop" ? `/service/laptop-repair/brands/${brandSlug}/${seriesSlug}` : `/brands/${brandSlug}/${seriesSlug}`];

  if (serviceType !== "laptop") {
    paths.push(`/service/mobile-repair/brands/${brandSlug}/${seriesSlug}`);
  }

  return paths;
};

const getModelRevalidationPaths = async (modelId: string, serviceType: string) => {
  const { data: model } = await (supabase.from("models") as any)
    .select("id, name, slug, series_id")
    .eq("id", modelId)
    .maybeSingle();

  if (!model?.series_id) {
    return [];
  }

  const { data: series } = await (supabase.from("series") as any)
    .select("id, name, slug, brand_id")
    .eq("id", model.series_id)
    .maybeSingle();

  if (!series?.brand_id) {
    return [];
  }

  const { data: brand } = await getBrandByIdWithOptionalSlug(series.brand_id);

  if (!brand) {
    return [];
  }

  const brandSlug = brand.slug || slugify(brand.name) || brand.id;
  const seriesSlug = series.slug || slugify(series.name) || series.id;
  const modelSlug = model.slug || slugify(model.name) || model.id;
  const paths = [
    serviceType === "laptop"
      ? `/service/laptop-repair/book/${brandSlug}/${seriesSlug}/${modelSlug}`
      : `/brands/${brandSlug}/${seriesSlug}/${modelSlug}`,
  ];

  if (serviceType !== "laptop") {
    paths.push(`/service/mobile-repair/book/${brandSlug}/${seriesSlug}/${modelSlug}`);
  }

  return paths;
};

const revalidateBrandPages = async (serviceType: string) => {
  const paths =
    serviceType === "laptop"
      ? ["/service/laptop-repair", "/service/laptop-repair/brands"]
      : ["/", "/brands", "/service/mobile-repair", "/service/mobile-repair/brands"];
  const pagePaths =
    serviceType === "laptop"
      ? [
          "/service/[serviceType]",
          "/service/[serviceType]/brands",
          "/service/[serviceType]/brands/[brandSlug]",
          "/service/[serviceType]/brands/[brandSlug]/[seriesSlug]",
          "/service/[serviceType]/book/[brandSlug]/[seriesSlug]/[modelSlug]",
        ]
      : [
          "/",
          "/brands",
          "/brands/[brandSlug]",
          "/brands/[brandSlug]/[seriesSlug]",
          "/brands/[brandSlug]/[seriesSlug]/[modelSlug]",
          "/service/[serviceType]",
          "/service/[serviceType]/brands",
          "/service/[serviceType]/brands/[brandSlug]",
          "/service/[serviceType]/brands/[brandSlug]/[seriesSlug]",
          "/service/[serviceType]/book/[brandSlug]/[seriesSlug]/[modelSlug]",
        ];

  try {
    await fetch("/api/revalidate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        paths,
        pagePaths,
        tags: ["catalog", "catalog-brands", "catalog-series", "catalog-models", "homepage-brands"],
      }),
    });
  } catch {
    // Ignore cache refresh errors so admin writes still succeed.
  }
};

const revalidateCatalogMutation = async (serviceType: string, options?: { exactPaths?: string[]; extraTags?: string[] }) => {
  const exactPaths = options?.exactPaths?.filter(Boolean) ?? [];
  const extraTags = options?.extraTags?.filter(Boolean) ?? [];

  try {
    await fetch("/api/revalidate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        paths: Array.from(new Set([...exactPaths])),
        pagePaths:
          serviceType === "laptop"
            ? [
                "/service/[serviceType]",
                "/service/[serviceType]/brands",
                "/service/[serviceType]/brands/[brandSlug]",
                "/service/[serviceType]/brands/[brandSlug]/[seriesSlug]",
                "/service/[serviceType]/book/[brandSlug]/[seriesSlug]/[modelSlug]",
              ]
            : [
                "/",
                "/brands",
                "/brands/[brandSlug]",
                "/brands/[brandSlug]/[seriesSlug]",
                "/brands/[brandSlug]/[seriesSlug]/[modelSlug]",
                "/service/[serviceType]",
                "/service/[serviceType]/brands",
                "/service/[serviceType]/brands/[brandSlug]",
                "/service/[serviceType]/brands/[brandSlug]/[seriesSlug]",
                "/service/[serviceType]/book/[brandSlug]/[seriesSlug]/[modelSlug]",
              ],
        tags: [
          "catalog",
          "catalog-brands",
          "catalog-series",
          "catalog-models",
          "catalog-screen-guards",
          "homepage-brands",
          ...extraTags,
        ],
      }),
    });
  } catch {
    // Ignore cache refresh errors so admin writes still succeed.
  }
};

// ─── Brands Tab ─────────────────────────────
const BrandsTab = ({ serviceType = "mobile" }: { serviceType?: string }) => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [editBrand, setEditBrand] = useState<Brand | null>(null);
  const [editName, setEditName] = useState("");
  const [editImage, setEditImage] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const [editImageUrl, setEditImageUrl] = useState<string | null>(null);
  const [editSaving, setEditSaving] = useState(false);
  const [moveBrand, setMoveBrand] = useState<Brand | null>(null);
  const [movePosition, setMovePosition] = useState("");
  const [moveSaving, setMoveSaving] = useState(false);

  const fetch = async () => {
    const { data } = await supabase.from("brands").select("*").eq("service_type", serviceType).order("sort_order").order("name");
    if (data) setBrands(data as Brand[]);
  };
  useEffect(() => { fetch(); }, [serviceType]);

  const handleAdd = async () => {
    if (!name.trim()) return;
    setSaving(true);
    const trimmedName = name.trim();
    const { data, error } = await insertWithOptionalSlug("brands", {
      name: trimmedName,
      slug: slugify(trimmedName),
      letter: trimmedName.charAt(0).toUpperCase(),
      gradient: "from-blue-500 to-cyan-500",
      service_type: serviceType,
    } as any);
    if (!error && data) {
      let finalUrl = imageUrl;
      if (image) finalUrl = await uploadServiceImage("brand-images", data.id, image);
      if (finalUrl) await supabase.from("brands").update({ image_url: finalUrl }).eq("id", data.id);
      setBrands((current) =>
        sortBrandsForAdmin([
          ...current,
          {
            ...data,
            image_url: finalUrl ?? data.image_url ?? null,
          } as Brand,
        ]),
      );
    }
    if (error) toast.error(error.message); else { await revalidateBrandPages(serviceType); toast.success("Brand added"); reset(); }
    setSaving(false);
  };

  const openEdit = (b: Brand) => {
    setEditBrand(b);
    setEditName(b.name);
    setEditImagePreview(b.image_url);
    setEditImage(null);
    setEditImageUrl(null);
  };

  const openMove = (brand: Brand, currentIndex: number) => {
    setMoveBrand(brand);
    setMovePosition(String(currentIndex + 1));
  };

  const handleEdit = async () => {
    if (!editBrand || !editName.trim()) return;
    setEditSaving(true);
    const trimmedName = editName.trim();
    const updates: any = { name: trimmedName, slug: slugify(trimmedName), letter: trimmedName.charAt(0).toUpperCase() };
    if (editImageUrl) updates.image_url = editImageUrl;
    else if (editImage) {
      const url = await uploadServiceImage("brand-images", editBrand.id, editImage);
      if (url) updates.image_url = url;
    }
    const { error } = await updateWithOptionalSlug("brands", editBrand.id, updates);
    if (error) {
      toast.error(error.message);
      setEditSaving(false);
      return;
    }
    await revalidateBrandPages(serviceType);
    setBrands((current) => sortBrandsForAdmin(current.map((brand) => (brand.id === editBrand.id ? { ...brand, ...updates } : brand))));
    toast.success("Updated"); setEditBrand(null);
    setEditSaving(false);
  };

  const handleDelete = async (id: string) => {
    await (supabase.from("brands" as any) as any).delete().eq("id", id);
    await revalidateBrandPages(serviceType);
    setBrands((current) => current.filter((brand) => brand.id !== id)); toast.success("Deleted");
  };

  const handleMove = async () => {
    if (!moveBrand || brands.length === 0) return;

    const parsedPosition = Number.parseInt(movePosition, 10);
    if (Number.isNaN(parsedPosition)) {
      toast.error("Enter a valid position");
      return;
    }

    const targetIndex = Math.min(Math.max(parsedPosition, 1), brands.length) - 1;
    const currentIndex = brands.findIndex((brand) => brand.id === moveBrand.id);

    if (currentIndex === -1) {
      toast.error("Brand not found");
      return;
    }

    if (currentIndex === targetIndex) {
      setMoveBrand(null);
      setMovePosition("");
      return;
    }

    const reorderedBrands = [...brands];
    const [selectedBrand] = reorderedBrands.splice(currentIndex, 1);
    reorderedBrands.splice(targetIndex, 0, selectedBrand);

    setMoveSaving(true);

    const updates = reorderedBrands.map((brand, index) =>
      (supabase.from("brands") as any).update({ sort_order: index + 1 }).eq("id", brand.id),
    );

    const results = await Promise.all(updates);
    const failed = results.find((result: any) => result.error);

    if (failed?.error) {
      toast.error(failed.error.message || "Unable to move brand");
    } else {
      await revalidateBrandPages(serviceType);
      setBrands(reorderedBrands.map((brand, index) => ({ ...brand, sort_order: index + 1 })));
      toast.success("Brand position updated");
      setMoveBrand(null);
      setMovePosition("");
    }

    setMoveSaving(false);
  };

  const reset = () => { setShowAdd(false); setName(""); setImage(null); setImagePreview(null); setImageUrl(null); };

  return (
    <div>
      <button onClick={() => setShowAdd(true)} className="mb-4 flex items-center gap-1.5 text-xs font-bold text-primary"><Plus className="w-3.5 h-3.5" /> Add Brand</button>

      <Modal open={showAdd} onClose={reset} title="Add Brand">
        <div className="space-y-3">
          <input placeholder="Brand name" value={name} onChange={(e) => setName(e.target.value)} autoFocus className="w-full text-sm border border-border rounded-xl px-3 py-2.5 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
          <ImageUpload
            preview={imagePreview || imageUrl}
            onFileSelect={(f) => { setImage(f); setImagePreview(URL.createObjectURL(f)); setImageUrl(null); }}
            onUrlSet={(url) => { setImageUrl(url); setImagePreview(null); setImage(null); }}
            onClear={() => { setImage(null); setImagePreview(null); setImageUrl(null); }}
            label="Upload brand logo"
          />
          <button onClick={handleAdd} disabled={saving} className="w-full py-2.5 rounded-xl gradient-brand text-primary-foreground text-xs font-bold disabled:opacity-60 flex items-center justify-center gap-1.5">
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />} Add Brand
          </button>
        </div>
      </Modal>

      <Modal open={!!editBrand} onClose={() => setEditBrand(null)} title="Edit Brand">
        <div className="space-y-3">
          <input placeholder="Brand name" value={editName} onChange={(e) => setEditName(e.target.value)} autoFocus className="w-full text-sm border border-border rounded-xl px-3 py-2.5 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
          <ImageUpload
            preview={editImagePreview || editImageUrl}
            onFileSelect={(f) => { setEditImage(f); setEditImagePreview(URL.createObjectURL(f)); setEditImageUrl(null); }}
            onUrlSet={(url) => { setEditImageUrl(url); setEditImagePreview(null); setEditImage(null); }}
            onClear={() => { setEditImage(null); setEditImagePreview(null); setEditImageUrl(null); }}
            label="Change logo"
          />
          <button onClick={handleEdit} disabled={editSaving} className="w-full py-2.5 rounded-xl gradient-brand text-primary-foreground text-xs font-bold disabled:opacity-60 flex items-center justify-center gap-1.5">
            {editSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />} Save Changes
          </button>
        </div>
      </Modal>

      <Modal
        open={!!moveBrand}
        onClose={() => {
          if (moveSaving) return;
          setMoveBrand(null);
          setMovePosition("");
        }}
        title="Move Brand"
      >
        <div className="space-y-3">
          <div className="text-xs text-muted-foreground">
            {moveBrand ? `Move ${moveBrand.name} to a new position in the brand list.` : ""}
          </div>
          <input
            type="number"
            min={1}
            max={brands.length || 1}
            value={movePosition}
            onChange={(e) => setMovePosition(e.target.value)}
            autoFocus
            placeholder={`1 - ${brands.length}`}
            className="w-full text-sm border border-border rounded-xl px-3 py-2.5 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <button
            onClick={handleMove}
            disabled={moveSaving || !movePosition.trim()}
            className="w-full py-2.5 rounded-xl gradient-brand text-primary-foreground text-xs font-bold disabled:opacity-60 flex items-center justify-center gap-1.5"
          >
            {moveSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <GripVertical className="w-3.5 h-3.5" />} Move Brand
          </button>
        </div>
      </Modal>

      {brands.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground"><Shield className="w-8 h-8 mx-auto mb-2 opacity-30" /><p className="text-sm font-semibold">No brands yet</p></div>
      ) : (
        <div className="space-y-2">
          {brands.map((b, index) => (
            <div key={b.id} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border">
              {b.image_url ? <img src={b.image_url} alt={b.name} className="w-8 h-8 rounded-lg object-contain flex-shrink-0" /> : <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-xs font-bold text-muted-foreground flex-shrink-0">{b.name.charAt(0)}</div>}
              <div className="flex-1 min-w-0">
                <span className="text-sm font-semibold text-foreground truncate block">{b.name}</span>
                <span className="text-[10px] font-semibold text-muted-foreground">Position {index + 1}</span>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => openMove(b, index)} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary" title="Move brand">
                  <GripVertical className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => openEdit(b)} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary"><Pencil className="w-3.5 h-3.5" /></button>
                <button onClick={() => handleDelete(b.id)} className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Series Tab ─────────────────────────────
const SeriesTab = ({ serviceType = "mobile" }: { serviceType?: string }) => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [addImage, setAddImage] = useState<File | null>(null);
  const [addImagePreview, setAddImagePreview] = useState<string | null>(null);
  const [addImageUrl, setAddImageUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [editItem, setEditItem] = useState<Series | null>(null);
  const [editName, setEditName] = useState("");
  const [editImage, setEditImage] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const [editImageUrl, setEditImageUrl] = useState<string | null>(null);
  const [editSaving, setEditSaving] = useState(false);

  useEffect(() => { supabase.from("brands").select("*").eq("service_type", serviceType).order("name").then(({ data }) => { if (data) setBrands(data as Brand[]); }); }, [serviceType]);

  const fetchSeries = async (brandId: string) => {
    const { data } = await supabase.from("series").select("*").eq("brand_id", brandId).order("name");
    if (data) setSeriesList(data as any);
  };

  useEffect(() => { if (selectedBrand) fetchSeries(selectedBrand); else setSeriesList([]); }, [selectedBrand]);

  const handleAdd = async () => {
    if (!name.trim() || !selectedBrand) return;
    setSaving(true);
    const trimmedName = name.trim();
    const insertData: any = { brand_id: selectedBrand, name: trimmedName, slug: slugify(trimmedName) };
    if (addImageUrl) insertData.image_url = addImageUrl;
    const { data, error } = await insertWithOptionalSlug("series", insertData);
    let finalUrl = addImageUrl;
    if (!error && data && addImage) {
      finalUrl = await uploadServiceImage("service-images", `series-${data.id}`, addImage);
      if (finalUrl) await (supabase.from("series") as any).update({ image_url: finalUrl }).eq("id", data.id);
    }
    if (error) toast.error(error.message); else {
      setSeriesList((current) => sortByName([...current, { ...(data as Series), image_url: finalUrl ?? (data as Series).image_url ?? null }]));
      await revalidateCatalogMutation(serviceType, { exactPaths: await getSeriesRevalidationPaths(data.id, serviceType) });
      toast.success("Series added"); setShowAdd(false); setName(""); setAddImage(null); setAddImagePreview(null); setAddImageUrl(null);
    }
    setSaving(false);
  };

  const openEdit = (s: Series) => {
    setEditItem(s); setEditName(s.name); setEditImagePreview(s.image_url || null); setEditImage(null); setEditImageUrl(null);
  };

  const handleEdit = async () => {
    if (!editItem || !editName.trim()) return;
    setEditSaving(true);
    const trimmedName = editName.trim();
    const updates: any = { name: trimmedName, slug: slugify(trimmedName) };
    if (editImageUrl) updates.image_url = editImageUrl;
    else if (editImage) {
      const url = await uploadServiceImage("service-images", `series-${editItem.id}`, editImage);
      if (url) updates.image_url = url;
    }
    const { error } = await updateWithOptionalSlug("series", editItem.id, updates);
    if (error) {
      toast.error(error.message);
      setEditSaving(false);
      return;
    }
    setSeriesList((current) => sortByName(current.map((series) => (series.id === editItem.id ? { ...series, ...updates } : series))));
    await revalidateCatalogMutation(serviceType, { exactPaths: await getSeriesRevalidationPaths(editItem.id, serviceType) });
    toast.success("Updated"); setEditItem(null);
    setEditSaving(false);
  };

  const handleDelete = async (id: string) => {
    await (supabase.from("series" as any) as any).delete().eq("id", id);
    await revalidateCatalogMutation(serviceType);
    setSeriesList((current) => current.filter((series) => series.id !== id)); toast.success("Deleted");
  };

  return (
    <div>
      <div className="mb-4">
        <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Select Brand</label>
        <div className="relative">
          <select value={selectedBrand} onChange={(e) => setSelectedBrand(e.target.value)} className="w-full text-sm border border-border rounded-xl px-3 py-2.5 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 appearance-none">
            <option value="">Choose brand...</option>
            {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      {selectedBrand && <button onClick={() => setShowAdd(true)} className="mb-4 flex items-center gap-1.5 text-xs font-bold text-primary"><Plus className="w-3.5 h-3.5" /> Add Series</button>}

      <Modal open={showAdd} onClose={() => { setShowAdd(false); setName(""); setAddImage(null); setAddImagePreview(null); setAddImageUrl(null); }} title="Add Series">
        <div className="space-y-3">
          <input placeholder="Series name" value={name} onChange={(e) => setName(e.target.value)} autoFocus className="w-full text-sm border border-border rounded-xl px-3 py-2.5 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
          <ImageUpload
            preview={addImagePreview || addImageUrl}
            onFileSelect={(f) => { setAddImage(f); setAddImagePreview(URL.createObjectURL(f)); setAddImageUrl(null); }}
            onUrlSet={(url) => { setAddImageUrl(url); setAddImagePreview(null); setAddImage(null); }}
            onClear={() => { setAddImage(null); setAddImagePreview(null); setAddImageUrl(null); }}
            label="Upload series image"
          />
          <button onClick={handleAdd} disabled={saving} className="w-full py-2.5 rounded-xl gradient-brand text-primary-foreground text-xs font-bold disabled:opacity-60 flex items-center justify-center gap-1.5">
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />} Add Series
          </button>
        </div>
      </Modal>

      <Modal open={!!editItem} onClose={() => setEditItem(null)} title="Edit Series">
        <div className="space-y-3">
          <input placeholder="Series name" value={editName} onChange={(e) => setEditName(e.target.value)} autoFocus className="w-full text-sm border border-border rounded-xl px-3 py-2.5 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
          <ImageUpload
            preview={editImagePreview || editImageUrl}
            onFileSelect={(f) => { setEditImage(f); setEditImagePreview(URL.createObjectURL(f)); setEditImageUrl(null); }}
            onUrlSet={(url) => { setEditImageUrl(url); setEditImagePreview(null); setEditImage(null); }}
            onClear={() => { setEditImage(null); setEditImagePreview(null); setEditImageUrl(null); }}
            label="Change image"
          />
          <button onClick={handleEdit} disabled={editSaving} className="w-full py-2.5 rounded-xl gradient-brand text-primary-foreground text-xs font-bold disabled:opacity-60 flex items-center justify-center gap-1.5">
            {editSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />} Save Changes
          </button>
        </div>
      </Modal>

      {!selectedBrand ? <p className="text-xs text-muted-foreground text-center py-8">Select a brand first</p> : seriesList.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground"><Layers className="w-8 h-8 mx-auto mb-2 opacity-30" /><p className="text-sm font-semibold">No series yet</p></div>
      ) : (
        <div className="space-y-2">
          {seriesList.map((s) => (
            <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border">
              {s.image_url ? <img src={s.image_url} alt={s.name} className="w-8 h-8 rounded-lg object-contain flex-shrink-0" /> : <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0"><Layers className="w-4 h-4 text-muted-foreground" /></div>}
              <span className="flex-1 text-sm font-semibold text-foreground truncate">{s.name}</span>
              <div className="flex items-center gap-1">
                <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary"><Pencil className="w-3.5 h-3.5" /></button>
                <button onClick={() => handleDelete(s.id)} className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Models Tab ─────────────────────────────
const ModelsTab = ({ serviceType = "mobile" }: { serviceType?: string }) => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedSeries, setSelectedSeries] = useState("");
  const [models, setModels] = useState<Model[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [addImage, setAddImage] = useState<File | null>(null);
  const [addImagePreview, setAddImagePreview] = useState<string | null>(null);
  const [addImageUrl, setAddImageUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [editItem, setEditItem] = useState<Model | null>(null);
  const [editName, setEditName] = useState("");
  const [editImage, setEditImage] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const [editImageUrl, setEditImageUrl] = useState<string | null>(null);
  const [editSaving, setEditSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const importInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => { supabase.from("brands").select("*").eq("service_type", serviceType).order("name").then(({ data }) => { if (data) setBrands(data as Brand[]); }); }, [serviceType]);
  useEffect(() => { if (selectedBrand) { supabase.from("series").select("*").eq("brand_id", selectedBrand).order("name").then(({ data }) => { if (data) setSeriesList(data as any); }); } else { setSeriesList([]); } setSelectedSeries(""); }, [selectedBrand]);

  const fetchModels = async (seriesId: string) => {
    const { data } = await supabase.from("models").select("*").eq("series_id", seriesId).order("name");
    if (data) setModels(data as any);
  };

  useEffect(() => { if (selectedSeries) fetchModels(selectedSeries); else setModels([]); }, [selectedSeries]);

  const handleAdd = async () => {
    if (!name.trim() || !selectedSeries) return;
    setSaving(true);
    const trimmedName = name.trim();
    const insertData: any = { series_id: selectedSeries, name: trimmedName, slug: slugify(trimmedName) };
    if (addImageUrl) insertData.image_url = addImageUrl;
    const { data, error } = await insertWithOptionalSlug("models", insertData);
    let finalUrl = addImageUrl;
    if (!error && data && addImage) {
      finalUrl = await uploadServiceImage("service-images", `model-${data.id}`, addImage);
      if (finalUrl) await (supabase.from("models") as any).update({ image_url: finalUrl }).eq("id", data.id);
    }
    if (error) toast.error(error.message); else {
      setModels((current) => sortByName([...current, { ...(data as Model), image_url: finalUrl ?? (data as Model).image_url ?? null }]));
      await revalidateCatalogMutation(serviceType, { exactPaths: await getModelRevalidationPaths(data.id, serviceType) });
      toast.success("Model added"); setShowAdd(false); setName(""); setAddImage(null); setAddImagePreview(null); setAddImageUrl(null);
    }
    setSaving(false);
  };

  const openEdit = (m: Model) => {
    setEditItem(m); setEditName(m.name); setEditImagePreview(m.image_url || null); setEditImage(null); setEditImageUrl(null);
  };

  const handleEdit = async () => {
    if (!editItem || !editName.trim()) return;
    setEditSaving(true);
    const trimmedName = editName.trim();
    const updates: any = { name: trimmedName, slug: slugify(trimmedName) };
    if (editImageUrl) updates.image_url = editImageUrl;
    else if (editImage) {
      const url = await uploadServiceImage("service-images", `model-${editItem.id}`, editImage);
      if (url) updates.image_url = url;
    }
    const { error } = await updateWithOptionalSlug("models", editItem.id, updates);
    if (error) {
      toast.error(error.message);
      setEditSaving(false);
      return;
    }
    setModels((current) => sortByName(current.map((model) => (model.id === editItem.id ? { ...model, ...updates } : model))));
    await revalidateCatalogMutation(serviceType, { exactPaths: await getModelRevalidationPaths(editItem.id, serviceType) });
    toast.success("Updated"); setEditItem(null);
    setEditSaving(false);
  };

  const handleDelete = async (id: string) => {
    await (supabase.from("models" as any) as any).delete().eq("id", id);
    await revalidateCatalogMutation(serviceType);
    setModels((current) => current.filter((model) => model.id !== id)); toast.success("Deleted");
  };

  const handleImportFile = async (file: File) => {
    setImporting(true);

    try {
      const rows = await parseScreenGuardImportFile(file);
      const validRows = rows.filter((row) => row.modelName || row.imageUrl);

      if (validRows.length === 0) {
        toast.error("The uploaded sheet is empty.");
        return;
      }

      const { data: allModels, error: modelsError } = await supabase.from("models").select("id, name, series_id");
      if (modelsError || !allModels) {
        toast.error(modelsError?.message || "Unable to load models for import.");
        return;
      }

      const modelMatches = new Map<string, Array<{ id: string; name: string; series_id: string }>>();
      for (const model of allModels as Array<{ id: string; name: string; series_id: string }>) {
        const key = normalizeGuardKey(model.name);
        modelMatches.set(key, [...(modelMatches.get(key) || []), model]);
      }

      const touchedModelIds = new Set<string>();
      let updatedCount = 0;
      const skipped: string[] = [];

      for (const [index, row] of validRows.entries()) {
        if (!row.modelName || !row.imageUrl) {
          skipped.push(`Row ${index + 2}: missing Model or Image URL`);
          continue;
        }

        const matches = modelMatches.get(normalizeGuardKey(row.modelName)) || [];
        if (matches.length === 0) {
          skipped.push(`Row ${index + 2}: model "${row.modelName}" not found`);
          continue;
        }

        const scopedMatches = selectedSeries ? matches.filter((model) => model.series_id === selectedSeries) : matches;
        if (scopedMatches.length === 0) {
          skipped.push(`Row ${index + 2}: model "${row.modelName}" is outside the selected series`);
          continue;
        }
        if (scopedMatches.length > 1) {
          skipped.push(`Row ${index + 2}: model "${row.modelName}" matched multiple records`);
          continue;
        }

        const model = scopedMatches[0];
        const { error } = await (supabase.from("models") as any).update({ image_url: row.imageUrl }).eq("id", model.id);
        if (error) {
          skipped.push(`Row ${index + 2}: ${error.message}`);
          continue;
        }

        updatedCount += 1;
        touchedModelIds.add(model.id);
      }

      if (touchedModelIds.size > 0) {
        const exactPaths = (
          await Promise.all(Array.from(touchedModelIds).map((modelId) => getModelRevalidationPaths(modelId, serviceType)))
        ).flat();
        await revalidateCatalogMutation(serviceType, { exactPaths });
      }

      if (selectedSeries) {
        await fetchModels(selectedSeries);
      }

      if (updatedCount) {
        toast.success(`Import complete: ${updatedCount} model image${updatedCount === 1 ? "" : "s"} updated${skipped.length ? `, ${skipped.length} skipped` : ""}.`);
      } else {
        toast.error(skipped[0] || "No rows were imported.");
      }

      if (skipped.length) {
        console.warn("Model image import skipped rows:", skipped);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to import this file.");
    } finally {
      setImporting(false);
      if (importInputRef.current) {
        importInputRef.current.value = "";
      }
    }
  };

  return (
    <div>
      <div className="mb-4 rounded-2xl border border-border bg-card p-4 shadow-card-brand">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm font-black text-foreground">Bulk Import Model Images</div>
            <p className="mt-1 text-xs text-muted-foreground">Use this in the model section with only two columns in the sheet: Model and Image URL.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={downloadScreenGuardTemplate} type="button" className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-2 text-xs font-bold text-foreground transition-colors hover:border-primary/30 hover:text-primary">
              <Download className="h-3.5 w-3.5" /> Download Template
            </button>
            <button onClick={() => importInputRef.current?.click()} type="button" disabled={importing} className="inline-flex items-center gap-1.5 rounded-xl gradient-brand px-3 py-2 text-xs font-bold text-primary-foreground disabled:opacity-60">
              {importing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />} Upload Sheet
            </button>
            <input
              ref={importInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  void handleImportFile(file);
                }
              }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Brand</label>
          <div className="relative">
            <select value={selectedBrand} onChange={(e) => setSelectedBrand(e.target.value)} className="w-full text-sm border border-border rounded-xl px-3 py-2.5 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 appearance-none">
              <option value="">Choose...</option>
              {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Series</label>
          <div className="relative">
            <select value={selectedSeries} onChange={(e) => setSelectedSeries(e.target.value)} disabled={!selectedBrand} className="w-full text-sm border border-border rounded-xl px-3 py-2.5 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 appearance-none disabled:opacity-50">
              <option value="">Choose...</option>
              {seriesList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      </div>

      {selectedSeries && <button onClick={() => setShowAdd(true)} className="mb-4 flex items-center gap-1.5 text-xs font-bold text-primary"><Plus className="w-3.5 h-3.5" /> Add Model</button>}

      <Modal open={showAdd} onClose={() => { setShowAdd(false); setName(""); setAddImage(null); setAddImagePreview(null); setAddImageUrl(null); }} title="Add Model">
        <div className="space-y-3">
          <input placeholder="Model name" value={name} onChange={(e) => setName(e.target.value)} autoFocus className="w-full text-sm border border-border rounded-xl px-3 py-2.5 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
          <ImageUpload
            preview={addImagePreview || addImageUrl}
            onFileSelect={(f) => { setAddImage(f); setAddImagePreview(URL.createObjectURL(f)); setAddImageUrl(null); }}
            onUrlSet={(url) => { setAddImageUrl(url); setAddImagePreview(null); setAddImage(null); }}
            onClear={() => { setAddImage(null); setAddImagePreview(null); setAddImageUrl(null); }}
            label="Upload model image"
          />
          <button onClick={handleAdd} disabled={saving} className="w-full py-2.5 rounded-xl gradient-brand text-primary-foreground text-xs font-bold disabled:opacity-60 flex items-center justify-center gap-1.5">
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />} Add Model
          </button>
        </div>
      </Modal>

      <Modal open={!!editItem} onClose={() => setEditItem(null)} title="Edit Model">
        <div className="space-y-3">
          <input placeholder="Model name" value={editName} onChange={(e) => setEditName(e.target.value)} autoFocus className="w-full text-sm border border-border rounded-xl px-3 py-2.5 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
          <ImageUpload
            preview={editImagePreview || editImageUrl}
            onFileSelect={(f) => { setEditImage(f); setEditImagePreview(URL.createObjectURL(f)); setEditImageUrl(null); }}
            onUrlSet={(url) => { setEditImageUrl(url); setEditImagePreview(null); setEditImage(null); }}
            onClear={() => { setEditImage(null); setEditImagePreview(null); setEditImageUrl(null); }}
            label="Change image"
          />
          <button onClick={handleEdit} disabled={editSaving} className="w-full py-2.5 rounded-xl gradient-brand text-primary-foreground text-xs font-bold disabled:opacity-60 flex items-center justify-center gap-1.5">
            {editSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />} Save Changes
          </button>
        </div>
      </Modal>

      {!selectedSeries ? <p className="text-xs text-muted-foreground text-center py-8">{!selectedBrand ? "Select brand & series" : "Select a series"}</p> : models.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground"><Smartphone className="w-8 h-8 mx-auto mb-2 opacity-30" /><p className="text-sm font-semibold">No models yet</p></div>
      ) : (
        <div className="space-y-2">
          {models.map((m) => (
            <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border">
              {m.image_url ? <img src={m.image_url} alt={m.name} className="w-8 h-8 rounded-lg object-contain flex-shrink-0" /> : <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0"><Smartphone className="w-4 h-4 text-muted-foreground" /></div>}
              <span className="flex-1 text-sm font-semibold text-foreground truncate">{m.name}</span>
              <div className="flex items-center gap-1">
                <button onClick={() => openEdit(m)} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary"><Pencil className="w-3.5 h-3.5" /></button>
                <button onClick={() => handleDelete(m.id)} className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Screen Guards Tab (Categories + Types with Image, Price & Edit) ─────────────────────────────
const ScreenGuardsManageTab = () => {
  const [categories, setCategories] = useState<GuardCategory[]>([]);
  const [types, setTypes] = useState<GuardType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCat, setSelectedCat] = useState("");
  const [showAddCat, setShowAddCat] = useState(false);
  const [showAddType, setShowAddType] = useState(false);
  const [catName, setCatName] = useState("");
  const [typeName, setTypeName] = useState("");
  const [typePrice, setTypePrice] = useState("");
  const [typeImage, setTypeImage] = useState<File | null>(null);
  const [typeImagePreview, setTypeImagePreview] = useState<string | null>(null);
  const [typeImageUrl, setTypeImageUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [editCatId, setEditCatId] = useState<string | null>(null);
  const [editCatName, setEditCatName] = useState("");
  const [editTypeId, setEditTypeId] = useState<string | null>(null);
  const [editTypeName, setEditTypeName] = useState("");
  const [editTypePrice, setEditTypePrice] = useState("");
  const [showEditType, setShowEditType] = useState(false);
  const [editTypeImage, setEditTypeImage] = useState<File | null>(null);
  const [editTypeImagePreview, setEditTypeImagePreview] = useState<string | null>(null);
  const [editTypeImageUrl, setEditTypeImageUrl] = useState<string | null>(null);
  const [editSaving, setEditSaving] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    const { data } = await supabase.from("screen_guard_categories").select("*").order("name");
    if (data) setCategories(data);
    setLoading(false);
  };

  const fetchTypes = async (catId: string) => {
    const { data } = await supabase.from("screen_guard_types").select("*").eq("category_id", catId).order("name");
    if (data) setTypes(data as GuardType[]);
  };

  useEffect(() => { fetchCategories(); }, []);
  useEffect(() => { if (selectedCat) fetchTypes(selectedCat); else setTypes([]); }, [selectedCat]);

  const uploadTypeImage = async (id: string, file: File) => {
    const optimizedFile = await convertFileToWebp(file);
    const path = `${id}.webp`;
    const { error } = await supabase.storage.from("guard-type-images").upload(path, optimizedFile, {
      upsert: true,
      contentType: "image/webp",
      cacheControl: "31536000",
    });
    if (error) return null;
    return supabase.storage.from("guard-type-images").getPublicUrl(path).data.publicUrl;
  };

  const handleAddCat = async () => {
    if (!catName.trim()) return;
    setSaving(true);
    const { error } = await supabase.from("screen_guard_categories").insert({ name: catName.trim() });
    if (error) toast.error(error.message); else { toast.success("Category added"); setShowAddCat(false); setCatName(""); fetchCategories(); }
    setSaving(false);
  };

  const handleEditCat = async (id: string) => {
    if (!editCatName.trim()) return;
    await (supabase.from("screen_guard_categories" as any) as any).update({ name: editCatName.trim() }).eq("id", id);
    setEditCatId(null); fetchCategories(); toast.success("Updated");
  };

  const handleDeleteCat = async (id: string) => {
    await (supabase.from("screen_guard_categories" as any) as any).delete().eq("id", id);
    if (selectedCat === id) { setSelectedCat(""); setTypes([]); }
    fetchCategories(); toast.success("Deleted");
  };

  const handleAddType = async () => {
    if (!typeName.trim() || !selectedCat) return;
    setSaving(true);
    const insertData: any = { category_id: selectedCat, name: typeName.trim(), price: typePrice ? parseFloat(typePrice) : 0 };
    if (typeImageUrl) insertData.image_url = typeImageUrl;
    const { data, error } = await (supabase.from("screen_guard_types") as any).insert(insertData).select().single();
    if (!error && data && typeImage) {
      const url = await uploadTypeImage(data.id, typeImage);
      if (url) await (supabase.from("screen_guard_types" as any) as any).update({ image_url: url }).eq("id", data.id);
    }
    if (error) toast.error(error.message); else { toast.success("Type added"); resetTypeForm(); fetchTypes(selectedCat); }
    setSaving(false);
  };

  const resetTypeForm = () => {
    setShowAddType(false); setTypeName(""); setTypePrice(""); setTypeImage(null); setTypeImagePreview(null); setTypeImageUrl(null);
  };

  const handleDeleteType = async (id: string) => {
    await (supabase.from("screen_guard_types" as any) as any).delete().eq("id", id);
    fetchTypes(selectedCat); toast.success("Deleted");
  };

  const openEditType = (t: GuardType) => {
    setEditTypeId(t.id); setEditTypeName(t.name); setEditTypePrice(String(t.price));
    setEditTypeImagePreview(t.image_url); setEditTypeImage(null); setEditTypeImageUrl(null); setShowEditType(true);
  };

  const handleEditType = async () => {
    if (!editTypeId || !editTypeName.trim()) return;
    setEditSaving(true);
    const updates: any = { name: editTypeName.trim(), price: editTypePrice ? parseFloat(editTypePrice) : 0 };
    if (editTypeImageUrl) updates.image_url = editTypeImageUrl;
    else if (editTypeImage) {
      const url = await uploadTypeImage(editTypeId, editTypeImage);
      if (url) updates.image_url = url;
    }
    await (supabase.from("screen_guard_types" as any) as any).update(updates).eq("id", editTypeId);
    toast.success("Updated"); setShowEditType(false); setEditTypeId(null); fetchTypes(selectedCat);
    setEditSaving(false);
  };

  return (
    <div>
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-foreground">Screen Guard Categories</span>
          <button onClick={() => setShowAddCat(true)} className="flex items-center gap-1 text-[10px] font-bold text-primary"><Plus className="w-3 h-3" /> Add Category</button>
        </div>

        <Modal open={showAddCat} onClose={() => { setShowAddCat(false); setCatName(""); }} title="Add Category">
          <div className="space-y-3">
            <input placeholder="Category name (e.g. Flat Screen)" value={catName} onChange={(e) => setCatName(e.target.value)} autoFocus className="w-full text-sm border border-border rounded-xl px-3 py-2.5 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
            <button onClick={handleAddCat} disabled={saving} className="w-full py-2.5 rounded-xl gradient-brand text-primary-foreground text-xs font-bold disabled:opacity-60 flex items-center justify-center gap-1.5">
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />} Add Category
            </button>
          </div>
        </Modal>

        {loading ? <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div> : categories.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground"><Grid3X3 className="w-8 h-8 mx-auto mb-2 opacity-30" /><p className="text-xs font-semibold">No categories yet</p></div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <div key={c.id} className={`relative group flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 cursor-pointer transition-all text-xs font-bold ${selectedCat === c.id ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-foreground hover:border-primary/40"}`}>
                <button onClick={() => setSelectedCat(selectedCat === c.id ? "" : c.id)} className="flex-1 text-left">
                  {editCatId === c.id ? (
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <input value={editCatName} onChange={(e) => setEditCatName(e.target.value)} autoFocus onKeyDown={(e) => e.key === "Enter" && handleEditCat(c.id)} className="w-20 text-xs border border-border rounded-lg px-1.5 py-0.5 bg-background text-foreground focus:outline-none" />
                      <button onClick={() => handleEditCat(c.id)} className="text-primary"><Check className="w-3 h-3" /></button>
                      <button onClick={() => setEditCatId(null)} className="text-muted-foreground"><X className="w-3 h-3" /></button>
                    </div>
                  ) : c.name}
                </button>
                {editCatId !== c.id && (
                  <div className="flex items-center gap-0.5">
                    <button onClick={(e) => { e.stopPropagation(); setEditCatId(c.id); setEditCatName(c.name); }} className="p-0.5 text-muted-foreground hover:text-foreground"><Pencil className="w-2.5 h-2.5" /></button>
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteCat(c.id); }} className="p-0.5 text-muted-foreground hover:text-destructive"><Trash2 className="w-2.5 h-2.5" /></button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedCat && (
        <div className="border-t border-border pt-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-foreground">Types in "{categories.find(c => c.id === selectedCat)?.name}"</span>
            <button onClick={() => setShowAddType(true)} className="flex items-center gap-1 text-[10px] font-bold text-primary"><Plus className="w-3 h-3" /> Add Type</button>
          </div>

          <Modal open={showAddType} onClose={resetTypeForm} title="Add Guard Type">
            <div className="space-y-3">
              <input placeholder="Type name (e.g. 11D, Privacy, Matte)" value={typeName} onChange={(e) => setTypeName(e.target.value)} autoFocus className="w-full text-sm border border-border rounded-xl px-3 py-2.5 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Price (₹)</label>
                <input type="number" placeholder="99" value={typePrice} onChange={(e) => setTypePrice(e.target.value)} className="w-full text-sm border border-border rounded-xl px-3 py-2.5 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <ImageUpload
                preview={typeImagePreview || typeImageUrl}
                onFileSelect={(f) => { setTypeImage(f); setTypeImagePreview(URL.createObjectURL(f)); setTypeImageUrl(null); }}
                onUrlSet={(url) => { setTypeImageUrl(url); setTypeImagePreview(null); setTypeImage(null); }}
                onClear={() => { setTypeImage(null); setTypeImagePreview(null); setTypeImageUrl(null); }}
                label="Upload guard image"
              />
              <button onClick={handleAddType} disabled={saving} className="w-full py-2.5 rounded-xl gradient-brand text-primary-foreground text-xs font-bold disabled:opacity-60 flex items-center justify-center gap-1.5">
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />} Add Type
              </button>
            </div>
          </Modal>

          <Modal open={showEditType} onClose={() => { setShowEditType(false); setEditTypeId(null); }} title="Edit Guard Type">
            <div className="space-y-3">
              <input placeholder="Type name" value={editTypeName} onChange={(e) => setEditTypeName(e.target.value)} autoFocus className="w-full text-sm border border-border rounded-xl px-3 py-2.5 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Price (₹)</label>
                <input type="number" placeholder="99" value={editTypePrice} onChange={(e) => setEditTypePrice(e.target.value)} className="w-full text-sm border border-border rounded-xl px-3 py-2.5 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <ImageUpload
                preview={editTypeImagePreview || editTypeImageUrl}
                onFileSelect={(f) => { setEditTypeImage(f); setEditTypeImagePreview(URL.createObjectURL(f)); setEditTypeImageUrl(null); }}
                onUrlSet={(url) => { setEditTypeImageUrl(url); setEditTypeImagePreview(null); setEditTypeImage(null); }}
                onClear={() => { setEditTypeImage(null); setEditTypeImagePreview(null); setEditTypeImageUrl(null); }}
                label="Change image"
              />
              <button onClick={handleEditType} disabled={editSaving} className="w-full py-2.5 rounded-xl gradient-brand text-primary-foreground text-xs font-bold disabled:opacity-60 flex items-center justify-center gap-1.5">
                {editSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />} Save Changes
              </button>
            </div>
          </Modal>

          {types.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground"><p className="text-xs font-semibold">No types yet</p></div>
          ) : (
            <div className="space-y-2">
              {types.map((t) => (
                <div key={t.id} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border">
                  {t.image_url ? <img src={t.image_url} alt={t.name} className="w-8 h-8 rounded-lg object-contain flex-shrink-0" /> : <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0"><Shield className="w-4 h-4 text-muted-foreground" /></div>}
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-bold text-foreground">{t.name}</span>
                    <span className="ml-2 text-sm font-extrabold text-primary">₹{t.price}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEditType(t)} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary"><Pencil className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDeleteType(t.id)} className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Model Guards Assignment Tab ─────────────────────────────
const ModelGuardsTab = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedSeries, setSelectedSeries] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [guards, setGuards] = useState<Guard[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [categories, setCategories] = useState<GuardCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => { supabase.from("brands").select("*").eq("service_type", "mobile").order("name").then(({ data }) => { if (data) setBrands(data as Brand[]); }); }, []);
  useEffect(() => { supabase.from("screen_guard_categories").select("*").order("name").then(({ data }) => { if (data) setCategories(data); }); }, []);
  useEffect(() => { if (selectedBrand) { supabase.from("series").select("*").eq("brand_id", selectedBrand).order("name").then(({ data }) => { if (data) setSeriesList(data as any); }); } else setSeriesList([]); setSelectedSeries(""); }, [selectedBrand]);
  useEffect(() => { if (selectedSeries) { supabase.from("models").select("*").eq("series_id", selectedSeries).order("name").then(({ data }) => { if (data) setModels(data as any); }); } else setModels([]); setSelectedModel(""); }, [selectedSeries]);

  const fetchGuards = async (modelId: string) => {
    setLoading(true);
    const { data } = await supabase.from("model_screen_guards").select("*").eq("model_id", modelId).order("guard_type");
    if (data) setGuards(data);
    setLoading(false);
  };

  useEffect(() => { if (selectedModel) fetchGuards(selectedModel); else setGuards([]); }, [selectedModel]);

  const handleAssignCategory = async () => {
    if (!selectedModel || !selectedCategory) return;
    setSaving(true);
    const { data: guardTypes } = await supabase.from("screen_guard_types").select("*").eq("category_id", selectedCategory).order("name");
    if (!guardTypes || guardTypes.length === 0) { toast.error("No guard types in this category"); setSaving(false); return; }
    const inserts = (guardTypes as GuardType[]).map(t => ({ model_id: selectedModel, guard_type: t.name, image_url: t.image_url, price: t.price }));
    const { error } = await supabase.from("model_screen_guards").insert(inserts);
    if (error) toast.error(error.message); else { await revalidateCatalogMutation("mobile", { exactPaths: await getModelRevalidationPaths(selectedModel, "mobile") }); toast.success(`${inserts.length} guards assigned`); setShowAdd(false); setSelectedCategory(""); fetchGuards(selectedModel); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    await (supabase.from("model_screen_guards" as any) as any).delete().eq("id", id);
    await revalidateCatalogMutation("mobile", { exactPaths: await getModelRevalidationPaths(selectedModel, "mobile") });
    fetchGuards(selectedModel); toast.success("Deleted");
  };

  return (
    <div>
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div>
          <label className="text-[10px] font-semibold text-muted-foreground mb-1 block">Brand</label>
          <div className="relative">
            <select value={selectedBrand} onChange={(e) => setSelectedBrand(e.target.value)} className="w-full text-xs border border-border rounded-xl px-2 py-2.5 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 appearance-none">
              <option value="">Choose...</option>
              {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
          </div>
        </div>
        <div>
          <label className="text-[10px] font-semibold text-muted-foreground mb-1 block">Series</label>
          <div className="relative">
            <select value={selectedSeries} onChange={(e) => setSelectedSeries(e.target.value)} disabled={!selectedBrand} className="w-full text-xs border border-border rounded-xl px-2 py-2.5 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 appearance-none disabled:opacity-50">
              <option value="">Choose...</option>
              {seriesList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
          </div>
        </div>
        <div>
          <label className="text-[10px] font-semibold text-muted-foreground mb-1 block">Model</label>
          <div className="relative">
            <select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)} disabled={!selectedSeries} className="w-full text-xs border border-border rounded-xl px-2 py-2.5 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 appearance-none disabled:opacity-50">
              <option value="">Choose...</option>
              {models.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      </div>

      {selectedModel && <button onClick={() => setShowAdd(true)} className="mb-4 flex items-center gap-1.5 text-xs font-bold text-primary"><Plus className="w-3.5 h-3.5" /> Assign Guards</button>}

      <Modal open={showAdd} onClose={() => { setShowAdd(false); setSelectedCategory(""); }} title="Assign Screen Guards">
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">Select a category to assign all its guard types with their prices to this model.</p>
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">Category</label>
            <div className="relative">
              <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-full text-sm border border-border rounded-xl px-3 py-2.5 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 appearance-none">
                <option value="">Choose category...</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>
          <button onClick={handleAssignCategory} disabled={saving || !selectedCategory} className="w-full py-2.5 rounded-xl gradient-brand text-primary-foreground text-xs font-bold disabled:opacity-60 flex items-center justify-center gap-1.5">
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Layers className="w-3.5 h-3.5" />} Assign All Types
          </button>
        </div>
      </Modal>

      {!selectedModel ? <p className="text-xs text-muted-foreground text-center py-8">Select brand, series & model</p> : loading ? <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div> : guards.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground"><Tag className="w-8 h-8 mx-auto mb-2 opacity-30" /><p className="text-sm font-semibold">No guards yet</p></div>
      ) : (
        <div className="space-y-2">
          {guards.map((g) => (
            <div key={g.id} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border">
              {g.image_url ? <img src={g.image_url} alt={g.guard_type} className="w-8 h-8 rounded-lg object-contain flex-shrink-0" /> : <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0"><Shield className="w-4 h-4 text-muted-foreground" /></div>}
              <div className="flex-1"><span className="text-sm font-bold text-foreground">{g.guard_type}</span><span className="ml-2 text-sm font-extrabold text-primary">₹{g.price}</span></div>
              <button onClick={() => handleDelete(g.id)} className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Repair Categories Tab (for Mobile/Laptop) ─────────────────────────────
type RepairCategory = { id: string; name: string; service_type: string; image_url?: string | null };

const RepairCategoriesTab = ({ serviceType }: { serviceType: string }) => {
  const [categories, setCategories] = useState<RepairCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [addImage, setAddImage] = useState<File | null>(null);
  const [addImagePreview, setAddImagePreview] = useState<string | null>(null);
  const [addImageUrl, setAddImageUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [editItem, setEditItem] = useState<RepairCategory | null>(null);
  const [editName, setEditName] = useState("");
  const [editImage, setEditImage] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const [editImageUrl, setEditImageUrl] = useState<string | null>(null);
  const [editSaving, setEditSaving] = useState(false);

  const fetchCats = async () => {
    setLoading(true);
    const { data } = await (supabase.from("repair_categories") as any).select("*").eq("service_type", serviceType).order("name");
    if (data) setCategories(data);
    setLoading(false);
  };

  useEffect(() => { fetchCats(); }, [serviceType]);

  const handleAdd = async () => {
    if (!name.trim()) return;
    setSaving(true);
    const insertData: any = { name: name.trim(), service_type: serviceType };
    if (addImageUrl) insertData.image_url = addImageUrl;
    const { data, error } = await (supabase.from("repair_categories") as any).insert(insertData).select().single();
    if (!error && data && addImage) {
      const url = await uploadServiceImage("service-images", `repair-${data.id}`, addImage);
      if (url) await (supabase.from("repair_categories") as any).update({ image_url: url }).eq("id", data.id);
    }
    if (error) toast.error(error.message); else { toast.success("Category added"); setShowAdd(false); setName(""); setAddImage(null); setAddImagePreview(null); setAddImageUrl(null); fetchCats(); }
    setSaving(false);
  };

  const openEdit = (c: RepairCategory) => {
    setEditItem(c); setEditName(c.name); setEditImagePreview(c.image_url || null); setEditImage(null); setEditImageUrl(null);
  };

  const handleEdit = async () => {
    if (!editItem || !editName.trim()) return;
    setEditSaving(true);
    const updates: any = { name: editName.trim() };
    if (editImageUrl) updates.image_url = editImageUrl;
    else if (editImage) {
      const url = await uploadServiceImage("service-images", `repair-${editItem.id}`, editImage);
      if (url) updates.image_url = url;
    }
    await (supabase.from("repair_categories") as any).update(updates).eq("id", editItem.id);
    toast.success("Updated"); setEditItem(null); fetchCats();
    setEditSaving(false);
  };

  const handleDelete = async (id: string) => {
    await (supabase.from("repair_categories" as any) as any).delete().eq("id", id);
    fetchCats(); toast.success("Deleted");
  };

  return (
    <div>
      <button onClick={() => setShowAdd(true)} className="mb-4 flex items-center gap-1.5 text-xs font-bold text-primary"><Plus className="w-3.5 h-3.5" /> Add Repair Category</button>

      <Modal open={showAdd} onClose={() => { setShowAdd(false); setName(""); setAddImage(null); setAddImagePreview(null); setAddImageUrl(null); }} title="Add Repair Category">
        <div className="space-y-3">
          <input placeholder="e.g. Screen Replacement" value={name} onChange={(e) => setName(e.target.value)} autoFocus className="w-full text-sm border border-border rounded-xl px-3 py-2.5 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
          <ImageUpload
            preview={addImagePreview || addImageUrl}
            onFileSelect={(f) => { setAddImage(f); setAddImagePreview(URL.createObjectURL(f)); setAddImageUrl(null); }}
            onUrlSet={(url) => { setAddImageUrl(url); setAddImagePreview(null); setAddImage(null); }}
            onClear={() => { setAddImage(null); setAddImagePreview(null); setAddImageUrl(null); }}
            label="Upload category image"
          />
          <button onClick={handleAdd} disabled={saving} className="w-full py-2.5 rounded-xl gradient-brand text-primary-foreground text-xs font-bold disabled:opacity-60 flex items-center justify-center gap-1.5">
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />} Add Category
          </button>
        </div>
      </Modal>

      <Modal open={!!editItem} onClose={() => setEditItem(null)} title="Edit Repair Category">
        <div className="space-y-3">
          <input placeholder="Category name" value={editName} onChange={(e) => setEditName(e.target.value)} autoFocus className="w-full text-sm border border-border rounded-xl px-3 py-2.5 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
          <ImageUpload
            preview={editImagePreview || editImageUrl}
            onFileSelect={(f) => { setEditImage(f); setEditImagePreview(URL.createObjectURL(f)); setEditImageUrl(null); }}
            onUrlSet={(url) => { setEditImageUrl(url); setEditImagePreview(null); setEditImage(null); }}
            onClear={() => { setEditImage(null); setEditImagePreview(null); setEditImageUrl(null); }}
            label="Change image"
          />
          <button onClick={handleEdit} disabled={editSaving} className="w-full py-2.5 rounded-xl gradient-brand text-primary-foreground text-xs font-bold disabled:opacity-60 flex items-center justify-center gap-1.5">
            {editSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />} Save Changes
          </button>
        </div>
      </Modal>

      {loading ? <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div> : categories.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground"><Grid3X3 className="w-8 h-8 mx-auto mb-2 opacity-30" /><p className="text-sm font-semibold">No categories yet</p></div>
      ) : (
        <div className="space-y-2">
          {categories.map((c) => (
            <div key={c.id} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border">
              {c.image_url ? <img src={c.image_url} alt={c.name} className="w-8 h-8 rounded-lg object-contain flex-shrink-0" /> : <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0"><Grid3X3 className="w-4 h-4 text-muted-foreground" /></div>}
              <span className="flex-1 text-sm font-semibold text-foreground truncate">{c.name}</span>
              <div className="flex items-center gap-1">
                <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary"><Pencil className="w-3.5 h-3.5" /></button>
                <button onClick={() => handleDelete(c.id)} className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Assign Repair Services Tab ─────────────────────────────
const AssignRepairTab = ({ serviceType }: { serviceType: string }) => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedSeries, setSelectedSeries] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [categories, setCategories] = useState<RepairCategory[]>([]);
  const [assigned, setAssigned] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [selectedCat, setSelectedCat] = useState("");
  const [price, setPrice] = useState("");
  const [saving, setSaving] = useState(false);

  const brandServiceType = serviceType === "laptop" ? "laptop" : "mobile";

  useEffect(() => { supabase.from("brands").select("*").eq("service_type", brandServiceType).order("name").then(({ data }) => { if (data) setBrands(data as Brand[]); }); }, [brandServiceType]);
  useEffect(() => { (supabase.from("repair_categories") as any).select("*").eq("service_type", serviceType).order("name").then(({ data }: any) => { if (data) setCategories(data); }); }, [serviceType]);
  useEffect(() => { if (selectedBrand) { supabase.from("series").select("*").eq("brand_id", selectedBrand).order("name").then(({ data }) => { if (data) setSeriesList(data as any); }); } else setSeriesList([]); setSelectedSeries(""); }, [selectedBrand]);
  useEffect(() => { if (selectedSeries) { supabase.from("models").select("*").eq("series_id", selectedSeries).order("name").then(({ data }) => { if (data) setModels(data as any); }); } else setModels([]); setSelectedModel(""); }, [selectedSeries]);

  const fetchAssigned = async (modelId: string) => {
    setLoading(true);
    const { data } = await (supabase.from("model_repair_services") as any).select("*, repair_categories(name)").eq("model_id", modelId);
    if (data) setAssigned(data);
    setLoading(false);
  };

  useEffect(() => { if (selectedModel) fetchAssigned(selectedModel); else setAssigned([]); }, [selectedModel]);

  const handleAssign = async () => {
    if (!selectedModel || !selectedCat || !price) return;
    setSaving(true);
    const { error } = await (supabase.from("model_repair_services") as any).insert({
      model_id: selectedModel, repair_category_id: selectedCat, price: parseFloat(price),
    });
    if (error) toast.error(error.message); else { toast.success("Repair service assigned"); setShowAdd(false); setSelectedCat(""); setPrice(""); fetchAssigned(selectedModel); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    await (supabase.from("model_repair_services" as any) as any).delete().eq("id", id);
    fetchAssigned(selectedModel); toast.success("Deleted");
  };

  return (
    <div>
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div>
          <label className="text-[10px] font-semibold text-muted-foreground mb-1 block">Brand</label>
          <div className="relative">
            <select value={selectedBrand} onChange={(e) => setSelectedBrand(e.target.value)} className="w-full text-xs border border-border rounded-xl px-2 py-2.5 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 appearance-none">
              <option value="">Choose...</option>
              {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
          </div>
        </div>
        <div>
          <label className="text-[10px] font-semibold text-muted-foreground mb-1 block">Series</label>
          <div className="relative">
            <select value={selectedSeries} onChange={(e) => setSelectedSeries(e.target.value)} disabled={!selectedBrand} className="w-full text-xs border border-border rounded-xl px-2 py-2.5 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 appearance-none disabled:opacity-50">
              <option value="">Choose...</option>
              {seriesList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
          </div>
        </div>
        <div>
          <label className="text-[10px] font-semibold text-muted-foreground mb-1 block">Model</label>
          <div className="relative">
            <select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)} disabled={!selectedSeries} className="w-full text-xs border border-border rounded-xl px-2 py-2.5 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 appearance-none disabled:opacity-50">
              <option value="">Choose...</option>
              {models.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      </div>

      {selectedModel && <button onClick={() => setShowAdd(true)} className="mb-4 flex items-center gap-1.5 text-xs font-bold text-primary"><Plus className="w-3.5 h-3.5" /> Assign Repair</button>}

      <Modal open={showAdd} onClose={() => { setShowAdd(false); setSelectedCat(""); setPrice(""); }} title="Assign Repair Service">
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">Repair Category</label>
            <div className="relative">
              <select value={selectedCat} onChange={(e) => setSelectedCat(e.target.value)} className="w-full text-sm border border-border rounded-xl px-3 py-2.5 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 appearance-none">
                <option value="">Choose...</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">Price (₹)</label>
            <input type="number" placeholder="499" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full text-sm border border-border rounded-xl px-3 py-2.5 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <button onClick={handleAssign} disabled={saving || !selectedCat || !price} className="w-full py-2.5 rounded-xl gradient-brand text-primary-foreground text-xs font-bold disabled:opacity-60 flex items-center justify-center gap-1.5">
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />} Assign
          </button>
        </div>
      </Modal>

      {!selectedModel ? <p className="text-xs text-muted-foreground text-center py-8">Select brand, series & model</p> : loading ? <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div> : assigned.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground"><Tag className="w-8 h-8 mx-auto mb-2 opacity-30" /><p className="text-sm font-semibold">No repairs assigned</p></div>
      ) : (
        <div className="space-y-2">
          {assigned.map((a: any) => (
            <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border">
              <div className="flex-1"><span className="text-sm font-bold text-foreground">{a.repair_categories?.name || "Unknown"}</span><span className="ml-2 text-sm font-extrabold text-primary">₹{a.price}</span></div>
              <button onClick={() => handleDelete(a.id)} className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Repair Subcategories Tab ─────────────────────────────
type RepairSubcategory = { id: string; category_id: string; name: string; image_url: string | null; price: number };

const RepairSubcategoriesTab = ({ serviceType }: { serviceType: string }) => {
  const [categories, setCategories] = useState<RepairCategory[]>([]);
  const [selectedCat, setSelectedCat] = useState("");
  const [subs, setSubs] = useState<RepairSubcategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [addImage, setAddImage] = useState<File | null>(null);
  const [addImagePreview, setAddImagePreview] = useState<string | null>(null);
  const [addImageUrl, setAddImageUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [editItem, setEditItem] = useState<RepairSubcategory | null>(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editImage, setEditImage] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const [editImageUrl, setEditImageUrl] = useState<string | null>(null);
  const [editSaving, setEditSaving] = useState(false);

  useEffect(() => {
    (supabase.from("repair_categories") as any).select("*").eq("service_type", serviceType).order("name").then(({ data }: any) => { if (data) setCategories(data); });
  }, [serviceType]);

  const fetchSubs = async (catId: string) => {
    setLoading(true);
    const { data } = await (supabase.from("repair_subcategories") as any).select("*").eq("category_id", catId).order("name");
    if (data) setSubs(data);
    setLoading(false);
  };

  useEffect(() => { if (selectedCat) fetchSubs(selectedCat); else setSubs([]); }, [selectedCat]);

  const handleAdd = async () => {
    if (!name.trim() || !selectedCat) return;
    setSaving(true);
    const insertData: any = { name: name.trim(), category_id: selectedCat, price: parseFloat(price) || 0 };
    if (addImageUrl) insertData.image_url = addImageUrl;
    const { data, error } = await (supabase.from("repair_subcategories") as any).insert(insertData).select().single();
    if (!error && data && addImage) {
      const url = await uploadServiceImage("service-images", `subsvc-${data.id}`, addImage);
      if (url) await (supabase.from("repair_subcategories") as any).update({ image_url: url }).eq("id", data.id);
    }
    if (error) toast.error(error.message); else { toast.success("Subcategory added"); setShowAdd(false); setName(""); setPrice(""); setAddImage(null); setAddImagePreview(null); setAddImageUrl(null); fetchSubs(selectedCat); }
    setSaving(false);
  };

  const openEdit = (s: RepairSubcategory) => {
    setEditItem(s); setEditName(s.name); setEditPrice(String(s.price)); setEditImagePreview(s.image_url); setEditImage(null); setEditImageUrl(null);
  };

  const handleEdit = async () => {
    if (!editItem || !editName.trim()) return;
    setEditSaving(true);
    const updates: any = { name: editName.trim(), price: parseFloat(editPrice) || 0 };
    if (editImageUrl) updates.image_url = editImageUrl;
    else if (editImage) {
      const url = await uploadServiceImage("service-images", `subsvc-${editItem.id}`, editImage);
      if (url) updates.image_url = url;
    }
    await (supabase.from("repair_subcategories") as any).update(updates).eq("id", editItem.id);
    toast.success("Updated"); setEditItem(null); fetchSubs(selectedCat);
    setEditSaving(false);
  };

  const handleDelete = async (id: string) => {
    await (supabase.from("repair_subcategories") as any).delete().eq("id", id);
    fetchSubs(selectedCat); toast.success("Deleted");
  };

  return (
    <div>
      <div className="mb-4">
        <label className="text-[10px] font-semibold text-muted-foreground mb-1 block">Select Category</label>
        <div className="relative">
          <select value={selectedCat} onChange={(e) => setSelectedCat(e.target.value)} className="w-full text-sm border border-border rounded-xl px-3 py-2.5 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 appearance-none">
            <option value="">Choose category...</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      {selectedCat && <button onClick={() => setShowAdd(true)} className="mb-4 flex items-center gap-1.5 text-xs font-bold text-primary"><Plus className="w-3.5 h-3.5" /> Add Subcategory</button>}

      <Modal open={showAdd} onClose={() => { setShowAdd(false); setName(""); setPrice(""); setAddImage(null); setAddImagePreview(null); setAddImageUrl(null); }} title="Add Subcategory">
        <div className="space-y-3">
          <input placeholder="e.g. Original Screen" value={name} onChange={(e) => setName(e.target.value)} autoFocus className="w-full text-sm border border-border rounded-xl px-3 py-2.5 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
          <input type="number" placeholder="Price (₹)" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full text-sm border border-border rounded-xl px-3 py-2.5 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
          <ImageUpload
            preview={addImagePreview || addImageUrl}
            onFileSelect={(f) => { setAddImage(f); setAddImagePreview(URL.createObjectURL(f)); setAddImageUrl(null); }}
            onUrlSet={(url) => { setAddImageUrl(url); setAddImagePreview(null); setAddImage(null); }}
            onClear={() => { setAddImage(null); setAddImagePreview(null); setAddImageUrl(null); }}
            label="Upload image"
          />
          <button onClick={handleAdd} disabled={saving} className="w-full py-2.5 rounded-xl gradient-brand text-primary-foreground text-xs font-bold disabled:opacity-60 flex items-center justify-center gap-1.5">
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />} Add
          </button>
        </div>
      </Modal>

      <Modal open={!!editItem} onClose={() => setEditItem(null)} title="Edit Subcategory">
        <div className="space-y-3">
          <input placeholder="Name" value={editName} onChange={(e) => setEditName(e.target.value)} autoFocus className="w-full text-sm border border-border rounded-xl px-3 py-2.5 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
          <input type="number" placeholder="Price (₹)" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} className="w-full text-sm border border-border rounded-xl px-3 py-2.5 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
          <ImageUpload
            preview={editImagePreview || editImageUrl}
            onFileSelect={(f) => { setEditImage(f); setEditImagePreview(URL.createObjectURL(f)); setEditImageUrl(null); }}
            onUrlSet={(url) => { setEditImageUrl(url); setEditImagePreview(null); setEditImage(null); }}
            onClear={() => { setEditImage(null); setEditImagePreview(null); setEditImageUrl(null); }}
            label="Change image"
          />
          <button onClick={handleEdit} disabled={editSaving} className="w-full py-2.5 rounded-xl gradient-brand text-primary-foreground text-xs font-bold disabled:opacity-60 flex items-center justify-center gap-1.5">
            {editSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />} Save
          </button>
        </div>
      </Modal>

      {!selectedCat ? <p className="text-xs text-muted-foreground text-center py-8">Select a category first</p> : loading ? <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div> : subs.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground"><ListTree className="w-8 h-8 mx-auto mb-2 opacity-30" /><p className="text-sm font-semibold">No subcategories yet</p></div>
      ) : (
        <div className="space-y-2">
          {subs.map((s) => (
            <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border">
              {s.image_url ? <img src={s.image_url} alt={s.name} className="w-8 h-8 rounded-lg object-contain flex-shrink-0" /> : <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0"><ListTree className="w-4 h-4 text-muted-foreground" /></div>}
              <div className="flex-1 min-w-0">
                <span className="text-sm font-semibold text-foreground truncate block">{s.name}</span>
                <span className="text-xs font-bold text-primary">₹{s.price}</span>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary"><Pencil className="w-3.5 h-3.5" /></button>
                <button onClick={() => handleDelete(s.id)} className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Screen Guard Services Tab ─────────────────────────────
export const ScreenGuardServicesTab = () => {
  return (
    <Tabs defaultValue="brands" className="mt-4">
      <TabsList className="w-full grid grid-cols-5 h-9">
        <TabsTrigger value="brands" className="text-[10px] gap-1"><Tag className="w-3 h-3" />Brands</TabsTrigger>
        <TabsTrigger value="series" className="text-[10px] gap-1"><Layers className="w-3 h-3" />Series</TabsTrigger>
        <TabsTrigger value="models" className="text-[10px] gap-1"><Smartphone className="w-3 h-3" />Models</TabsTrigger>
        <TabsTrigger value="screenguards" className="text-[10px] gap-1"><Grid3X3 className="w-3 h-3" />Guards</TabsTrigger>
        <TabsTrigger value="assign" className="text-[10px] gap-1"><Shield className="w-3 h-3" />Assign</TabsTrigger>
      </TabsList>
      <TabsContent value="brands"><BrandsTab serviceType="mobile" /></TabsContent>
      <TabsContent value="series"><SeriesTab serviceType="mobile" /></TabsContent>
      <TabsContent value="models"><ModelsTab serviceType="mobile" /></TabsContent>
      <TabsContent value="screenguards"><ScreenGuardsManageTab /></TabsContent>
      <TabsContent value="assign"><ModelGuardsTab /></TabsContent>
    </Tabs>
  );
};

// ─── Mobile Repair Services Tab ─────────────────────────────
export const MobileRepairServicesTab = () => {
  return (
    <Tabs defaultValue="repairs" className="mt-4">
      <TabsList className="w-full grid grid-cols-2 h-9">
        <TabsTrigger value="repairs" className="text-[10px] gap-1"><Grid3X3 className="w-3 h-3" />Categories</TabsTrigger>
        <TabsTrigger value="subcategories" className="text-[10px] gap-1"><ListTree className="w-3 h-3" />Subcategories</TabsTrigger>
      </TabsList>
      <TabsContent value="repairs"><RepairCategoriesTab serviceType="mobile" /></TabsContent>
      <TabsContent value="subcategories"><RepairSubcategoriesTab serviceType="mobile" /></TabsContent>
    </Tabs>
  );
};

// ─── Laptop Repair Services Tab ─────────────────────────────
export const LaptopRepairServicesTab = () => {
  return (
    <Tabs defaultValue="brands" className="mt-4">
      <TabsList className="w-full grid grid-cols-5 h-9">
        <TabsTrigger value="brands" className="text-[10px] gap-1"><Tag className="w-3 h-3" />Brands</TabsTrigger>
        <TabsTrigger value="series" className="text-[10px] gap-1"><Layers className="w-3 h-3" />Series</TabsTrigger>
        <TabsTrigger value="models" className="text-[10px] gap-1"><Smartphone className="w-3 h-3" />Models</TabsTrigger>
        <TabsTrigger value="repairs" className="text-[10px] gap-1"><Grid3X3 className="w-3 h-3" />Categories</TabsTrigger>
        <TabsTrigger value="subcategories" className="text-[10px] gap-1"><ListTree className="w-3 h-3" />Subcategories</TabsTrigger>
      </TabsList>
      <TabsContent value="brands"><BrandsTab serviceType="laptop" /></TabsContent>
      <TabsContent value="series"><SeriesTab serviceType="laptop" /></TabsContent>
      <TabsContent value="models"><ModelsTab serviceType="laptop" /></TabsContent>
      <TabsContent value="repairs"><RepairCategoriesTab serviceType="laptop" /></TabsContent>
      <TabsContent value="subcategories"><RepairSubcategoriesTab serviceType="laptop" /></TabsContent>
    </Tabs>
  );
};

const ServicesTab = () => <ScreenGuardServicesTab />;
export default ServicesTab;
