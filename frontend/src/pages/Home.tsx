import { Link } from "react-router-dom";
import { SiteTag } from "../components/SiteTag";
import { FloralPattern } from "../components/FloralPattern";
import { HashtagMarquee } from "../components/HashtagMarquee";
import { Countdown } from "../components/Countdown";
import { GiftsPanel } from "../components/GiftsPanel";
import { OurStoryPanel } from "../components/OurStoryPanel";
import { OrderOfDayPanel } from "../components/OrderOfDayPanel";
import { PhotoshootGallery } from "../components/PhotoshootGallery";
import { WishesPanel } from "../components/WishesPanel";
import { useSettings } from "../lib/useSettings";

function formatDate(iso?: string) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function Home() {
  const { settings, loading } = useSettings();

  return (
    <div>
      <section className="relative overflow-hidden px-4 py-20 sm:py-28">
        <FloralPattern />
        <div className="relative mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
          <SiteTag size="lg" />

          {settings?.heroImageUrl && (
            <img
              src={settings.heroImageUrl}
              alt={`${settings.partnerOneName} and ${settings.partnerTwoName}`}
              className="w-full max-w-sm rounded-3xl border-4 border-ivory object-cover shadow-xl sm:max-w-md"
            />
          )}

          <p className="font-mono text-sm text-terracotta">are getting married</p>

          {!loading && settings?.weddingDate && (
            <>
              <p className="text-balance font-display text-xl text-ink/80 sm:text-2xl">
                {formatDate(settings.weddingDate)}
              </p>
              <Countdown targetDate={settings.weddingDate} />
              <p className="font-mono text-xs tracking-wide text-sage/70 sm:text-sm">
                UNTIL BOTH HEARTS SAY YES
              </p>
            </>
          )}

          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <Link
              to="/directions"
              className="rounded-full bg-sage px-6 py-3 font-mono text-sm text-ivory shadow-sm transition-transform hover:scale-[1.03]"
            >
              Directions
            </Link>
            <Link
              to="/hotel"
              className="rounded-full border border-terracotta px-6 py-3 font-mono text-sm text-terracotta transition-transform hover:scale-[1.03]"
            >
              Hotel Reservation
            </Link>
            <Link
              to="/photos"
              className="rounded-full border border-sage/40 px-6 py-3 font-mono text-sm text-sage transition-transform hover:scale-[1.03]"
            >
              Photo Wall
            </Link>
          </div>

          <p className="mt-6 max-w-md text-sm text-ink/60">
            Have a personal invite link? Use it to RSVP — check your invitation or the message we sent you for your
            unique link.
          </p>
        </div>
      </section>

      <HashtagMarquee />

      {settings && (
        <section className="px-4 py-16">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl sm:text-3xl">Our Story</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-ink/60">From strangers to forever.</p>
            <div className="mt-8 text-left">
              <OurStoryPanel
                story={settings.ourStory}
                imageUrl={settings.ourStoryImageUrl}
                fromImage={settings.ourStoryFromImage}
                toImage={settings.ourStoryToImage}
                truncateWords={110}
              />
            </div>
          </div>
        </section>
      )}

      {settings && (
        <section className="bg-gold/8 px-4 py-16">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl sm:text-3xl">Gifts</h2>
            <div className="mt-4">
              <GiftsPanel giftNote={settings.giftNote} giftAccounts={settings.giftAccounts} cardClassName="bg-ivory" />
            </div>
          </div>
        </section>
      )}

      {settings && (
        <section className="border-y border-sage/10 bg-white/40 px-4 py-16">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl sm:text-3xl">Order of the Day</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-ink/60">One day, three moments.</p>
            <div className="mt-8 text-left">
              <OrderOfDayPanel events={settings.programOfEvents} />
            </div>
          </div>
        </section>
      )}

      {settings && (
        <section className="px-4 py-16">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-2xl sm:text-3xl">Photos</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-ink/60">A preview of the day, before the day.</p>
            <div className="mt-8 text-left">
              <PhotoshootGallery images={settings.photoshootImages} />
            </div>
          </div>
        </section>
      )}

      {settings && (
        <section className="border-y border-sage/10 bg-white/40 px-4 py-16">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl sm:text-3xl">Wishes</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-ink/60">
              Leave the couple a note for the journey ahead.
            </p>
            <div className="mt-8">
              <WishesPanel />
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
