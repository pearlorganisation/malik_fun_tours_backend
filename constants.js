export const DB_NAME = "fun_tours";

export const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "None", // allow OAuth redirect
  secure: process.env.NODE_ENV === "production",
};


export const USER_ROLES_ENUM = {
  USER: "USER",
  ADMIN: "ADMIN",
};
 