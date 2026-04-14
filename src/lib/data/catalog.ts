import { cache } from "react";

import { createClient } from "@/src/lib/supabase/server";
import { slugify } from "@/src/lib/slug";

export type CatalogBrand = {
  id: string;
  name: string;
  slug: string;
  letter: string;
  gradient: string;
  image_url: string | null;
  service_type: string;
};

export type CatalogSeries = {
  id: string;
  brand_id: string;
  name: string;
  slug: string;
  image_url: string | null;
};

export type CatalogModel = {
  id: string;
  series_id: string;
  name: string;
  slug: string;
  image_url: string | null;
};

export type ModelScreenGuard = {
  id: string;
  guard_type: string;
  price: number;
};

export type RepairCategory = {
  id: string;
  name: string;
  image_url: string | null;
  service_type: string;
};

export type RepairSubcategory = {
  id: string;
  category_id: string;
  name: string;
  image_url: string | null;
  price: number;
};

const fallbackBrands: CatalogBrand[] = [
  { id: "apple", name: "Apple", slug: "apple", letter: "A", gradient: "from-gray-700 to-gray-900", image_url: null, service_type: "mobile" },
  { id: "samsung", name: "Samsung", slug: "samsung", letter: "S", gradient: "from-blue-500 to-blue-700", image_url: null, service_type: "mobile" },
  { id: "google", name: "Google", slug: "google", letter: "G", gradient: "from-red-400 to-yellow-400", image_url: null, service_type: "mobile" },
  { id: "oneplus", name: "OnePlus", slug: "oneplus", letter: "1+", gradient: "from-red-500 to-red-700", image_url: null, service_type: "mobile" },
  { id: "xiaomi", name: "Xiaomi", slug: "xiaomi", letter: "Mi", gradient: "from-orange-400 to-orange-600", image_url: null, service_type: "mobile" },
  { id: "dell", name: "Dell", slug: "dell", letter: "D", gradient: "from-sky-500 to-blue-600", image_url: null, service_type: "laptop" },
  { id: "hp", name: "HP", slug: "hp", letter: "HP", gradient: "from-indigo-500 to-sky-500", image_url: null, service_type: "laptop" },
  { id: "lenovo", name: "Lenovo", slug: "lenovo", letter: "L", gradient: "from-red-500 to-rose-600", image_url: null, service_type: "laptop" },
];

async function queryBrands(serviceType: "mobile" | "laptop") {
  const supabase = await createClient();
  const withSlug = await supabase
    .from("brands")
    .select("id, name, slug, letter, gradient, image_url, service_type")
    .eq("service_type", serviceType)
    .order("sort_order")
    .order("name");

  if (!withSlug.error && withSlug.data) {
    return withSlug.data.map((brand) => ({
      ...brand,
      slug: brand.slug || slugify(brand.name) || brand.id,
    }));
  }

  const withoutSlug = await supabase
    .from("brands")
    .select("id, name, letter, gradient, image_url, service_type")
    .eq("service_type", serviceType)
    .order("sort_order")
    .order("name");

  if (!withoutSlug.error && withoutSlug.data) {
    return withoutSlug.data.map((brand) => ({
      ...brand,
      slug: slugify(brand.name) || brand.id,
    }));
  }

  return fallbackBrands.filter((brand) => brand.service_type === serviceType);
}

export const getBrandsForListing = cache(async (serviceType: "mobile" | "laptop" = "mobile"): Promise<CatalogBrand[]> => {
  try {
    return await queryBrands(serviceType);
  } catch {
    return fallbackBrands.filter((brand) => brand.service_type === serviceType);
  }
});

export const getBrandBySlug = cache(
  async (brandSlug: string, serviceType?: "mobile" | "laptop"): Promise<CatalogBrand | null> => {
    try {
      const list = await getBrandsForListing(serviceType ?? "mobile");
      const directMatch = list.find((brand) => brand.slug === brandSlug);

      if (directMatch) {
        return directMatch;
      }

      const fallbackMatch = list.find((brand) => slugify(brand.name) === brandSlug);
      return fallbackMatch ?? null;
    } catch {
      return null;
    }
  },
);

