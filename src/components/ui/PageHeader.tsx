interface PageHeaderProps {
  title: string;
  subtitle?: string;
  description?: string;
}

export function PageHeader({ title, subtitle, description }: PageHeaderProps) {
  return (
    <section className="pt-32 pb-16 bg-brand-navy text-white">
      <div className="container mx-auto px-4 lg:px-8">
        {subtitle && (
          <p className="text-brand-light/60 text-sm tracking-[0.2em] uppercase mb-3">{subtitle}</p>
        )}
        <h1 className="font-display text-4xl md:text-5xl font-semibold mb-4">{title}</h1>
        {description && (
          <p className="text-white/70 max-w-2xl text-lg">{description}</p>
        )}
      </div>
    </section>
  );
}
