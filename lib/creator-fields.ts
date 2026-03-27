// Field definitions that match the live creator profile exactly
export const CREATOR_FIELDS = {
  basic: [
    { key: "display_name", label: "Name", type: "text", required: true },
    { key: "tagline", label: "Tagline (e.g., 'UGC Creator')", type: "text", required: true },
    { key: "bio", label: "Bio", type: "textarea", required: true },
  ],
  contact: [
    { key: "instagram", label: "Instagram handle (@username)", type: "text" },
    { key: "tiktok", label: "TikTok handle (@username)", type: "text" },
  ],
  location: [
    { key: "location", label: "Location (City, Country)", type: "text" },
  ],
  social: [
    { key: "followers", label: "Instagram followers", type: "number" },
    { key: "engagement_rate", label: "Engagement rate (%)", type: "number" },
    { key: "response_time", label: "Response time (e.g., 'Same day')", type: "text" },
  ],
  professional: [
    { key: "rates", label: "Rate card (e.g., '€150-300/video')", type: "text" },
    { key: "languages", label: "Languages (comma-separated)", type: "text" },
    { key: "content_types", label: "Content types (comma-separated, e.g., 'UGC, Reels')", type: "text" },
  ],
  portfolio: [
    { key: "portfolio_images", label: "Portfolio images", type: "file", accept: "image/*" },
    { key: "video_url", label: "Featured video URL", type: "text" },
  ],
  admin: [
    { key: "internal_notes", label: "Internal notes", type: "textarea" },
    { key: "featured_creator", label: "Featured creator", type: "checkbox" },
    { key: "is_verified", label: "Verified", type: "checkbox" },
    { key: "is_trending", label: "Trending", type: "checkbox" },
  ],
};
