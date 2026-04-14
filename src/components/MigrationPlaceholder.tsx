import Link from "next/link";

export function MigrationPlaceholder({
  title,
  description,
  routePath,
}: {
  title: string;
  description: string;
  routePath: string;
}) {
  return (
    <main className="min-h-screen bg-background">
      <div className="container py-12">
        <div className="mx-auto max-w-3xl rounded-[2rem] border border-border bg-card p-8 shadow-card-brand">
          <div className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
            Next.js Phase One
          </div>
          <h1 className="mt-4 text-3xl font-extrabold text-foreground">{title}</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">{description}</p>

          <div className="mt-6 rounded-2xl bg-secondary/60 p-4">
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Route Shell</div>
            <code className="mt-2 block overflow-x-auto text-sm font-semibold text-foreground">{routePath}</code>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/"
              className="inline-flex rounded-2xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground"
            >
              Home Shell
            </Link>
            <Link
              href="/brands"
              className="inline-flex rounded-2xl border border-border bg-background px-5 py-3 text-sm font-bold text-foreground"
            >
              Public Routes
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
