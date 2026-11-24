import { PageHeader } from "./PageHeader";

export function LegalPage({ title, updated, sections }: { title: string; updated: string; sections: [string, string[]][] }) {
  return (
    <>
      <PageHeader title={title} sub={`Last updated ${updated}`} />
      <div className="container-page max-w-3xl py-12">
        <div className="prose-bl">
          {sections.map(([h, ps]) => (
            <section key={h}>
              <h2>{h}</h2>
              {ps.map((p, i) => <p key={i}>{p}</p>)}
            </section>
          ))}
        </div>
      </div>
    </>
  );
}
