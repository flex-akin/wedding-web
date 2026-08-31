interface PdfEmbedProps {
  src: string;
  title?: string;
}

export function PdfEmbed({ src, title = "Our Love Story" }: PdfEmbedProps) {
  return (
    <div className="mx-auto max-w-2xl overflow-hidden rounded-2xl border border-sage/15 bg-white/60">
      <div className="flex items-center justify-between border-b border-sage/10 px-5 py-3">
        <span className="font-mono text-xs text-terracotta">📄 {title}</span>
        <a
          href={src}
          target="_blank"
          rel="noreferrer"
          className="font-mono text-xs text-sage underline underline-offset-2 hover:text-terracotta"
        >
          Open / Download
        </a>
      </div>
      <iframe src={src} title={title} className="h-[70vh] w-full" loading="lazy" />
    </div>
  );
}
