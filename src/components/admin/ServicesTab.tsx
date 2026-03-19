import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  ChevronRight, Plus, Trash2, Pencil, ArrowLeft, Loader2, X, Check, Shield, ImagePlus
} from "lucide-react";

type Brand = { id: string; name: string; letter: string; gradient: string; sort_order: number; image_url: string | null };
type Series = { id: string; brand_id: string; name: string };
type Model = { id: string; series_id: string; name: string };
type Guard = { id: string; model_id: string; guard_type: string; price: number };

type Level = "brands" | "series" | "models" | "guards";

const gradientOptions = [
  "from-blue-500 to-cyan-500",
  "from-violet-500 to-purple-600",
  "from-amber-400 to-orange-500",
  "from-emerald-400 to-teal-500",
  "from-rose-500 to-pink-500",
  "from-indigo-500 to-blue-600",
  "from-yellow-400 to-amber-500",
  "from-cyan-400 to-blue-500",
  "from-fuchsia-500 to-purple-500",
];

const guardTypeOptions = ["Tempered Glass", "Privacy Guard", "Matte Guard", "UV Glass", "Ceramic Guard"];

const ServicesTab = () => {
  const [level, setLevel] = useState<Level>("brands");
  const [brands, setBrands] = useState<Brand[]>([]);
  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [guards, setGuards] = useState<Guard[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [selectedSeries, setSelectedSeries] = useState<Series | null>(null);
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [loading, setLoading] = useState(true);

  // Add form states
  const [showAdd, setShowAdd] = useState(false);
  const [addName, setAddName] = useState("");
  const [addLetter, setAddLetter] = useState("");
  const [addGradient, setAddGradient] = useState(gradientOptions[0]);
  const [addGuardType, setAddGuardType] = useState(guardTypeOptions[0]);
  const [addPrice, setAddPrice] = useState("");
  const [saving, setSaving] = useState(false);

  // Edit states
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const fetchBrands = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("brands").select("*").order("sort_order").order("name");
    if (data) setBrands(data);
    setLoading(false);
  }, []);

  const fetchSeries = useCallback(async (brandId: string) => {
    setLoading(true);
    const { data } = await supabase.from("series").select("*").eq("brand_id", brandId).order("name");
    if (data) setSeriesList(data);
    setLoading(false);
  }, []);

  const fetchModels = useCallback(async (seriesId: string) => {
    setLoading(true);
    const { data } = await supabase.from("models").select("*").eq("series_id", seriesId).order("name");
    if (data) setModels(data);
    setLoading(false);
  }, []);

  const fetchGuards = useCallback(async (modelId: string) => {
    setLoading(true);
    const { data } = await supabase.from("model_screen_guards").select("*").eq("model_id", modelId).order("guard_type");
    if (data) setGuards(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchBrands(); }, [fetchBrands]);

  // Image upload state
  const [addImage, setAddImage] = useState<File | null>(null);
  const [addImagePreview, setAddImagePreview] = useState<string | null>(null);

  const resetAdd = () => {
    setShowAdd(false);
    setAddName("");
    setAddLetter("");
    setAddGradient(gradientOptions[0]);
    setAddGuardType(guardTypeOptions[0]);
    setAddPrice("");
    setAddImage(null);
    setAddImagePreview(null);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAddImage(file);
      setAddImagePreview(URL.createObjectURL(file));
    }
  };

  const uploadBrandImage = async (brandId: string, file: File): Promise<string | null> => {
    const ext = file.name.split(".").pop();
    const path = `${brandId}.${ext}`;
    const { error } = await supabase.storage.from("brand-images").upload(path, file, { upsert: true });
    if (error) { toast.error("Image upload failed"); return null; }
    const { data } = supabase.storage.from("brand-images").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleAdd = async () => {
    if (level === "guards") {
      if (!addPrice) return;
    } else if (!addName.trim()) return;

    setSaving(true);
    let error;

    if (level === "brands") {
      const { data: inserted, error: insertErr } = await supabase.from("brands").insert({
        name: addName.trim(),
        letter: (addLetter.trim() || addName.charAt(0)).toUpperCase(),
        gradient: addGradient,
      }).select().single();
      error = insertErr;
      if (!error && inserted && addImage) {
        const imageUrl = await uploadBrandImage(inserted.id, addImage);
        if (imageUrl) {
          await supabase.from("brands").update({ image_url: imageUrl }).eq("id", inserted.id);
        }
      }
      if (!error) fetchBrands();
    } else if (level === "series" && selectedBrand) {
      ({ error } = await supabase.from("series").insert({
        brand_id: selectedBrand.id,
        name: addName.trim(),
      }));
      if (!error) fetchSeries(selectedBrand.id);
    } else if (level === "models" && selectedSeries) {
      ({ error } = await supabase.from("models").insert({
        series_id: selectedSeries.id,
        name: addName.trim(),
      }));
      if (!error) fetchModels(selectedSeries.id);
    } else if (level === "guards" && selectedModel) {
      ({ error } = await supabase.from("model_screen_guards").insert({
        model_id: selectedModel.id,
        guard_type: addGuardType,
        price: parseFloat(addPrice),
      }));
      if (!error) fetchGuards(selectedModel.id);
    }

    if (error) toast.error(error.message);
    else toast.success("Added successfully");
    setSaving(false);
    resetAdd();
  };

  const handleDelete = async (table: string, id: string) => {
    const { error } = await (supabase.from(table as any) as any).delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Deleted");
      if (level === "brands") fetchBrands();
      else if (level === "series" && selectedBrand) fetchSeries(selectedBrand.id);
      else if (level === "models" && selectedSeries) fetchModels(selectedSeries.id);
      else if (level === "guards" && selectedModel) fetchGuards(selectedModel.id);
    }
  };

  const handleEdit = async (table: string, id: string) => {
    if (!editName.trim()) return;
    const { error } = await (supabase.from(table as any) as any).update({ name: editName.trim() }).eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Updated");
      setEditId(null);
      if (level === "brands") fetchBrands();
      else if (level === "series" && selectedBrand) fetchSeries(selectedBrand.id);
      else if (level === "models" && selectedSeries) fetchModels(selectedSeries.id);
    }
  };

  const navigateTo = (newLevel: Level, brand?: Brand, series?: Series, model?: Model) => {
    resetAdd();
    setEditId(null);
    if (newLevel === "brands") {
      setLevel("brands");
      setSelectedBrand(null);
      setSelectedSeries(null);
      setSelectedModel(null);
    } else if (newLevel === "series" && brand) {
      setSelectedBrand(brand);
      setSelectedSeries(null);
      setSelectedModel(null);
      setLevel("series");
      fetchSeries(brand.id);
    } else if (newLevel === "models" && series) {
      setSelectedSeries(series);
      setSelectedModel(null);
      setLevel("models");
      fetchModels(series.id);
    } else if (newLevel === "guards" && model) {
      setSelectedModel(model);
      setLevel("guards");
      fetchGuards(model.id);
    }
  };

  const goBack = () => {
    resetAdd();
    setEditId(null);
    if (level === "guards") navigateTo("models", undefined, selectedSeries!);
    else if (level === "models") navigateTo("series", selectedBrand!);
    else if (level === "series") navigateTo("brands");
  };

  const breadcrumbs = [
    { label: "Brands", onClick: () => navigateTo("brands"), active: level === "brands" },
    ...(selectedBrand ? [{ label: selectedBrand.name, onClick: () => navigateTo("series", selectedBrand), active: level === "series" }] : []),
    ...(selectedSeries ? [{ label: selectedSeries.name, onClick: () => navigateTo("models", undefined, selectedSeries), active: level === "models" }] : []),
    ...(selectedModel ? [{ label: selectedModel.name, onClick: () => {}, active: level === "guards" }] : []),
  ];

  const currentItems = level === "brands" ? brands : level === "series" ? seriesList : level === "models" ? models : guards;
  const tableName = level === "brands" ? "brands" : level === "series" ? "series" : level === "models" ? "models" : "model_screen_guards";
  const itemLabel = level === "brands" ? "Brand" : level === "series" ? "Series" : level === "models" ? "Model" : "Screen Guard";

  return (
    <div className="mt-4">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-1 text-xs font-semibold mb-4 flex-wrap">
        {level !== "brands" && (
          <button onClick={goBack} className="p-1 rounded-md hover:bg-secondary text-muted-foreground mr-1">
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
        )}
        {breadcrumbs.map((bc, i) => (
          <span key={i} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="w-3 h-3 text-muted-foreground" />}
            <button
              onClick={bc.onClick}
              className={`px-2 py-0.5 rounded-md transition-colors ${bc.active ? "text-foreground bg-secondary" : "text-muted-foreground hover:text-foreground"}`}
            >
              {bc.label}
            </button>
          </span>
        ))}
      </div>

      {/* Add button */}
      {!showAdd && (
        <button
          onClick={() => setShowAdd(true)}
          className="mb-4 flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary/80 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> Add {itemLabel}
        </button>
      )}

      {/* Add form */}
      {showAdd && (
        <div className="mb-4 p-4 rounded-xl bg-card border border-border space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-foreground">Add {itemLabel}</span>
            <button onClick={resetAdd} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
          </div>

          {level === "guards" ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">Guard Type</label>
                  <select
                    value={addGuardType}
                    onChange={(e) => setAddGuardType(e.target.value)}
                    className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    {guardTypeOptions.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">Price (₹)</label>
                  <input
                    type="number"
                    placeholder="99"
                    value={addPrice}
                    onChange={(e) => setAddPrice(e.target.value)}
                    className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <input
                placeholder={`${itemLabel} name`}
                value={addName}
                onChange={(e) => setAddName(e.target.value)}
                className="w-full text-sm border border-border rounded-lg px-3 py-2.5 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                autoFocus
              />
              {level === "brands" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1 block">Letter</label>
                    <input
                      placeholder="A"
                      maxLength={2}
                      value={addLetter}
                      onChange={(e) => setAddLetter(e.target.value)}
                      className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1 block">Color</label>
                    <div className="flex gap-1.5 flex-wrap">
                      {gradientOptions.map(g => (
                        <button
                          key={g}
                          onClick={() => setAddGradient(g)}
                          className={`w-6 h-6 rounded-full bg-gradient-to-br ${g} border-2 transition-all ${addGradient === g ? "border-foreground scale-110" : "border-transparent"}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          <button
            onClick={handleAdd}
            disabled={saving}
            className="w-full py-2.5 rounded-xl gradient-brand text-primary-foreground text-xs font-bold disabled:opacity-60 flex items-center justify-center gap-1.5"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
            Add {itemLabel}
          </button>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
      ) : currentItems.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Shield className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm font-semibold">No {itemLabel.toLowerCase()}s yet</p>
          <p className="text-xs mt-1">Click "Add {itemLabel}" to get started</p>
        </div>
      ) : (
        <div className="space-y-2">
          {level === "guards"
            ? (guards as Guard[]).map((g) => (
                <div key={g.id} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border">
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-bold text-foreground">{g.guard_type}</span>
                    <span className="ml-2 text-sm font-extrabold text-primary">₹{g.price}</span>
                  </div>
                  <button onClick={() => handleDelete("model_screen_guards", g.id)} className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            : (currentItems as { id: string; name: string }[]).map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border group">
                  {level === "brands" && (
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${(item as Brand).gradient} flex items-center justify-center text-xs font-bold text-white flex-shrink-0`}>
                      {(item as Brand).letter}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    {editId === item.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="flex-1 text-sm border border-border rounded-lg px-2 py-1 bg-background text-foreground focus:outline-none"
                          autoFocus
                          onKeyDown={(e) => e.key === "Enter" && handleEdit(tableName, item.id)}
                        />
                        <button onClick={() => handleEdit(tableName, item.id)} className="p-1 text-primary"><Check className="w-4 h-4" /></button>
                        <button onClick={() => setEditId(null)} className="p-1 text-muted-foreground"><X className="w-4 h-4" /></button>
                      </div>
                    ) : (
                      <span className="text-sm font-semibold text-foreground">{item.name}</span>
                    )}
                  </div>

                  {editId !== item.id && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => { setEditId(item.id); setEditName(item.name); }}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(tableName, item.id)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {(level as string) !== "guards" && editId !== item.id && (
                    <button
                      onClick={() => {
                        if (level === "brands") navigateTo("series", item as Brand);
                        else if (level === "series") navigateTo("models", undefined, item as Series);
                        else if (level === "models") navigateTo("guards", undefined, undefined, item as Model);
                      }}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))
          }
        </div>
      )}
    </div>
  );
};

export default ServicesTab;
