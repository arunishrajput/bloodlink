import { Fragment, type ReactNode } from "react";

/** Inline **bold** only. Renders React nodes, never raw HTML. */
function inline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? <strong key={i}>{part.slice(2, -2)}</strong> : <Fragment key={i}>{part}</Fragment>,
  );
}

/** Minimal markdown: "## " headings, "- " bullet lists, blank-line separated paragraphs. */
export function Markdown({ source }: { source: string }) {
  const blocks = source.trim().split(/\n{2,}/);
  return (
    <div className="prose-bl">
      {blocks.map((block, i) => {
        if (block.startsWith("## ")) return <h2 key={i}>{inline(block.slice(3))}</h2>;
        const lines = block.split("\n");
        if (lines.every((l) => l.startsWith("- "))) return <ul key={i}>{lines.map((l, j) => <li key={j}>{inline(l.slice(2))}</li>)}</ul>;
        if (lines[0].startsWith("## "))
          return (
            <Fragment key={i}>
              <h2>{inline(lines[0].slice(3))}</h2>
              <p>{inline(lines.slice(1).join(" "))}</p>
            </Fragment>
          );
        return <p key={i}>{inline(block.replace(/\n/g, " "))}</p>;
      })}
    </div>
  );
}
