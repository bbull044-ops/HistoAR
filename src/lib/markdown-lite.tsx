// Port dari renderMarkdownLite() di assets/js/chatbot.js.
// Alih-alih membangun innerHTML string, versi ini mengembalikan React node
// supaya tidak perlu dangerouslySetInnerHTML.

import type { ReactNode } from "react";

type Token =
  | { type: "text"; value: string }
  | { type: "bold"; value: string }
  | { type: "italic"; value: string }
  | { type: "br" };

function tokenize(raw: string): Token[] {
  // Pengaman lapis 2: server sudah strip * via bersihkanFormat, tapi kalau
  // model masih lolos keluarkan markdown / bullet, jangan biarkan simbol
  // mentah bocor ke UI. Tangani * dan _ tak berpasangan sebagai teks polos.
  const sanitized = raw
    .replace(/^\s*[-•*]\s+/gm, "")
    .replace(/(\*\*|__)/g, "")
    .replace(/[*_]/g, "");
  const tokens: Token[] = [];
  // Setelah sanitasi, yang tersisa hanya newline sebagai struktur.
  const pattern = /(\n)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(sanitized)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({
        type: "text",
        value: sanitized.slice(lastIndex, match.index),
      });
    }
    tokens.push({ type: "br" });
    lastIndex = pattern.lastIndex;
  }
  if (lastIndex < sanitized.length) {
    tokens.push({ type: "text", value: sanitized.slice(lastIndex) });
  }
  return tokens;
}

export function renderMarkdownLite(text: string): ReactNode[] {
  return tokenize(text).map((t, i) => {
    switch (t.type) {
      case "bold":
        return <strong key={i}>{t.value}</strong>;
      case "italic":
        return <em key={i}>{t.value}</em>;
      case "br":
        return <br key={i} />;
      default:
        return <span key={i}>{t.value}</span>;
    }
  });
}
