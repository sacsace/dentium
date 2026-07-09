export type BannerMediaType = "image" | "video";

export type BannerFormState = {
  mediaType: BannerMediaType;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  videoUrl: string;
  ctaText: string;
  ctaLink: string;
  isActive: boolean;
  sortOrder: number;
};

export const EMPTY_BANNER_FORM: BannerFormState = {
  mediaType: "image",
  title: "",
  subtitle: "",
  description: "",
  image: "",
  videoUrl: "",
  ctaText: "",
  ctaLink: "",
  isActive: true,
  sortOrder: 0,
};

type BannerRecord = {
  title: string;
  subtitle: string | null;
  description: string | null;
  image: string;
  videoUrl: string | null;
  ctaText: string | null;
  ctaLink: string | null;
  isActive: boolean;
  sortOrder: number;
};

export function bannerToForm(banner: BannerRecord): BannerFormState {
  const isVideo = Boolean(banner.videoUrl?.trim());
  return {
    mediaType: isVideo ? "video" : "image",
    title: banner.title ?? "",
    subtitle: banner.subtitle ?? "",
    description: banner.description ?? "",
    image: banner.image ?? "",
    videoUrl: banner.videoUrl ?? "",
    ctaText: banner.ctaText ?? "",
    ctaLink: banner.ctaLink ?? "",
    isActive: banner.isActive ?? true,
    sortOrder: banner.sortOrder ?? 0,
  };
}

export function normalizeBannerPayload(form: BannerFormState) {
  const mediaType = form.mediaType;
  const image = form.image.trim();
  const videoUrl = mediaType === "video" ? form.videoUrl.trim() : "";

  if (!image) {
    return { error: mediaType === "video" ? "Poster image is required for video slides" : "Banner image is required" };
  }
  if (mediaType === "video" && !videoUrl) {
    return { error: "Video URL is required for video slides" };
  }
  if (mediaType === "image" && !form.title.trim()) {
    return { error: "Title is required for image slides" };
  }

  return {
    data: {
      title: form.title.trim() || "Hero Video",
      subtitle: form.subtitle.trim() || null,
      description: form.description.trim() || null,
      image,
      videoUrl: mediaType === "video" ? videoUrl : null,
      ctaText: mediaType === "image" ? form.ctaText.trim() || null : null,
      ctaLink: mediaType === "image" ? form.ctaLink.trim() || null : null,
      isActive: form.isActive,
      sortOrder: form.sortOrder,
    },
  };
}
