// 관리자 화면 확인용: "[더미]" 시설의 기구·위험요소 항목에 샘플 사진을 업로드하고 DB에 연결한다.
// 사용법: node --env-file=.env.local scripts/seed-playsafe-dummy-photos.mjs
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";

const IMAGE_DIR = new URL("./seed-assets/playsafe/", import.meta.url);
const DUMMY_PREFIX = "[더미]";
const EQUIPMENT_BUCKET = "playsafe-equipment-photos";
const CHECKLIST_BUCKET = "playsafe-checklist-photos";

const EQUIPMENT_IMAGES = {
  water: "dummy-equip-water.jpg",
  combo: "dummy-equip-combo.jpg",
  swing: "dummy-equip-swing.jpg",
};
const DEFAULT_EQUIPMENT_IMAGE = EQUIPMENT_IMAGES.combo;

const CHECKLIST_IMAGES_BY_CATEGORY = {
  drowning: ["dummy-risk-drowning.jpg", "dummy-risk-drowning-2.jpg"],
  collision: ["dummy-risk-collision.jpg"],
};
const DEFAULT_CHECKLIST_IMAGES = ["dummy-risk-collision.jpg"];

const checklistImagesFor = (itemCode) =>
  CHECKLIST_IMAGES_BY_CATEGORY[itemCode.split("-")[0]] ?? DEFAULT_CHECKLIST_IMAGES;

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

async function upload(bucket, path, fileName) {
  const body = await readFile(new URL(fileName, IMAGE_DIR));
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, body, { contentType: "image/jpeg", upsert: true, cacheControl: "31536000" });
  if (error) throw new Error(`${bucket}/${path}: ${error.message}`);
  return body.byteLength;
}

/** 원본(압축본)과 `.thumb` 썸네일을 함께 올리고 두 경로를 돌려준다. */
async function uploadWithThumb(bucket, base, fileName) {
  const path = `${base}.jpg`;
  const thumbPath = `${base}.thumb.jpg`;
  const bytes = await upload(bucket, path, fileName);
  await upload(bucket, thumbPath, fileName.replace(/\.jpg$/, ".thumb.jpg"));
  return { path, thumbPath, bytes };
}

async function dummyRegistrationIds() {
  const { data, error } = await supabase
    .from("playsafe_registrations")
    .select("id")
    .like("facility_name", `${DUMMY_PREFIX}%`);
  if (error) throw error;
  return data.map((row) => row.id);
}

async function seedEquipment(registrationIds) {
  const { data, error } = await supabase
    .from("playsafe_registration_equipment")
    .select("id, registration_id, type_code")
    .in("registration_id", registrationIds);
  if (error) throw error;

  for (const row of data) {
    const { path, thumbPath } = await uploadWithThumb(
      EQUIPMENT_BUCKET,
      `${row.registration_id}/${row.id}`,
      EQUIPMENT_IMAGES[row.type_code] ?? DEFAULT_EQUIPMENT_IMAGE,
    );
    const { error: updateError } = await supabase
      .from("playsafe_registration_equipment")
      .update({ photo_path: path, thumb_path: thumbPath })
      .eq("id", row.id);
    if (updateError) throw updateError;
  }
  return data.length;
}

async function seedChecklist(registrationIds) {
  const { data: assessments, error } = await supabase
    .from("playsafe_assessments")
    .select("id, registration_id, answers:playsafe_assessment_answers(item_code, status)")
    .in("registration_id", registrationIds);
  if (error) throw error;

  let count = 0;
  for (const assessment of assessments) {
    const riskItems = assessment.answers.filter((answer) => answer.status === "risk_found");
    const { data: previous } = await supabase
      .from("playsafe_assessment_photos")
      .delete()
      .eq("assessment_id", assessment.id)
      .select("storage_path, thumb_path");
    if (previous?.length) {
      const paths = previous.flatMap((row) => [row.storage_path, row.thumb_path]).filter(Boolean);
      await supabase.storage.from(CHECKLIST_BUCKET).remove(paths);
    }

    for (const answer of riskItems) {
      for (const [index, fileName] of checklistImagesFor(answer.item_code).entries()) {
        const slot = index + 1;
        const id = randomUUID();
        const { path, thumbPath, bytes } = await uploadWithThumb(
          CHECKLIST_BUCKET,
          `${assessment.registration_id}/${answer.item_code}/${id}`,
          fileName,
        );
        const { error: insertError } = await supabase.from("playsafe_assessment_photos").insert({
          id,
          assessment_id: assessment.id,
          item_code: answer.item_code,
          slot,
          storage_path: path,
          thumb_path: thumbPath,
          bytes,
          mime_type: "image/jpeg",
          status: "attached",
        });
        if (insertError) throw insertError;
        count += 1;
      }
    }
  }
  return count;
}

const registrationIds = await dummyRegistrationIds();
if (registrationIds.length === 0) {
  console.log("더미 시설이 없습니다.");
} else {
  const equipment = await seedEquipment(registrationIds);
  const checklist = await seedChecklist(registrationIds);
  console.log(`기구 사진 ${equipment}장, 위험요소 사진 ${checklist}장을 연결했습니다.`);
}
