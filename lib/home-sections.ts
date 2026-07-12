import type { CVData } from "@/lib/cv-data";

export const HOME_SECTION_IDS = [
  "projects",
  "skills",
  "activity",
  "about",
  "education",
  "languages",
  "publications",
  "contact",
] as const;

export type HomeSectionId = (typeof HOME_SECTION_IDS)[number];

export function getHomeSectionNumber(id: HomeSectionId) {
  return String(HOME_SECTION_IDS.indexOf(id) + 1).padStart(2, "0");
}

export function getHomeSectionItems(data: CVData) {
  return HOME_SECTION_IDS.map((id, index) => ({
    id,
    label: data.sections[id],
    number: String(index + 1).padStart(2, "0"),
  }));
}
