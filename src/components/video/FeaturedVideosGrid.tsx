type FeaturedVideoProps = {
  title: string;
  src: string;
  poster?: string;
};

export function FeaturedVideoCard({ title, src, poster }: FeaturedVideoProps) {
  return (
    <article className="bg-white rounded-sm shadow-sm overflow-hidden border border-brand-gray">
      <div className="relative aspect-video bg-brand-navy">
        <video controls playsInline preload="metadata" poster={poster} className="absolute inset-0 w-full h-full object-cover">
          <source src={src} type="video/mp4" />
        </video>
      </div>
      <div className="p-5">
        <h3 className="font-display text-lg font-semibold text-brand-navy">{title}</h3>
      </div>
    </article>
  );
}

export function FeaturedVideosGrid({ videos }: { videos: readonly FeaturedVideoProps[] }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-16">
      {videos.map((video) => (
        <FeaturedVideoCard key={video.src} {...video} />
      ))}
    </div>
  );
}
