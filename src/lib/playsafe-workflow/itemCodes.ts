import { checkItems } from "@/data/playsafe/checks";
import { CHECKLIST_VERSION } from "./constants";

export function checklistItemCodes(version = CHECKLIST_VERSION): string[] {
  if (version !== CHECKLIST_VERSION) return [];
  return checkItems.map((item) => item.code);
}
