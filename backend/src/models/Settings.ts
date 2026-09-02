import { Schema, model, InferSchemaType } from "mongoose";

const venueSchema = new Schema(
  {
    name: { type: String, default: "" },
    address: { type: String, default: "" },
    mapsUrl: { type: String, default: "" },
    time: { type: String, default: "" },
    lat: { type: Number },
    lng: { type: Number },
  },
  { _id: false }
);

const giftAccountSchema = new Schema(
  {
    label: { type: String, default: "" },
    accountName: { type: String, default: "" },
    accountNumber: { type: String, default: "" },
    bankName: { type: String, default: "" },
  },
  { _id: false }
);

const colorOfDaySchema = new Schema(
  {
    label: { type: String, default: "" },
    hex: { type: String, default: "#4A5D48" },
  },
  { _id: false }
);

const photoshootImageSchema = new Schema(
  {
    url: { type: String, default: "" },
    category: {
      type: String,
      enum: ["proposal", "throwback", "pre-wedding"],
      default: "proposal",
    },
  },
  { _id: false }
);

const programEventSchema = new Schema(
  {
    name: { type: String, default: "" },
    time: { type: String, default: "" },
    note: { type: String, default: "" },
    colors: { type: [colorOfDaySchema], default: [] },
  },
  { _id: false }
);

const OUR_STORY = `Sometimes, the most beautiful love stories begin without either person realizing that they are standing at the beginning of something extraordinary.

Ours began on April 1, 2018, at Casor.

We were two young people who simply happened to cross paths. At the time, there was no way of knowing that this ordinary meeting would become one of the most important moments of our lives. We were strangers then, just two people living our separate lives, unaware that God was quietly writing our names into the same story.

Looking back, we often wonder what would have happened if we had never come to Casor that day. Would we have met somewhere else? Was that our one chance to cross paths? We may never know.

But perhaps that is the beauty of it.

Because somehow, we found each other.

What began as a simple friendship slowly became something deeper. We talked, laughed, shared pieces of our lives, and became each other's closest companion. Somewhere along the way, Flora told Felix he was the kind of man she could see herself ending up with, long before either of us was even dating.

And then, on October 4, 2018, we made it official.

We were young, broke university students with big dreams, little money, and a whole lot of love. We found joy in the simplest things: hanging out, sharing moments, growing together, and, of course, eating ice cream.

That ice cream became one of the sweetest symbols of our beginning.

We went from two strangers licking ice cream on an Easter hangout to becoming best friends, partners, and eventually, the people who could hardly imagine life without each other.

Then life began to test us.

There were seasons of distance. When Felix left for NYSC, we thought the distance might mean the end of our story. For a moment, we believed we had reached the end of what we had started.

But sometimes, the things meant for us have a way of finding their way back.

We realized we had made a mistake.

We came back to each other.

And this time, we knew.

We were meant to be.

As the years passed, our relationship became more than romance. We became teammates. We watched each other grow through school, career, faith, dreams, disappointments, and everything in between.

When Felix returned to FUTA for his Master's degree, we found ourselves growing even deeper together. We spent countless nights at the school hub, sharpening our skills, AI and software engineering becoming part of the story we were building together. We were no longer simply two students in love; we were two people becoming the versions of ourselves we had dreamed about.

Those sleepless nights eventually paid off.

We both stepped into our dream careers, grew professionally and financially, and watched each other evolve from those two broke university students into the people we are today.

But our love was never only about the good days.

We stood beside each other through difficult seasons too, including one of the hardest moments of Felix's life, the passing of his father. And through every season, we continued choosing each other.

We celebrated graduations together. We showed up for each other's milestones. We met each other's families and were welcomed with open arms. We became part of each other's worlds, until the line between your life and my life slowly disappeared.

There was simply our life.

And somewhere along the way, friendship became partnership, partnership became love, and love became home.

After years of growing together, dreaming together, and doing life together, came the question that changed everything.

"Will you do forever with me?"

And the answer was yes.

On December 26, 2025, we said yes to forever.

What began with two strangers crossing paths in 2018 had become a promise to spend the rest of our lives together.

Today, when we look back, we see more than eight years of memories. We see answered prayers. We see two people who grew up together, challenged each other, supported each other, laughed together, cried together, built careers together, and somehow became inseparable along the way.

We see the boy and girl who once met as strangers.

We see the best friends they became.

And now, we see husband and wife.

Perhaps that is our favourite part of the story: we didn't just fall in love. We grew in love.

We grew through university.
We grew through distance.
We grew through uncertainty.
We grew through our careers.
We grew through difficult seasons.
We grew in faith.

And through it all, we kept finding our way back to each other.

So here we are, years after that Easter hangout, no longer two strangers sharing ice cream.

We are two best friends getting ready to spend the rest of our lives together.

And if the first chapter of our story was written when two strangers crossed paths, we cannot wait to see what God has written for all the chapters still to come.

From ice cream to forever.
From strangers to best friends.
From best friends to husband and wife.

This is our love story.

And this time, we're choosing forever.`;

