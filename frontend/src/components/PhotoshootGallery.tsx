export function PhotoshootGallery({ images }: { images: string[] }) {
  return (
    <>
      <div className="columns-1 gap-4 sm:columns-2">
        {images.map((url, i) => (
          <div key={i} className="mb-4 overflow-hidden rounded-2xl border border-sage/15 bg-white/60 break-inside-avoid">
            <img src={url} alt="Photoshoot" className="w-full object-cover" loading="lazy" />
          </div>
        ))}
      </div>

      {images.length <= 1 && <p className="mt-8 text-center text-sm text-ink/40">More photos coming soon.</p>}
    </>
  );
}
