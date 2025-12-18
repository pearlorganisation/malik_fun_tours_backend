// utils/parseJson.js
export const parseJSON = (value, fallback) => {
  try {
    return typeof value === "string" ? JSON.parse(value) : value;
  } catch {
    return fallback;
  }
};
