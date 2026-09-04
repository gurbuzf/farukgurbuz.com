import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Faruk Gürbüz — Water Resources Engineer & Geospatial Data Scientist",
    short_name: "Faruk Gürbüz",
    description:
      "Interactive hydrology simulations, GIS tools, watershed delineation, dam flood routing, and peer-reviewed publications by Faruk Gürbüz.",
    start_url: "/",
    display: "standalone",
    background_color: "#f6f3ec",
    theme_color: "#16223a",
    icons: [
      {
        src: "/icon.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
