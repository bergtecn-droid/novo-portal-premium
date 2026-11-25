export type Editoria = string;

export type MediaKind = "image" | "video";

export interface MediaItem {
  src?: string;
  captionTop?: string;
  captionBottom?: string;
  youtubeId?: string;
}

export type Align = "left" | "center" | "right";

export type Block =
  | { type: "heading"; content: string; level?: 2 | 3; align?: Align }
  | { type: "text"; content: string; align?: Align }
  | { type: "quote"; content: string; author?: string; align?: Align }
  | { type: "image"; media: MediaItem; size?: "grande" | "medio" }
  | { type: "video"; media: MediaItem }
  | { type: "gallery"; items: MediaItem[] };

export type Status = "rascunho" | "revisao" | "publicado";

export interface Article {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  editoria: Editoria;
  tags: string[];
  author: string;
  cover: string;
  coverCaption?: string;
  blocks: Block[];
  publishedAt: string;
  status: Status;
  views: number;
  featured?: boolean;
}
