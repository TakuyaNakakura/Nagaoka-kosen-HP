import type {
  Company,
  EventItem,
  Faculty,
  Guide,
  NewsArticle,
  OrganizationInfo,
  PermissionProfile,
  ResearchSeed,
} from "@prisma/client";

export type AssetLink = {
  name: string;
  url?: string;
};

export type CompanySnapshot = {
  name: string;
  industry: string;
  city: string;
  address: string;
  website: string;
  summary: string;
  business: string[];
  relatedFields: string[];
  departments: string[];
  acceptanceItems: string[];
  keywords: string[];
  materials: AssetLink[];
  gallery: AssetLink[];
  hiringInfo: string;
  message: string;
  internshipAvailable: boolean;
  siteVisitAvailable: boolean;
};

const safeParse = <T,>(raw: string, fallback: T): T => {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

export function toJson(value: unknown) {
  return JSON.stringify(value);
}

export function readStringArray(raw: string) {
  return safeParse<string[]>(raw, []);
}

export function readAssetLinks(raw: string) {
  return safeParse<AssetLink[]>(raw, []);
}

export function companyToSnapshot(company: Pick<
  Company,
  | "name"
  | "industry"
  | "city"
  | "address"
  | "website"
  | "summary"
  | "businessJson"
  | "relatedFieldsJson"
  | "departmentsJson"
  | "acceptanceItemsJson"
  | "keywordsJson"
  | "materialsJson"
  | "galleryJson"
  | "hiringInfo"
  | "message"
  | "internshipAvailable"
  | "siteVisitAvailable"
>): CompanySnapshot {
  return {
    name: company.name,
    industry: company.industry,
    city: company.city,
    address: company.address,
    website: company.website,
    summary: company.summary,
    business: readStringArray(company.businessJson),
    relatedFields: readStringArray(company.relatedFieldsJson),
    departments: readStringArray(company.departmentsJson),
    acceptanceItems: readStringArray(company.acceptanceItemsJson),
    keywords: readStringArray(company.keywordsJson),
    materials: readAssetLinks(company.materialsJson),
    gallery: readAssetLinks(company.galleryJson),
    hiringInfo: company.hiringInfo,
    message: company.message,
    internshipAvailable: company.internshipAvailable,
    siteVisitAvailable: company.siteVisitAvailable,
  };
}

export function snapshotToCompanyInput(snapshot: CompanySnapshot) {
  return {
    name: snapshot.name,
    industry: snapshot.industry,
    city: snapshot.city,
    address: snapshot.address,
    website: snapshot.website,
    summary: snapshot.summary,
    businessJson: toJson(snapshot.business),
    relatedFieldsJson: toJson(snapshot.relatedFields),
    departmentsJson: toJson(snapshot.departments),
    acceptanceItemsJson: toJson(snapshot.acceptanceItems),
    keywordsJson: toJson(snapshot.keywords),
    materialsJson: toJson(snapshot.materials),
    galleryJson: toJson(snapshot.gallery),
    hiringInfo: snapshot.hiringInfo,
    message: snapshot.message,
    internshipAvailable: snapshot.internshipAvailable,
    siteVisitAvailable: snapshot.siteVisitAvailable,
  };
}

export function facultySpecialties(faculty: Pick<Faculty, "specialtiesJson">) {
  return readStringArray(faculty.specialtiesJson);
}

export function seedKeywords(seed: Pick<ResearchSeed, "keywordsJson">) {
  return readStringArray(seed.keywordsJson);
}

export function articleAttachments(article: Pick<NewsArticle, "attachmentsJson">) {
  return readStringArray(article.attachmentsJson);
}

export function organizationPurpose(org: Pick<OrganizationInfo, "purposeJson">) {
  return readStringArray(org.purposeJson);
}

export function organizationOfficers(org: Pick<OrganizationInfo, "officersJson">) {
  return readStringArray(org.officersJson);
}

export function organizationRules(org: Pick<OrganizationInfo, "rulesJson">) {
  return readStringArray(org.rulesJson);
}

export function organizationPlans(org: Pick<OrganizationInfo, "membershipPlansJson">) {
  return safeParse<
    {
      id: string;
      name: string;
      fee: string;
      audience: string;
      benefits: string[];
    }[]
  >(org.membershipPlansJson, []);
}

export function permissionCapabilities(profile: Pick<PermissionProfile, "capabilitiesJson">) {
  return readStringArray(profile.capabilitiesJson);
}

export function guideBody(guide: Pick<Guide, "body">) {
  return guide.body;
}

export type PublicCompany = Company & { snapshot: CompanySnapshot };
export type PublicFaculty = Faculty & { specialties: string[] };
export type PublicSeed = ResearchSeed & { keywords: string[] };
export type PublicArticle = NewsArticle & { attachments: string[] };
export type PublicEvent = EventItem;
