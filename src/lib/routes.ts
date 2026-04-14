export const serviceTypes = ["screen-guard", "mobile-repair", "laptop-repair"] as const;

export type ServiceType = (typeof serviceTypes)[number];

export const appRouteMap = [
  {
    group: "Public",
    title: "All Brands",
    href: "/brands",
    description: "Top-level SSR brand listing route using slug-based navigation.",
  },
  {
    group: "Public",
    title: "Brand Detail",
    href: "/brands/sample-brand",
    description: "Brand-specific catalog route using [brandSlug].",
  },
  {
    group: "Public",
    title: "Series Detail",
    href: "/brands/sample-brand/sample-series",
    description: "Series-specific catalog route using nested slugs.",
  },
  {
    group: "Public",
    title: "Model Detail",
    href: "/brands/sample-brand/sample-series/sample-model",
    description: "Model-specific screen guard booking route using nested slugs.",
  },
  {
    group: "Service",
    title: "Service Landing",
    href: "/service/mobile-repair",
    description: "Dedicated service landing page route for SSR and SEO.",
  },
  {
    group: "Service",
    title: "Service Booking",
    href: "/service/laptop-repair/book/sample-brand/sample-series/sample-model",
    description: "Dedicated service booking page route using service + nested slugs.",
  },
  {
    group: "Secure",
    title: "Customer Account",
    href: "/account",
    description: "Server-protected account route placeholder.",
  },
  {
    group: "Secure",
    title: "Admin Dashboard",
    href: "/admin/dashboard",
    description: "Protected admin shell for migrated dashboard modules.",
  },
] as const;

export function buildBrandRoute(brandSlug: string) {
  return `/brands/${brandSlug}`;
}

export function buildSeriesRoute(brandSlug: string, seriesSlug: string) {
  return `/brands/${brandSlug}/${seriesSlug}`;
}

export function buildModelRoute(brandSlug: string, seriesSlug: string, modelSlug: string) {
  return `/brands/${brandSlug}/${seriesSlug}/${modelSlug}`;
}

export function buildServiceRoute(serviceType: ServiceType) {
  return serviceType === "screen-guard" ? "/" : `/service/${serviceType}`;
}

export function buildServiceBrandsRoute(serviceType: ServiceType) {
  return `/service/${serviceType}/brands`;
}

export function buildServiceSeriesRoute(serviceType: ServiceType, brandSlug: string, seriesSlug?: string) {
  if (!seriesSlug) {
    return `/service/${serviceType}/brands/${brandSlug}`;
  }

  return `/service/${serviceType}/brands/${brandSlug}/${seriesSlug}`;
}

export function buildServiceBookingRoute(
  serviceType: Exclude<ServiceType, "screen-guard">,
  brandSlug: string,
  seriesSlug: string,
  modelSlug: string,
) {
  return `/service/${serviceType}/book/${brandSlug}/${seriesSlug}/${modelSlug}`;
}
