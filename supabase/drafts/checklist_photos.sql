-- DRAFT (not applied): storage design for safety-assessment checklist photos.
-- Move into supabase/migrations once assessments are persisted server-side.
--
-- Capacity rules
--   * Image bytes never go into Postgres. Rows only hold the Storage object path + metadata (~200 bytes).
--   * The client compresses to WebP/JPEG, long edge ≤ 1280px, ≤ 300KB (see src/data/playsafe/checklist-photos.ts).
--     The bucket enforces the same ceiling so oversized uploads are rejected server-side.
--   * Max 3 photos × 18 items ⇒ worst case ≈ 16MB per assessment; typical ≈ 2–4MB.
--   * Deleting a row must also delete its Storage object (handled in the API route, not a trigger,
--     because storage.objects deletes via SQL leave orphaned files in S3).
--
-- Object path convention: {assessment_id}/{item_no}/{photo_id}.{webp|jpg}
--   photo_id is the same UUID the browser already uses as its IndexedDB key, so local drafts can be
--   uploaded without renaming.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'checklist-photos',
  'checklist-photos',
  false,
  307200, -- 300KB
  ARRAY['image/webp', 'image/jpeg']
)
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.checklist_photos (
  id            uuid PRIMARY KEY,
  assessment_id uuid NOT NULL,
  item_no       smallint NOT NULL CHECK (item_no BETWEEN 1 AND 18),
  storage_path  text NOT NULL UNIQUE,
  bytes         integer NOT NULL CHECK (bytes > 0 AND bytes <= 307200),
  mime_type     text NOT NULL CHECK (mime_type IN ('image/webp', 'image/jpeg')),
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS checklist_photos_assessment_item_idx
  ON public.checklist_photos (assessment_id, item_no);

-- Enforce the 3-photos-per-item limit at the database level.
CREATE OR REPLACE FUNCTION public.enforce_checklist_photo_limit()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  IF (
    SELECT count(*) FROM public.checklist_photos
    WHERE assessment_id = NEW.assessment_id AND item_no = NEW.item_no
  ) >= 3 THEN
    RAISE EXCEPTION 'checklist item % already has 3 photos', NEW.item_no;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS checklist_photos_limit ON public.checklist_photos;
CREATE TRIGGER checklist_photos_limit
  BEFORE INSERT ON public.checklist_photos
  FOR EACH ROW EXECUTE FUNCTION public.enforce_checklist_photo_limit();

ALTER TABLE public.checklist_photos ENABLE ROW LEVEL SECURITY;
-- Policies depend on how assessments are owned (facility manager auth vs. admin only);
-- add them together with the assessments table. With RLS on and no policies, only the
-- service role can read/write, which is the safe default for this draft.
