import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Plus, Trash2, Pencil, Loader2, X, Check, Shield, ImagePlus, Tag, Smartphone, Layers, ChevronDown, Grid3X3
} from "lucide-react";

type Brand = { id: string; name: string; letter: string; gradient: string; sort_order: number; image_url: string | null };
type Series = { id: string; brand_id: string; name: string };
type Model = { id: string; series_id: string; name: string };
type Guard = { id: string; model_id: string; guard_type: string; price: number };
type GuardCategory = { id: string; name: string };
type GuardType = { id: string; category_id: string; name: string; image_url: string | null; price: number };

const gradientOptions = [
  "from-blue-500 to-cyan-500", "from-violet-500 to-purple-600", "from-amber-400 to-orange-500",
  "from-emerald-400 to-teal-500", "from-rose-500 to-pink-500", "from-indigo-500 to-blue-600",
  "from-yellow-400 to-amber-500", "from-cyan-400 to-blue-500", "from-fuchsia-500 to-purple-500",
];

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

// ─── Brands Tab ─────────────────────────────
const BrandsTab = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [letter, setLetter] = useState("");
  const [gradient, setGradient] = useState(gradientOptions[0]);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const fetch = async () => {
    setLoading(true);
    const { data } = await supabase.from("brands").select("*").order("sort_order").order("name");
    if (data) setBrands(data);
    setLoading(false);
  };
  useEffect(() => { fetch(); }, []);

  const uploadImage = async (id: string, file: File) => {
    const ext = file.name.split(".").pop();
    const { error } = await supabase.storage.from("brand-images").upload(`${id}.${ext}`, file, { upsert: true });
    if (error) return null;
    return supabase.storage.from("brand-images").getPublicUrl(`${id}.${ext}`).data.publicUrl;
  };

  const handleAdd = async () => {
    if (!name.trim()) return;
    setSaving(true);
    const { data, error } = await supabase.from("brands").insert({
      name: name.trim(), letter: (letter.trim() || name.charAt(0)).toUpperCase(), gradient,
    }).select().single();
    if (!error && data && image) {
      const url = await uploadImage(data.id, image);
      if (url) await supabase.from("brands").update({ image_url: url }).eq("id", data.id);
    }
    if (error) toast.error(error.message); else { toast.success("Brand added"); reset(); fetch(); }
    setSaving(false);
  };

  const handleEdit = async (id: string) => {
    if (!editName.trim()) return;
    await (supabase.from("brands" as any) as any).update({ name: editName.trim() }).eq("id", id);
    setEditId(null); fetch(); toast.success("Updated");
  };

  const handleDelete = async (id: string) => {
    await (supabase.from("brands" as any) as any).delete().eq("id", id);
    fetch(); toast.success("Deleted");
  };

  const reset = () => { setShowAdd(false); setName(""); setLetter(""); setGradient(gradientOptions[0]); setImage(null); setImagePreview(null); };

  return (
    <div>
      <button onClick={() => setShowAdd(true)} className="mb-4 flex items-center gap-1.5 text-xs font-bold text-primary"><Plus className="w-3.5 h-3.5" /> Add Brand</button>

      <Modal open={showAdd} onClose={reset} title="Add Brand">
        <div className="space-y-3">
          <input placeholder="Brand name" value={name} onChange={(e) => setName(e.target.value)} autoFocus className="w-full text-sm border border-border rounded-xl px-3 py-2.5 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Letter</label>
              <input placeholder="A" maxLength={2} value={letter} onChange={(e) => setLetter(e.target.value)} className="w-full text-sm border border-border rounded-xl px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Color</label>
              <div className="flex gap-1.5 flex-wrap">{gradientOptions.map(g => <button key={g} onClick={() => setGradient(g)} className={`w-6 h-6 rounded-full bg-gradient-to-br ${g} border-2 transition-all ${gradient === g ? "border-foreground scale-110" : "border-transparent"}`} />)}</div>
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer border border-dashed border-border rounded-xl p-3 hover:border-primary/40 transition-colors">
            {imagePreview ? <img src={imagePreview} alt="" className="w-10 h-10 rounded-lg object-contain" /> : <ImagePlus className="w-5 h-5 text-muted-foreground" />}
            <span className="text-xs text-muted-foreground font-medium">{image ? image.name : "Upload logo (optional)"}</span>
            <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) { setImage(f); setImagePreview(URL.createObjectURL(f)); } }} />
          </label>
          <button onClick={handleAdd} disabled={saving} className="w-full py-2.5 rounded-xl gradient-brand text-primary-foreground text-xs font-bold disabled:opacity-60 flex items-center justify-center gap-1.5">
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />} Add Brand
          </button>
        </div>
      </Modal>

      {loading ? <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div> : brands.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground"><Shield className="w-8 h-8 mx-auto mb-2 opacity-30" /><p className="text-sm font-semibold">No brands yet</p></div>
      ) : (
        <div className="space-y-2">
          {brands.map((b) => (
            <div key={b.id} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border group">
              {b.image_url ? <img src={b.image_url} alt={b.name} className="w-8 h-8 rounded-lg object-contain flex-shrink-0" /> : <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${b.gradient} flex items-center justify-center text-xs font-bold text-white flex-shrink-0`}>{b.letter}</div>}
              <div className="flex-1 min-w-0">
                {editId === b.id ? (
                  <div className="flex items-center gap-2">
                    <input value={editName} onChange={(e) => setEditName(e.target.value)} autoFocus onKeyDown={(e) => e.key === "Enter" && handleEdit(b.id)} className="flex-1 text-sm border border-border rounded-lg px-2 py-1 bg-background text-foreground focus:outline-none" />
                    <button onClick={() => handleEdit(b.id)} className="p-1 text-primary"><Check className="w-4 h-4" /></button>
                    <button onClick={() => setEditId(null)} className="p-1 text-muted-foreground"><X className="w-4 h-4" /></button>
                  </div>
                ) : <span className="text-sm font-semibold text-foreground">{b.name}</span>}
              </div>
              {editId !== b.id && (
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setEditId(b.id); setEditName(b.name); }} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary"><Pencil className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDelete(b.id)} className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Series Tab ─────────────────────────────
const SeriesTab = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  useEffect(() => { supabase.from("brands").select("*").order("name").then(({ data }) => { if (data) setBrands(data); }); }, []);

  const fetchSeries = async (brandId: string) => {
    setLoading(true);
    const { data } = await supabase.from("series").select("*").eq("brand_id", brandId).order("name");
    if (data) setSeriesList(data);
    setLoading(false);
  };

  useEffect(() => { if (selectedBrand) fetchSeries(selectedBrand); else setSeriesList([]); }, [selectedBrand]);

  const handleAdd = async () => {
    if (!name.trim() || !selectedBrand) return;
    setSaving(true);
    const { error } = await supabase.from("series").insert({ brand_id: selectedBrand, name: name.trim() });
    if (error) toast.error(error.message); else { toast.success("Series added"); setShowAdd(false); setName(""); fetchSeries(selectedBrand); }
    setSaving(false);
  };

  const handleEdit = async (id: string) => {
    if (!editName.trim()) return;
    await (supabase.from("series" as any) as any).update({ name: editName.trim() }).eq("id", id);
    setEditId(null); fetchSeries(selectedBrand); toast.success("Updated");
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

      <Modal open={showAdd} onClose={() => { setShowAdd(false); setName(""); }} title="Add Series">
        <div className="space-y-3">
          <input placeholder="Series name (e.g. iPhone 16)" value={name} onChange={(e) => setName(e.target.value)} autoFocus className="w-full text-sm border border-border rounded-xl px-3 py-2.5 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
          <button onClick={handleAdd} disabled={saving} className="w-full py-2.5 rounded-xl gradient-brand text-primary-foreground text-xs font-bold disabled:opacity-60 flex items-center justify-center gap-1.5">
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />} Add Series
          </button>
        </div>
      </Modal>

      {!selectedBrand ? <p className="text-xs text-muted-foreground text-center py-8">Select a brand first</p> : loading ? <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div> : seriesList.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground"><Layers className="w-8 h-8 mx-auto mb-2 opacity-30" /><p className="text-sm font-semibold">No series yet</p></div>
      ) : (
        <div className="space-y-2">
          {seriesList.map((s) => (
            <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border group">
              <div className="flex-1 min-w-0">
                {editId === s.id ? (
                  <div className="flex items-center gap-2">
                    <input value={editName} onChange={(e) => setEditName(e.target.value)} autoFocus onKeyDown={(e) => e.key === "Enter" && handleEdit(s.id)} className="flex-1 text-sm border border-border rounded-lg px-2 py-1 bg-background text-foreground focus:outline-none" />
                    <button onClick={() => handleEdit(s.id)} className="p-1 text-primary"><Check className="w-4 h-4" /></button>
                    <button onClick={() => setEditId(null)} className="p-1 text-muted-foreground"><X className="w-4 h-4" /></button>
                  </div>
                ) : <span className="text-sm font-semibold text-foreground">{s.name}</span>}
              </div>
              {editId !== s.id && (
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setEditId(s.id); setEditName(s.name); }} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary"><Pencil className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDelete(s.id)} className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Models Tab ─────────────────────────────
const ModelsTab = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedSeries, setSelectedSeries] = useState("");
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  useEffect(() => { supabase.from("brands").select("*").order("name").then(({ data }) => { if (data) setBrands(data); }); }, []);
  useEffect(() => { if (selectedBrand) { supabase.from("series").select("*").eq("brand_id", selectedBrand).order("name").then(({ data }) => { if (data) setSeriesList(data); }); } else { setSeriesList([]); } setSelectedSeries(""); }, [selectedBrand]);

  const fetchModels = async (seriesId: string) => {
    setLoading(true);
    const { data } = await supabase.from("models").select("*").eq("series_id", seriesId).order("name");
    if (data) setModels(data);
    setLoading(false);
  };

  useEffect(() => { if (selectedSeries) fetchModels(selectedSeries); else setModels([]); }, [selectedSeries]);

  const handleAdd = async () => {
    if (!name.trim() || !selectedSeries) return;
    setSaving(true);
    const { error } = await supabase.from("models").insert({ series_id: selectedSeries, name: name.trim() });
    if (error) toast.error(error.message); else { toast.success("Model added"); setShowAdd(false); setName(""); fetchModels(selectedSeries); }
    setSaving(false);
  };

  const handleEdit = async (id: string) => {
    if (!editName.trim()) return;
    await (supabase.from("models" as any) as any).update({ name: editName.trim() }).eq("id", id);
    setEditId(null); fetchModels(selectedSeries); toast.success("Updated");
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

      <Modal open={showAdd} onClose={() => { setShowAdd(false); setName(""); }} title="Add Model">
        <div className="space-y-3">
          <input placeholder="Model name (e.g. iPhone 16 Pro Max)" value={name} onChange={(e) => setName(e.target.value)} autoFocus className="w-full text-sm border border-border rounded-xl px-3 py-2.5 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
          <button onClick={handleAdd} disabled={saving} className="w-full py-2.5 rounded-xl gradient-brand text-primary-foreground text-xs font-bold disabled:opacity-60 flex items-center justify-center gap-1.5">
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />} Add Model
          </button>
        </div>
      </Modal>

      {!selectedSeries ? <p className="text-xs text-muted-foreground text-center py-8">{!selectedBrand ? "Select brand & series" : "Select a series"}</p> : loading ? <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div> : models.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground"><Smartphone className="w-8 h-8 mx-auto mb-2 opacity-30" /><p className="text-sm font-semibold">No models yet</p></div>
      ) : (
        <div className="space-y-2">
          {models.map((m) => (
            <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border group">
              <div className="flex-1 min-w-0">
                {editId === m.id ? (
                  <div className="flex items-center gap-2">
                    <input value={editName} onChange={(e) => setEditName(e.target.value)} autoFocus onKeyDown={(e) => e.key === "Enter" && handleEdit(m.id)} className="flex-1 text-sm border border-border rounded-lg px-2 py-1 bg-background text-foreground focus:outline-none" />
                    <button onClick={() => handleEdit(m.id)} className="p-1 text-primary"><Check className="w-4 h-4" /></button>
                    <button onClick={() => setEditId(null)} className="p-1 text-muted-foreground"><X className="w-4 h-4" /></button>
                  </div>
                ) : <span className="text-sm font-semibold text-foreground">{m.name}</span>}
              </div>
              {editId !== m.id && (
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setEditId(m.id); setEditName(m.name); }} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary"><Pencil className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDelete(m.id)} className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Screen Guards Tab (Categories + Types with Image & Price) ─────────────────────────────
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
  const [saving, setSaving] = useState(false);
  const [editCatId, setEditCatId] = useState<string | null>(null);
  const [editCatName, setEditCatName] = useState("");

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
    const { data, error } = await (supabase.from("screen_guard_types") as any).insert({
      category_id: selectedCat,
      name: typeName.trim(),
      price: typePrice ? parseFloat(typePrice) : 0,
    }).select().single();
    if (!error && data && typeImage) {
      const url = await uploadTypeImage(data.id, typeImage);
      if (url) await (supabase.from("screen_guard_types" as any) as any).update({ image_url: url }).eq("id", data.id);
    }
    if (error) toast.error(error.message); else { toast.success("Type added"); resetTypeForm(); fetchTypes(selectedCat); }
    setSaving(false);
  };

  const resetTypeForm = () => {
    setShowAddType(false); setTypeName(""); setTypePrice(""); setTypeImage(null); setTypeImagePreview(null);
  };

  const handleDeleteType = async (id: string) => {
    await (supabase.from("screen_guard_types" as any) as any).delete().eq("id", id);
    fetchTypes(selectedCat); toast.success("Deleted");
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
                  <div className="hidden group-hover:flex items-center gap-0.5">
                    <button onClick={(e) => { e.stopPropagation(); setEditCatId(c.id); setEditCatName(c.name); }} className="p-0.5 text-muted-foreground hover:text-foreground"><Pencil className="w-2.5 h-2.5" /></button>
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteCat(c.id); }} className="p-0.5 text-muted-foreground hover:text-destructive"><Trash2 className="w-2.5 h-2.5" /></button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Types Section */}
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
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Default Price (₹)</label>
                <input type="number" placeholder="99" value={typePrice} onChange={(e) => setTypePrice(e.target.value)} className="w-full text-sm border border-border rounded-xl px-3 py-2.5 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <label className="flex items-center gap-2 cursor-pointer border border-dashed border-border rounded-xl p-3 hover:border-primary/40 transition-colors">
                {typeImagePreview ? <img src={typeImagePreview} alt="" className="w-10 h-10 rounded-lg object-contain" /> : <ImagePlus className="w-5 h-5 text-muted-foreground" />}
                <span className="text-xs text-muted-foreground font-medium">{typeImage ? typeImage.name : "Upload image (optional)"}</span>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) { setTypeImage(f); setTypeImagePreview(URL.createObjectURL(f)); } }} />
              </label>
              <button onClick={handleAddType} disabled={saving} className="w-full py-2.5 rounded-xl gradient-brand text-primary-foreground text-xs font-bold disabled:opacity-60 flex items-center justify-center gap-1.5">
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />} Add Type
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
                  <span className="flex-1 text-sm font-semibold text-foreground">{t.name}</span>
                  <span className="text-sm font-extrabold text-primary">₹{t.price}</span>
                  <button onClick={() => handleDeleteType(t.id)} className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Assign Tab (Select category → auto-assign all types with their prices) ─────────────────────────────
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

  useEffect(() => { supabase.from("brands").select("*").order("name").then(({ data }) => { if (data) setBrands(data); }); }, []);
  useEffect(() => { supabase.from("screen_guard_categories").select("*").order("name").then(({ data }) => { if (data) setCategories(data); }); }, []);
  useEffect(() => { if (selectedBrand) { supabase.from("series").select("*").eq("brand_id", selectedBrand).order("name").then(({ data }) => { if (data) setSeriesList(data); }); } else setSeriesList([]); setSelectedSeries(""); }, [selectedBrand]);
  useEffect(() => { if (selectedSeries) { supabase.from("models").select("*").eq("series_id", selectedSeries).order("name").then(({ data }) => { if (data) setModels(data); }); } else setModels([]); setSelectedModel(""); }, [selectedSeries]);

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
    // Fetch all types in this category with their prices
    const { data: guardTypes } = await supabase.from("screen_guard_types").select("*").eq("category_id", selectedCategory).order("name");
    if (!guardTypes || guardTypes.length === 0) {
      toast.error("No guard types in this category");
      setSaving(false);
      return;
    }
    const inserts = (guardTypes as GuardType[]).map(t => ({
      model_id: selectedModel,
      guard_type: t.name,
      price: t.price,
    }));
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
          <p className="text-xs text-muted-foreground">Select a category to assign all its guard types with their default prices to this model.</p>
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

// ─── Main ServicesTab ─────────────────────────────
const ServicesTab = () => {
  return (
    <Tabs defaultValue="brands" className="mt-4">
      <TabsList className="w-full grid grid-cols-5 h-9">
        <TabsTrigger value="brands" className="text-[10px] gap-1"><Tag className="w-3 h-3" />Brands</TabsTrigger>
        <TabsTrigger value="series" className="text-[10px] gap-1"><Layers className="w-3 h-3" />Series</TabsTrigger>
        <TabsTrigger value="models" className="text-[10px] gap-1"><Smartphone className="w-3 h-3" />Models</TabsTrigger>
        <TabsTrigger value="screenguards" className="text-[10px] gap-1"><Grid3X3 className="w-3 h-3" />Guards</TabsTrigger>
        <TabsTrigger value="assign" className="text-[10px] gap-1"><Shield className="w-3 h-3" />Assign</TabsTrigger>
      </TabsList>
      <TabsContent value="brands"><BrandsTab /></TabsContent>
      <TabsContent value="series"><SeriesTab /></TabsContent>
      <TabsContent value="models"><ModelsTab /></TabsContent>
      <TabsContent value="screenguards"><ScreenGuardsManageTab /></TabsContent>
      <TabsContent value="assign"><ModelGuardsTab /></TabsContent>
    </Tabs>
  );
};

export default ServicesTab;
