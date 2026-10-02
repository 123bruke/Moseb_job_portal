// Which face of the app this dev server shows.
//   user  -> public + candidate + company pages (default, VITE_APP_VIEW unset)
//   admin -> the /admin section only (VITE_APP_VIEW=admin, i.e. `vite --mode admin`)
export type View = "user" | "admin";

export const VIEW: View = import.meta.env.VITE_APP_VIEW === "admin" ? "admin" : "user";
export const IS_ADMIN_VIEW = VIEW === "admin";
export const START_PATH = IS_ADMIN_VIEW ? "/admin/users" : "/";
export const APP_TITLE = IS_ADMIN_VIEW ? "Smart Resume - Admin" : "Smart Resume Checker";