export const getSeriesForBrand = cache(async (brandId: string): Promise<CatalogSeries[]> => {
  try {
    const supabase = await createClient();
    const withSlug = await supabase
      .from("series")
      .select("id, brand_id, name, slug, image_url")
      .eq("brand_id", brandId)
      .order("name");

    if (!withSlug.error && withSlug.data) {
      return withSlug.data.map((series) => ({
        ...series,
        slug: series.slug || slugify(series.name) || series.id,
      }));
    }

    const withoutSlug = await supabase
      .from("series")
      .select("id, brand_id, name, image_url")
      .eq("brand_id", brandId)
      .order("name");

    if (!withoutSlug.error && withoutSlug.data) {
      return withoutSlug.data.map((series) => ({
        ...series,
        slug: slugify(series.name) || series.id,
      }));
    }

    return [];
  } catch {
    return [];
  }
});

export const getSeriesBySlug = cache(async (brandId: string, seriesSlug: string): Promise<CatalogSeries | null> => {
  try {
    const list = await getSeriesForBrand(brandId);
    const directMatch = list.find((series) => series.slug === seriesSlug);

    if (directMatch) {
      return directMatch;
    }

    const fallbackMatch = list.find((series) => slugify(series.name) === seriesSlug);
    return fallbackMatch ?? null;
  } catch {
    return null;
  }
});

export const getModelsForSeries = cache(async (seriesId: string): Promise<CatalogModel[]> => {
  try {
    const supabase = await createClient();
    const withSlug = await supabase
      .from("models")
      .select("id, series_id, name, slug, image_url")
      .eq("series_id", seriesId)
      .order("name");

    if (!withSlug.error && withSlug.data) {
      return withSlug.data.map((model) => ({
        ...model,
        slug: model.slug || slugify(model.name) || model.id,
      }));
    }

    const withoutSlug = await supabase
      .from("models")
      .select("id, series_id, name, image_url")
      .eq("series_id", seriesId)
      .order("name");

    if (!withoutSlug.error && withoutSlug.data) {
      return withoutSlug.data.map((model) => ({
        ...model,
        slug: slugify(model.name) || model.id,
      }));
    }

    return [];
  } catch {
    return [];
  }
});

export const getModelBySlug = cache(async (seriesId: string, modelSlug: string): Promise<CatalogModel | null> => {
  try {
    const list = await getModelsForSeries(seriesId);
    const directMatch = list.find((model) => model.slug === modelSlug);

    if (directMatch) {
      return directMatch;
    }

    const fallbackMatch = list.find((model) => slugify(model.name) === modelSlug);
    return fallbackMatch ?? null;
  } catch {
    return null;
  }
});

export const getModelScreenGuards = cache(async (modelId: string): Promise<ModelScreenGuard[]> => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("model_screen_guards")
      .select("id, guard_type, price")
      .eq("model_id", modelId)
      .order("guard_type");

    if (error || !data) {
      return [];
    }

    return data;
  } catch {
    return [];
  }
});

export const getRepairCategories = cache(async (serviceType: "mobile" | "laptop"): Promise<RepairCategory[]> => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("repair_categories")
      .select("id, name, image_url, service_type")
      .eq("service_type", serviceType)
      .order("name");

    if (error || !data) {
      return [];
    }

    return data;
  } catch {
    return [];
  }
});

export const getRepairSubcategories = cache(async (categoryIds: string[]): Promise<RepairSubcategory[]> => {
  if (categoryIds.length === 0) {
    return [];
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("repair_subcategories")
      .select("id, category_id, name, image_url, price")
      .in("category_id", categoryIds)
      .order("name");

    if (error || !data) {
      return [];
    }

    return data;
  } catch {
    return [];
  }
});
