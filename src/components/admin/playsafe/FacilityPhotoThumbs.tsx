import { AttachmentPreview } from "@/components/admin/AttachmentPreview";
import type { FacilityPhotoDto } from "@/lib/playsafe-workflow/types";

export function FacilityPhotoThumbs({ photos }: { photos: FacilityPhotoDto[] }) {
  return (
    <div className="mt-4 flex gap-3 border-t border-white/10 pt-3">
      <span className="w-28 shrink-0 text-white/50">시설 전경사진</span>
      {photos.length === 0 ? (
        <span className="text-white/85">-</span>
      ) : (
        <div className="flex flex-wrap gap-3">
          {photos.map((photo) =>
            photo.url ? (
              <AttachmentPreview
                key={photo.id}
                name={`facility-${photo.slot}.jpg`}
                url={photo.url}
                thumbUrl={photo.thumbUrl}
              />
            ) : null,
          )}
        </div>
      )}
    </div>
  );
}