const settingsSchema = new Schema(
  {
    singleton: { type: String, default: "singleton", unique: true },
    partnerOneName: { type: String, default: "Felix" },
    partnerTwoName: { type: String, default: "Flora" },
    weddingDate: { type: Date, default: () => new Date("2026-12-19T07:00:00.000Z") },
    rsvpDeadline: { type: Date },
    heroImageUrl: { type: String, default: "/images/IMG_0041.jpg" },
    ceremony: {
      type: venueSchema,
      default: () => ({
        name: "Vie Garden Hub",
        address: "10/12 Road E, Forthright Estate, Lagos-Ibadan Expressway, behind Punch, Magboro-Akeran, Ogun State",
        mapsUrl:
          "https://www.google.com/maps/dir//Vie+Garden+Hub,+L.G.A,+10%2F12+Road+E+Forthright+Estate,+Lagos+-+Ibadan+Expy,+behind+Punch,+Magboro-Akeran+110115,+Ogun+State/@6.6391049,3.3729144,14z/data=!4m8!4m7!1m0!1m5!1m1!1s0x103b95839199934b:0x1357c0794f58057c!2m2!1d3.4035288!2d6.7028965",
        time: "8:00 AM",
        lat: 6.7028965,
        lng: 3.4035288,
      }),
    },
    reception: {
      type: venueSchema,
      default: () => ({
        name: "Top Crown Hotel and Suites",
        address: "Magboro, Ogun State, Nigeria",
        mapsUrl:
          "https://www.google.com/maps/place/Top+crown+Hotel+and+suites+magboro/@6.6508326,3.3690472,17z",
        time: "11:00 AM",
        lat: 6.6508326,
        lng: 3.3690472,
      }),
    },
    giftNote: {
      type: String,
      default: "Your presence is the greatest gift. If you'd like to bless us further, here's how:",
    },
    giftAccounts: {
      type: [giftAccountSchema],
      default: () => [
        {
          label: "",
          accountName: "Oladipupo Flora Omoshalewa",
          accountNumber: "0211005628",
          bankName: "GTBank",
        },
        {
          label: "",
          accountName: "Felix Akintola",
          accountNumber: "0111345960",
          bankName: "Premium Trust Bank",
        },
      ],
    },
    ourStory: { type: String, default: OUR_STORY },
    ourStoryImageUrl: { type: String, default: "/images/proposal-hero.jpg" },
    ourStoryFromImage: { type: String, default: "/images/throwback_2.jpeg" },
    ourStoryToImage: { type: String, default: "/images/IMG_9924.jpg" },
    ourStoryPdfUrl: { type: String, default: "/pdf/flora-and-felix-love-story.pdf" },
    programOfEvents: {
      type: [programEventSchema],
      default: () => {
        const jewelTones = [
          { label: "Wine", hex: "#722F37" },
          { label: "Burgundy", hex: "#800020" },
          { label: "Purple", hex: "#5D2E5F" },
          { label: "Gold", hex: "#C9A24B" },
        ];
        const pastels = [
          { label: "Blush Pink", hex: "#F5D5D0" },
          { label: "Lavender", hex: "#E3D9F0" },
          { label: "Mint", hex: "#D6EDE0" },
          { label: "Champagne", hex: "#F4E9D8" },
        ];
        return [
          { name: "The Vows", time: "8:00 AM", note: "Strictly by invitation", colors: pastels },
          { name: "Engagement", time: "11:00 AM", note: "Strictly by invitation", colors: jewelTones },
          { name: "Reception", time: "2:00 PM", note: "Strictly by invitation", colors: jewelTones },
        ];
      },
    },
    photoshootImages: {
      type: [photoshootImageSchema],
      default: () => [
        { url: "/images/proposal-hero.jpg", category: "proposal" },
        { url: "/images/IMG_0007.jpg", category: "proposal" },
        { url: "/images/IMG_0041.jpg", category: "proposal" },
        { url: "/images/IMG_0067.jpg", category: "proposal" },
        { url: "/images/IMG_0079.jpg", category: "proposal" },
        { url: "/images/IMG_9889.jpg", category: "proposal" },
        { url: "/images/IMG_9891.jpg", category: "proposal" },
        { url: "/images/IMG_9912.jpg", category: "proposal" },
        { url: "/images/IMG_9924.jpg", category: "proposal" },
        { url: "/images/IMG_9929.jpg", category: "proposal" },
        { url: "/images/IMG_9955.jpg", category: "proposal" },
        { url: "/images/IMG_9990.jpg", category: "proposal" },
        { url: "/images/IMG_9998.jpg", category: "proposal" },
        { url: "/images/throwback_1.jpeg", category: "throwback" },
        { url: "/images/throwback_2.jpeg", category: "throwback" },
        { url: "/images/throwback_3.jpeg", category: "throwback" },
        { url: "/images/throwback_4.jpeg", category: "throwback" },
        { url: "/images/throwback_5.jpeg", category: "throwback" },
        { url: "/images/throwback_6.jpeg", category: "throwback" },
        { url: "/images/throwback_7.jpeg", category: "throwback" },
        { url: "/images/throwback_8.jpeg", category: "throwback" },
        { url: "/images/throwback_9.jpeg", category: "throwback" },
        { url: "/images/throwback_10.jpeg", category: "throwback" },
        { url: "/images/throwback_11.jpeg", category: "throwback" },
        { url: "/images/throwback_12.jpeg", category: "throwback" },
        { url: "/images/throwback_13.jpeg", category: "throwback" },
        { url: "/images/throwback_14.jpeg", category: "throwback" },
        { url: "/images/throwback_15.jpeg", category: "throwback" },
        { url: "/images/throwback_16.jpeg", category: "throwback" },
        { url: "/images/throwback_17.jpeg", category: "throwback" },
      ],
    },
  },
  { timestamps: true }
);

export type Settings = InferSchemaType<typeof settingsSchema>;
export const SettingsModel = model("Settings", settingsSchema);

export async function getOrCreateSettings() {
  let settings = await SettingsModel.findOne({ singleton: "singleton" });
  if (!settings) {
    settings = await SettingsModel.create({ singleton: "singleton" });
  }
  return settings;
}
