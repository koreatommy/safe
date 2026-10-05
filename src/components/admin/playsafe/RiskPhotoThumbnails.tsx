import { ImageOff } from "lucide-react";
import { AttachmentPreview } from "@/components/admin/AttachmentPreview";
import type { AssessmentPhotoDto } from "@/lib/playsafe-workflow/types";

type RiskPhotoThumbnailsProps = {
  itemCode: string;
  photos: AssessmentPhotoDto[];
};

export function RiskPhotoThumbnails({ itemCode, photos }: RiskPhotoThumbnailsProps) {
  const visible = photos.filter((photo) => photo.url).sort((a, b) => a.slot - b.slot);

  if (visible.length === 0) {
    return (
      <p className="flex items-center gap-1.5 text-white/40 text-xs">
        <ImageOff className="w-3.5 h-3.5" />
        첨부된 사진이 없습니다.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-3">
      {visible.map((photo) => (
        <AttachmentPreview
          key={photo.id}
          name={`${itemCode}-${photo.slot}.jpg`}
          url={photo.url!}
          thumbUrl={photo.thumbUrl}
        />
      ))}
    </div>
  );
}
