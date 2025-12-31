export const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "") || "uncategorized";

export const truncate = (value: string, maxLength = 4000) => {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength)}...`;
};

