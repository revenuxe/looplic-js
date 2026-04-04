import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Plus, Trash2, Pencil, Loader2, X, Check, Shield, Tag, Smartphone, Layers, ChevronDown, Grid3X3, ListTree
} from "lucide-react";
import ImageUpload from "./ImageUpload";

type Brand = { id: string; name: string; letter: string; gradient: string; sort_order: number; image_url: string | null; service_type: string };
type Series = { id: string; brand_id: string; name: string; image_url?: string | null };
type Model = { id: string; series_id: string; name: string; image_url?: string | null };
type Guard = { id: string; model_id: string; guard_type: string; price: number };
type GuardCategory = { id: string; name: string };
type GuardType = { id: string; category_id: string; name: string; image_url: string | null; price: number };

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
  const ext = file.name.split(".").pop();
  const path = `${id}.${ext}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
  if (error) return null;
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
};

// ─── Brands Tab ─────────────────────────────
const BrandsTab = ({ serviceType = "mobile" }: { serviceType?: string }) => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
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

  const fetch = async () => {
    setLoading(true);
    const { data } = await supabase.from("brands").select("*").eq("service_type", serviceType).order("sort_order").order("name");
    if (data) setBrands(data as Brand[]);
    setLoading(false);
  };
  useEffect(() => { fetch(); }, [serviceType]);

  const handleAdd = async () => {
    if (!name.trim()) return;
    setSaving(true);
    const { data, error } = await supabase.from("brands").insert({
      name: name.trim(), letter: name.charAt(0).toUpperCase(), gradient: "from-blue-500 to-cyan-500", service_type: serviceType,
    } as any).select().single();
    if (!error && data) {
      let finalUrl = imageUrl;
      if (image) finalUrl = await uploadServiceImage("brand-images", data.id, image);
      if (finalUrl) await supabase.from("brands").update({ image_url: finalUrl }).eq("id", data.id);
    }
    if (error) toast.error(error.message); else { toast.success("Brand added"); reset(); fetch(); }
    setSaving(false);
  };

  const openEdit = (b: Brand) => {
    setEditBrand(b);
    setEditName(b.name);
    setEditImagePreview(b.image_url);
    setEditImage(null);
    setEditImageUrl(null);
  };

  const handleEdit = async () => {
    if (!editBrand || !editName.trim()) return;
    setEditSaving(true);
    const updates: any = { name: editName.trim() };
    if (editImageUrl) updates.image_url = editImageUrl;
    else if (editImage) {
      const url = await uploadServiceImage("brand-images", editBrand.id, editImage);
      if (url) updates.image_url = url;
    }
    await supabase.from("brands").update(updates).eq("id", editBrand.id);
    toast.success("Updated"); setEditBrand(null); fetch();
    setEditSaving(false);
  };

  const handleDelete = async (id: string) => {
    await (supabase.from("brands" as any) as any).delete().eq("id", id);
    fetch(); toast.success("Deleted");
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

      {loading ? <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div> : brands.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground"><Shield className="w-8 h-8 mx-auto mb-2 opacity-30" /><p className="text-sm font-semibold">No brands yet</p></div>
      ) : (
        <div className="space-y-2">
          {brands.map((b) => (
            <div key={b.id} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border">
              {b.image_url ? <img src={b.image_url} alt={b.name} className="w-8 h-8 rounded-lg object-contain flex-shrink-0" /> : <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-xs font-bold text-muted-foreground flex-shrink-0">{b.name.charAt(0)}</div>}
              <span className="flex-1 text-sm font-semibold text-foreground truncate">{b.name}</span>
              <div className="flex items-center gap-1">
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
  const [loading, setLoading] = useState(false);
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
    setLoading(true);
    const { data } = await supabase.from("series").select("*").eq("brand_id", brandId).order("name");
    if (data) setSeriesList(data as any);
    setLoading(false);
  };

  useEffect(() => { if (selectedBrand) fetchSeries(selectedBrand); else setSeriesList([]); }, [selectedBrand]);

  const handleAdd = async () => {
    if (!name.trim() || !selectedBrand) return;
    setSaving(true);
    const insertData: any = { brand_id: selectedBrand, name: name.trim() };
    if (addImageUrl) insertData.image_url = addImageUrl;
    const { data, error } = await (supabase.from("series") as any).insert(insertData).select().single();
    if (!error && data && addImage) {
      const url = await uploadServiceImage("service-images", `series-${data.id}`, addImage);
      if (url) await (supabase.from("series") as any).update({ image_url: url }).eq("id", data.id);
    }
    if (error) toast.error(error.message); else { toast.success("Series added"); setShowAdd(false); setName(""); setAddImage(null); setAddImagePreview(null); setAddImageUrl(null); fetchSeries(selectedBrand); }
    setSaving(false);
  };

  const openEdit = (s: Series) => {
    setEditItem(s); setEditName(s.name); setEditImagePreview(s.image_url || null); setEditImage(null); setEditImageUrl(null);
  };

  const handleEdit = async () => {
    if (!editItem || !editName.trim()) return;
    setEditSaving(true);
    const updates: any = { name: editName.trim() };
    if (editImageUrl) updates.image_url = editImageUrl;
    else if (editImage) {
      const url = await uploadServiceImage("service-images", `series-${editItem.id}`, editImage);
      if (url) updates.image_url = url;
    }
    await (supabase.from("series") as any).update(updates).eq("id", editItem.id);
    toast.success("Updated"); setEditItem(null); fetchSeries(selectedBrand);
    setEditSaving(false);
  };

  const handleDelete = async (id: string) => {
    await (supabase.from("series" as any) as any).delete().eq("id", id);
    fetchSeries(selectedBrand); toast.success("Deleted");
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

      {!selectedBrand ? <p className="text-xs text-muted-foreground text-center py-8">Select a brand first</p> : loading ? <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div> : seriesList.length === 0 ? (
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
  const [loading, setLoading] = useState(false);
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

  useEffect(() => { supabase.from("brands").select("*").eq("service_type", serviceType).order("name").then(({ data }) => { if (data) setBrands(data as Brand[]); }); }, [serviceType]);
  useEffect(() => { if (selectedBrand) { supabase.from("series").select("*").eq("brand_id", selectedBrand).order("name").then(({ data }) => { if (data) setSeriesList(data as any); }); } else { setSeriesList([]); } setSelectedSeries(""); }, [selectedBrand]);

  const fetchModels = async (seriesId: string) => {
    setLoading(true);
    const { data } = await supabase.from("models").select("*").eq("series_id", seriesId).order("name");
    if (data) setModels(data as any);
    setLoading(false);
  };

  useEffect(() => { if (selectedSeries) fetchModels(selectedSeries); else setModels([]); }, [selectedSeries]);

  const handleAdd = async () => {
    if (!name.trim() || !selectedSeries) return;
    setSaving(true);
    const insertData: any = { series_id: selectedSeries, name: name.trim() };
    if (addImageUrl) insertData.image_url = addImageUrl;
    const { data, error } = await (supabase.from("models") as any).insert(insertData).select().single();
    if (!error && data && addImage) {
      const url = await uploadServiceImage("service-images", `model-${data.id}`, addImage);
      if (url) await (supabase.from("models") as any).update({ image_url: url }).eq("id", data.id);
    }
    if (error) toast.error(error.message); else { toast.success("Model added"); setShowAdd(false); setName(""); setAddImage(null); setAddImagePreview(null); setAddImageUrl(null); fetchModels(selectedSeries); }
    setSaving(false);
  };

  const openEdit = (m: Model) => {
    setEditItem(m); setEditName(m.name); setEditImagePreview(m.image_url || null); setEditImage(null); setEditImageUrl(null);
  };

  const handleEdit = async () => {
    if (!editItem || !editName.trim()) return;
    setEditSaving(true);
    const updates: any = { name: editName.trim() };
    if (editImageUrl) updates.image_url = editImageUrl;
    else if (editImage) {
      const url = await uploadServiceImage("service-images", `model-${editItem.id}`, editImage);
      if (url) updates.image_url = url;
    }
    await (supabase.from("models") as any).update(updates).eq("id", editItem.id);
    toast.success("Updated"); setEditItem(null); fetchModels(selectedSeries);
    setEditSaving(false);
  };

  const handleDelete = async (id: string) => {
    await (supabase.from("models" as any) as any).delete().eq("id", id);
    fetchModels(selectedSeries); toast.success("Deleted");
  };

  return (
    <div>
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

      {!selectedSeries ? <p className="text-xs text-muted-foreground text-center py-8">{!selectedBrand ? "Select brand & series" : "Select a series"}</p> : loading ? <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div> : models.length === 0 ? (
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
    const ext = file.name.split(".").pop();
    const path = `${id}.${ext}`;
    const { error } = await supabase.storage.from("guard-type-images").upload(path, file, { upsert: true });
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
    const inserts = (guardTypes as GuardType[]).map(t => ({ model_id: selectedModel, guard_type: t.name, price: t.price }));
    const { error } = await supabase.from("model_screen_guards").insert(inserts);
    if (error) toast.error(error.message); else { toast.success(`${inserts.length} guards assigned`); setShowAdd(false); setSelectedCategory(""); fetchGuards(selectedModel); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    await (supabase.from("model_screen_guards" as any) as any).delete().eq("id", id);
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
      <TabsList className="w-full grid grid-cols-3 h-9">
        <TabsTrigger value="repairs" className="text-[10px] gap-1"><Grid3X3 className="w-3 h-3" />Categories</TabsTrigger>
        <TabsTrigger value="subcategories" className="text-[10px] gap-1"><ListTree className="w-3 h-3" />Subcategories</TabsTrigger>
        <TabsTrigger value="assign" className="text-[10px] gap-1"><Shield className="w-3 h-3" />Assign</TabsTrigger>
      </TabsList>
      <TabsContent value="repairs"><RepairCategoriesTab serviceType="mobile" /></TabsContent>
      <TabsContent value="subcategories"><RepairSubcategoriesTab serviceType="mobile" /></TabsContent>
      <TabsContent value="assign"><AssignRepairTab serviceType="mobile" /></TabsContent>
    </Tabs>
  );
};

// ─── Laptop Repair Services Tab ─────────────────────────────
export const LaptopRepairServicesTab = () => {
  return (
    <Tabs defaultValue="brands" className="mt-4">
      <TabsList className="w-full grid grid-cols-6 h-9">
        <TabsTrigger value="brands" className="text-[10px] gap-1"><Tag className="w-3 h-3" />Brands</TabsTrigger>
        <TabsTrigger value="series" className="text-[10px] gap-1"><Layers className="w-3 h-3" />Series</TabsTrigger>
        <TabsTrigger value="models" className="text-[10px] gap-1"><Smartphone className="w-3 h-3" />Models</TabsTrigger>
        <TabsTrigger value="repairs" className="text-[10px] gap-1"><Grid3X3 className="w-3 h-3" />Categories</TabsTrigger>
        <TabsTrigger value="subcategories" className="text-[10px] gap-1"><ListTree className="w-3 h-3" />Sub</TabsTrigger>
        <TabsTrigger value="assign" className="text-[10px] gap-1"><Shield className="w-3 h-3" />Assign</TabsTrigger>
      </TabsList>
      <TabsContent value="brands"><BrandsTab serviceType="laptop" /></TabsContent>
      <TabsContent value="series"><SeriesTab serviceType="laptop" /></TabsContent>
      <TabsContent value="models"><ModelsTab serviceType="laptop" /></TabsContent>
      <TabsContent value="repairs"><RepairCategoriesTab serviceType="laptop" /></TabsContent>
      <TabsContent value="subcategories"><RepairSubcategoriesTab serviceType="laptop" /></TabsContent>
      <TabsContent value="assign"><AssignRepairTab serviceType="laptop" /></TabsContent>
    </Tabs>
  );
};

const ServicesTab = () => <ScreenGuardServicesTab />;
export default ServicesTab;
