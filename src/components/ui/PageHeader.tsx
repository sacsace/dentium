interface PageHeaderProps {
  title: string;
  subtitle?: string;
  description?: string;
}

export function PageHeader({ title, subtitle, description }: PageHeaderProps) {
  return (
    <section className="relative pt-28 pb-14 md:pt-32 md:pb-16 bg-navy-wash text-white overflow-hidden">
      <div
        className="absolute inset-0 bg-surface-grid bg-grid-sm opacity-40"
        aria-hidden
      />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-brand-accent/70 to-transparent" />
      <div className="container relative mx-auto px-4 lg:px-8">
        {subtitle && <p className="section-eyebrow !text-brand-accent/90 mb-4">{subtitle}</p>}
        <h1 className="font-display text-4xl md:text-5xl font-semibold tracking-tight max-w-3xl text-balance">
          {title}
        </h1>
        {description && (
          <p className="mt-4 text-white/70 max-w-2xl text-base md:text-lg leading-relaxed">
            {description}
          </p>
        )}
      </div>
    </section>
  );
}
