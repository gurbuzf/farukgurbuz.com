export type PageKey = "home" | "work" | "project" | "cv" | "notes" | "note" | "travels" | "trip" | "pubs";

export type NavKey = "home" | "notes" | "work" | "cv" | "travels" | "pubs";

export function getPageKey(pathname: string): PageKey {
  if (pathname === "/") return "home";
  if (pathname.startsWith("/work/")) return "project";
  if (pathname === "/work") return "work";
  if (pathname === "/cv") return "cv";
  if (pathname.startsWith("/notes/")) return "note";
  if (pathname === "/notes") return "notes";
  if (pathname.startsWith("/travels/")) return "trip";
  if (pathname === "/travels") return "travels";
  if (pathname === "/publications") return "pubs";
  return "home";
}

export function getNavKey(page: PageKey): NavKey {
  if (page === "project") return "work";
  if (page === "note") return "notes";
  if (page === "trip") return "travels";
  return page as NavKey;
}
