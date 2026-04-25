import { unstable_cache } from "next/cache";

import { slugify } from "@/src/lib/slug";
import { createPublicClient } from "@/src/lib/supabase/public";

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
  image_url: string | null;
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

export type SearchSeries = {
  id: string;
  brand_id: string;
  brand_name: string;
  brand_slug: string;
  name: string;
  slug: string;
};

export type SearchModel = {
  id: string;
  series_id: string;
  series_name: string;
  series_slug: string;
  brand_name: string;
  brand_slug: string;
  name: string;
  slug: string;
};

export type CatalogSearchIndex = {
  brands: CatalogBrand[];
  series: SearchSeries[];
  models: SearchModel[];
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

export const CATALOG_REVALIDATE_SECONDS = 300;

async function queryBrands(serviceType: "mobile" | "laptop") {
  const supabase = createPublicClient();
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

export const getBrandsForListing = unstable_cache(async (serviceType: "mobile" | "laptop" = "mobile"): Promise<CatalogBrand[]> => {
  try {
    return await queryBrands(serviceType);
  } catch {
    return fallbackBrands.filter((brand) => brand.service_type === serviceType);
  }
}, ["catalog-brands"], {
  revalidate: CATALOG_REVALIDATE_SECONDS,
  tags: ["catalog", "catalog-brands"],
});

export const getBrandBySlug = unstable_cache(
  async (brandSlug: string, serviceType?: "mobile" | "laptop"): Promise<CatalogBrand | null> => {
    try {
      const resolvedServiceType = serviceType ?? "mobile";
      const supabase = createPublicClient();
      const directMatch = await supabase
        .from("brands")
        .select("id, name, slug, letter, gradient, image_url, service_type")
        .eq("service_type", resolvedServiceType)
        .eq("slug", brandSlug)
        .maybeSingle();

      if (!directMatch.error && directMatch.data) {
        return {
          ...directMatch.data,
          slug: directMatch.data.slug || slugify(directMatch.data.name) || directMatch.data.id,
        };
      }

      const list = await getBrandsForListing(serviceType ?? "mobile");
      const listDirectMatch = list.find((brand) => brand.slug === brandSlug);

      if (listDirectMatch) {
        return listDirectMatch;
      }

      const fallbackMatch = list.find((brand) => slugify(brand.name) === brandSlug);
      return fallbackMatch ?? null;
    } catch {
      return null;
    }
  },
  ["catalog-brand-by-slug"],
  {
    revalidate: CATALOG_REVALIDATE_SECONDS,
    tags: ["catalog", "catalog-brands"],
  },
);

export const getSeriesForBrand = unstable_cache(async (brandId: string): Promise<CatalogSeries[]> => {
  try {
    const supabase = createPublicClient();
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
}, ["catalog-series"], {
  revalidate: CATALOG_REVALIDATE_SECONDS,
  tags: ["catalog", "catalog-series"],
});

export const getSeriesBySlug = unstable_cache(async (brandId: string, seriesSlug: string): Promise<CatalogSeries | null> => {
  try {
    const supabase = createPublicClient();
    const directMatch = await supabase
      .from("series")
      .select("id, brand_id, name, slug, image_url")
      .eq("brand_id", brandId)
      .eq("slug", seriesSlug)
      .maybeSingle();

    if (!directMatch.error && directMatch.data) {
      return {
        ...directMatch.data,
        slug: directMatch.data.slug || slugify(directMatch.data.name) || directMatch.data.id,
      };
    }

    const list = await getSeriesForBrand(brandId);
    const listDirectMatch = list.find((series) => series.slug === seriesSlug);

    if (listDirectMatch) {
      return listDirectMatch;
    }

    const fallbackMatch = list.find((series) => slugify(series.name) === seriesSlug);
    return fallbackMatch ?? null;
  } catch {
    return null;
  }
}, ["catalog-series-by-slug"], {
  revalidate: CATALOG_REVALIDATE_SECONDS,
  tags: ["catalog", "catalog-series"],
});

export const getModelsForSeries = unstable_cache(async (seriesId: string): Promise<CatalogModel[]> => {
  try {
    const supabase = createPublicClient();
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
}, ["catalog-models"], {
  revalidate: CATALOG_REVALIDATE_SECONDS,
  tags: ["catalog", "catalog-models"],
});

export const getModelBySlug = unstable_cache(async (seriesId: string, modelSlug: string): Promise<CatalogModel | null> => {
  try {
    const supabase = createPublicClient();
    const directMatch = await supabase
      .from("models")
      .select("id, series_id, name, slug, image_url")
      .eq("series_id", seriesId)
      .eq("slug", modelSlug)
      .maybeSingle();

    if (!directMatch.error && directMatch.data) {
      return {
        ...directMatch.data,
        slug: directMatch.data.slug || slugify(directMatch.data.name) || directMatch.data.id,
      };
    }

    const list = await getModelsForSeries(seriesId);
    const listDirectMatch = list.find((model) => model.slug === modelSlug);

    if (listDirectMatch) {
      return listDirectMatch;
    }

    const fallbackMatch = list.find((model) => slugify(model.name) === modelSlug);
    return fallbackMatch ?? null;
  } catch {
    return null;
  }
}, ["catalog-model-by-slug"], {
  revalidate: CATALOG_REVALIDATE_SECONDS,
  tags: ["catalog", "catalog-models"],
});

export const getModelScreenGuards = unstable_cache(async (modelId: string): Promise<ModelScreenGuard[]> => {
  try {
    const supabase = createPublicClient();
    const primaryQuery = await supabase
      .from("model_screen_guards")
      .select("id, guard_type, image_url, price")
      .eq("model_id", modelId)
      .order("guard_type");

    if (!primaryQuery.error && primaryQuery.data) {
      return primaryQuery.data;
    }

    const missingImageUrlColumn =
      primaryQuery.error?.message?.includes("image_url") &&
      primaryQuery.error.message.includes("model_screen_guards");

    if (!missingImageUrlColumn) {
      return [];
    }

    const fallbackQuery = await supabase
      .from("model_screen_guards")
      .select("id, guard_type, price")
      .eq("model_id", modelId)
      .order("guard_type");

    if (fallbackQuery.error || !fallbackQuery.data) {
      return [];
    }

    return fallbackQuery.data.map((guard) => ({
      ...guard,
      image_url: null,
    }));
  } catch {
    return [];
  }
}, ["catalog-model-screen-guards"], {
  revalidate: CATALOG_REVALIDATE_SECONDS,
  tags: ["catalog", "catalog-screen-guards"],
});

export const getRepairCategories = unstable_cache(async (serviceType: "mobile" | "laptop"): Promise<RepairCategory[]> => {
  try {
    const supabase = createPublicClient();
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
}, ["catalog-repair-categories"], {
  revalidate: CATALOG_REVALIDATE_SECONDS,
  tags: ["catalog", "catalog-repairs"],
});

export const getRepairSubcategories = unstable_cache(async (categoryIds: string[]): Promise<RepairSubcategory[]> => {
  if (categoryIds.length === 0) {
    return [];
  }

  try {
    const supabase = createPublicClient();
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
}, ["catalog-repair-subcategories"], {
  revalidate: CATALOG_REVALIDATE_SECONDS,
  tags: ["catalog", "catalog-repairs"],
});

export const getCatalogSearchIndex = unstable_cache(async (serviceType: "mobile" | "laptop"): Promise<CatalogSearchIndex> => {
  try {
    const brands = await getBrandsForListing(serviceType);

    if (brands.length === 0) {
      return { brands: [], series: [], models: [] };
    }

    const supabase = createPublicClient();
    const brandIds = brands.map((brand) => brand.id);
    const brandMap = new Map(brands.map((brand) => [brand.id, brand]));

    const seriesWithSlug = await supabase
      .from("series")
      .select("id, brand_id, name, slug")
      .in("brand_id", brandIds)
      .order("name");

    const seriesRows =
      !seriesWithSlug.error && seriesWithSlug.data
        ? seriesWithSlug.data
        : (
            await supabase
              .from("series")
              .select("id, brand_id, name")
              .in("brand_id", brandIds)
              .order("name")
          ).data ?? [];

    const series = seriesRows
      .map((seriesItem) => {
        const brand = brandMap.get(seriesItem.brand_id);
        if (!brand) {
          return null;
        }

        return {
          id: seriesItem.id,
          brand_id: seriesItem.brand_id,
          brand_name: brand.name,
          brand_slug: brand.slug,
          name: seriesItem.name,
          slug: ("slug" in seriesItem && typeof seriesItem.slug === "string" ? seriesItem.slug : null) || slugify(seriesItem.name) || seriesItem.id,
        } satisfies SearchSeries;
      })
      .filter((item): item is SearchSeries => item !== null);

    if (series.length === 0) {
      return { brands, series: [], models: [] };
    }

    const seriesIds = series.map((seriesItem) => seriesItem.id);
    const seriesMap = new Map(series.map((seriesItem) => [seriesItem.id, seriesItem]));

    const modelsWithSlug = await supabase
      .from("models")
      .select("id, series_id, name, slug")
      .in("series_id", seriesIds)
      .order("name");

    const modelRows =
      !modelsWithSlug.error && modelsWithSlug.data
        ? modelsWithSlug.data
        : (
            await supabase
              .from("models")
              .select("id, series_id, name")
              .in("series_id", seriesIds)
              .order("name")
          ).data ?? [];

    const models = modelRows
      .map((modelItem) => {
        const seriesItem = seriesMap.get(modelItem.series_id);
        if (!seriesItem) {
          return null;
        }

        return {
          id: modelItem.id,
          series_id: modelItem.series_id,
          series_name: seriesItem.name,
          series_slug: seriesItem.slug,
          brand_name: seriesItem.brand_name,
          brand_slug: seriesItem.brand_slug,
          name: modelItem.name,
          slug: ("slug" in modelItem && typeof modelItem.slug === "string" ? modelItem.slug : null) || slugify(modelItem.name) || modelItem.id,
        } satisfies SearchModel;
      })
      .filter((item): item is SearchModel => item !== null);

    return { brands, series, models };
  } catch {
    return { brands: [], series: [], models: [] };
  }
}, ["catalog-search-index"], {
  revalidate: CATALOG_REVALIDATE_SECONDS,
  tags: ["catalog", "catalog-brands", "catalog-series", "catalog-models"],
});
