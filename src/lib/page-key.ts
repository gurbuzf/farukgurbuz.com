export type PageKey = "home" | "lab" | "cv" | "pubs";

export type NavKey = "home" | "lab" | "cv" | "pubs";

export function getPageKey(pathname: string): PageKey {
  if (pathname === "/") return "home";
  if (pathname === "/lab" || pathname.startsWith("/lab/")) return "lab";
  if (pathname === "/cv" || pathname.startsWith("/cv/")) return "cv";
  if (pathname === "/publications" || pathname.startsWith("/publications/")) return "pubs";
  return "home";
}

export function getNavKey(page: PageKey): NavKey {
  return page;
}
