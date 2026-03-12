import type { AssetLink, CompanySnapshot } from "@/lib/domain";
import { parseCommaList, parseLines, uniqueStrings } from "@/lib/utils";

const parseAssetJson = (value: FormDataEntryValue | null) => {
  try {
    return JSON.parse(String(value || "[]")) as AssetLink[];
  } catch {
    return [];
  }
};

export function parseCompanySnapshotFromForm(
  formData: FormData,
  uploadedMaterials: AssetLink[],
  uploadedGallery: AssetLink[],
): CompanySnapshot {
  const existingMaterials = parseAssetJson(formData.get("existingMaterialsJson"));
  const existingGallery = parseAssetJson(formData.get("existingGalleryJson"));

  const manualMaterials = parseLines(formData.get("materialsText")).map((name) => ({ name }));
  const manualGallery = parseLines(formData.get("galleryText")).map((name) => ({ name }));

  const materials = [...existingMaterials, ...manualMaterials, ...uploadedMaterials].filter(
    (item, index, array) => array.findIndex((candidate) => candidate.name === item.name) === index,
  );

  const gallery = [...existingGallery, ...manualGallery, ...uploadedGallery].filter(
    (item, index, array) => array.findIndex((candidate) => candidate.name === item.name) === index,
  );

  return {
    name: String(formData.get("name") || ""),
    industry: String(formData.get("industry") || ""),
    city: String(formData.get("city") || ""),
    address: String(formData.get("address") || ""),
    website: String(formData.get("website") || ""),
    summary: String(formData.get("summary") || ""),
    business: parseLines(formData.get("business")),
    relatedFields: uniqueStrings(
      formData.getAll("relatedFields").map((value) => String(value)).filter(Boolean),
    ),
    departments: uniqueStrings(
      formData.getAll("departments").map((value) => String(value)).filter(Boolean),
    ),
    acceptanceItems: parseLines(formData.get("acceptanceItems")),
    keywords: parseCommaList(formData.get("keywords")),
    materials,
    gallery,
    hiringInfo: String(formData.get("hiringInfo") || ""),
    message: String(formData.get("message") || ""),
    internshipAvailable: String(formData.get("internshipAvailable")) === "true",
    siteVisitAvailable: String(formData.get("siteVisitAvailable")) === "true",
  };
}
