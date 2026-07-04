export type Bilingual = { en: string; tr: string };

export type ContentBlock =
  | { type: "heading"; text: string }
  | { type: "text"; text: string }
  | { type: "image"; src: string; caption: string }
  | { type: "video"; src: string; caption?: string }
  | { type: "iframe"; src: string; caption?: string; height?: string };

export type Project = {
  id: string;
  tag: Bilingual;
  year: string;
  title: string;
  desc: Bilingual;
  tech: string[];
  blocks: ContentBlock[];
};

export type NoteKind = "NOTE" | "ROUTE";

export type FieldNote = {
  id: string;
  kind: NoteKind;
  title: Bilingual;
  desc: Bilingual;
  tags: Bilingual[];
  blocks: ContentBlock[];
};

export type TripPhoto = { src: string; caption: string; wide?: boolean };

export type Trip = {
  id: string;
  name: string;
  coords: string;
  meta: Bilingual;
  img: string;
  photos: TripPhoto[];
};
