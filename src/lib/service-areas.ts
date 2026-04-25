import { slugify } from "@/src/lib/slug";

const bangaloreAreaNames = [
  "BTM Layout",
  "Electronic City",
  "Koramangala",
  "HSR Layout",
  "Whitefield",
  "Mahadevapura",
  "Jayanagar",
  "Rajajinagar",
  "Malleshwaram",
  "Chickpet",
  "Marathahalli",
  "JP Nagar",
  "Banashankari",
  "Bommanahalli",
  "Channasandra",
  "Commercial Street",
  "Kundanahalli",
  "RT Nagar",
  "Basaveshwaranagar",
  "Domlur",
  "Brigade Road",
  "Yelahanka",
  "Kengeri",
  "Mathikere",
  "Yeshwantpur",
  "ITPL Bangalore",
  "Ramanagara",
  "Sarjapur Road",
  "Uttarahalli",
  "SP Road",
  "Richmond Town",
  "Murphy Town",
  "Fraser Town",
  "Cox Town",
  "Sadashivnagar",
  "Seshadripuram",
  "Shivajinagar",
  "Ulsoor",
  "Vasanth Nagar",
  "Hoodi",
  "Varthur",
  "Horamavu",
  "Kalyan Nagar",
  "Kammanahalli",
  "Lingarajapuram",
  "Ramamurthy Nagar",
  "Hebbal",
  "Jalahalli",
  "Peenya",
  "Vidyaranyapura",
  "Bommasandra",
  "Madivala",
  "Basavanagudi",
  "Indiranagar",
  "Giri Nagar",
  "Kumaraswamy Layout",
  "KR Market",
  "Padmanabhanagar",
  "Anjanapura",
  "Kempegowda",
  "Arekere",
  "Hoskote",
  "Begur",
  "Gottigere",
  "Hulimavu",
  "Kamakshipalya",
  "Mahalakshmi Layout",
  "Nagarbhavi",
  "Nandini Layout",
  "Attibele",
  "Jigani",
  "Anekal",
  "MG Road",
  "Majestic",
  "Chandapura",
  "Nelamangala",
  "HBR Layout",
] as const;

export type BangaloreArea = {
  name: string;
  slug: string;
};

export const bangaloreAreas: BangaloreArea[] = bangaloreAreaNames.map((name) => ({
  name,
  slug: slugify(name),
}));

export function getBangaloreAreaBySlug(areaSlug: string) {
  return bangaloreAreas.find((area) => area.slug === areaSlug) ?? null;
}

export function buildBangaloreAreaRoute(areaSlug: string) {
  return `/bangalore/${areaSlug}`;
}
