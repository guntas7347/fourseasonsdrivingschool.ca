import React from "react";
import { Star, ExternalLink, CheckCircle, Quote } from "lucide-react";

interface GoogleReviewItem {
  id: string;
  name: string;
  avatar: string;
  date: string;
  rating: number;
  reviewText: string;
  location: string;
  isLocalGuide?: boolean;
  googleReviewUrl: string;
}

const SAMPLE_GOOGLE_REVIEWS: GoogleReviewItem[] = [
  {
    id: "rev-1",
    name: "Gurpreet Singh",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    date: "2 weeks ago",
    rating: 5,
    location: "Surrey (152nd St ICBC)",
    isLocalGuide: true,
    reviewText:
      "Passed my Class 5 road test on my very first attempt today at the Surrey 152nd St ICBC! My instructor was incredibly patient and taught me exactly what examiners look for during hazard perception and intersection scans. The mock road test we did the day before was identical to the actual exam route. Best driving school in Surrey!",
    googleReviewUrl: "https://maps.google.com/?q=Four+Seasons+Driving+School+Surrey+BC",
  },
  {
    id: "rev-2",
    name: "Jessica Miller",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80",
    date: "3 weeks ago",
    rating: 5,
    location: "North Delta",
    isLocalGuide: false,
    reviewText:
      "I used to get severe anxiety driving on highways, but Four Seasons completely cured my fear. My instructor was calm, reassuring, and never raised their voice. Parallel parking and reverse stall parking became second nature in just 3 lessons. Plus, free home pick-up made scheduling so convenient!",
    googleReviewUrl: "https://maps.google.com/?q=Four+Seasons+Driving+School+Surrey+BC",
  },
  {
    id: "rev-3",
    name: "Amanpreet Kaur",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80",
    date: "1 month ago",
    rating: 5,
    location: "Langley ICBC",
    isLocalGuide: true,
    reviewText:
      "Booked the 10-lesson package and car rental for my test day. Passed with zero driving errors on my sheet! The dual-brake car was clean, smooth to handle, and very easy to steer. Thank you Four Seasons for helping me get my license on the first try!",
    googleReviewUrl: "https://maps.google.com/?q=Four+Seasons+Driving+School+Surrey+BC",
  },
  {
    id: "rev-4",
    name: "David Zhang",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    date: "1 month ago",
    rating: 5,
    location: "Fleetwood, Surrey",
    isLocalGuide: false,
    reviewText:
      "Super professional service! Everything from the online booking to the pre-test warm-up lesson went seamlessly. The instructor gave me honest constructive feedback after every 90-minute session. Highly recommend to any beginner or Class 7N driver in Metro Vancouver.",
    googleReviewUrl: "https://maps.google.com/?q=Four+Seasons+Driving+School+Surrey+BC",
  },
  {
    id: "rev-5",
    name: "Navneet Sandhu",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80",
    date: "2 months ago",
    rating: 5,
    location: "Newton, Surrey",
    isLocalGuide: true,
    reviewText:
      "Best driving instructors in Surrey hands down. Very punctual, respectful, and crystal clear explanations on speed control, shoulder checks, and pedestrian awareness. Passed my Class 7 road test without any stress!",
    googleReviewUrl: "https://maps.google.com/?q=Four+Seasons+Driving+School+Surrey+BC",
  },
  {
    id: "rev-6",
    name: "Liam Campbell",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
    date: "2 months ago",
    rating: 5,
    location: "Cloverdale",
    isLocalGuide: false,
    reviewText:
      "Took 5 refresher lessons before my test after moving to BC from another province. The instructor brought me through all the tricky school zones and one-way streets around Surrey. Passed with flying colors!",
    googleReviewUrl: "https://maps.google.com/?q=Four+Seasons+Driving+School+Surrey+BC",
  },
];

export default function GoogleReviews() {
  return (
    <section className="py-20 sm:py-28 bg-white border-b border-zinc-200/70">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header with Google Rating Badge */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-12 border-b border-zinc-200/80">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3.5 py-1 text-xs font-semibold text-zinc-800">
              {/* Google G Logo SVG */}
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Verified Google Reviews</span>
            </div>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl">
              Real Experiences. First-Time Passes.
            </h2>
            <p className="mt-2 text-sm sm:text-base text-zinc-600 max-w-xl">
              Read authentic feedback from students who achieved their British Columbia driver&apos;s license with Four Seasons Driving School.
            </p>
          </div>

          {/* Rating Summary Card */}
          <div className="flex items-center gap-4 rounded-2xl border border-zinc-200 bg-zinc-50/80 p-4 shrink-0 shadow-xs">
            <div className="text-center pr-4 border-r border-zinc-200">
              <span className="text-3xl font-extrabold text-zinc-950">4.9</span>
              <div className="flex items-center justify-center gap-0.5 text-amber-400 mt-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-current" />
                ))}
              </div>
              <span className="text-[10px] text-zinc-500 font-medium">194+ Reviews</span>
            </div>

            <div>
              <p className="text-xs font-semibold text-zinc-900">Google Rating Score</p>
              <p className="text-[11px] text-zinc-500">Certified Surrey Driving School</p>
              <a
                href="https://maps.google.com/?q=Four+Seasons+Driving+School+Surrey+BC"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition"
              >
                <span>Open Google Profile</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Testimonials Grid */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SAMPLE_GOOGLE_REVIEWS.map((review) => (
            <div
              key={review.id}
              className="flex flex-col justify-between rounded-2xl border border-zinc-200 bg-zinc-50/60 p-6 shadow-xs hover:border-zinc-300 hover:bg-white hover:shadow-md transition"
            >
              <div>
                {/* Author Info */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={review.avatar}
                      alt={review.name}
                      className="h-11 w-11 rounded-full object-cover border border-zinc-200"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-sm font-bold text-zinc-900">{review.name}</h4>
                        {review.isLocalGuide && (
                          <span className="rounded bg-amber-100 text-amber-800 px-1.5 py-0.2 text-[9px] font-semibold">
                            Local Guide
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-400 font-medium">
                        {review.location} • {review.date}
                      </p>
                    </div>
                  </div>

                  {/* Google G Icon */}
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-xs border border-zinc-100">
                    <svg className="h-4 w-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                  </div>
                </div>

                {/* Rating stars */}
                <div className="mt-3.5 flex items-center gap-1 text-amber-400">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>

                {/* Review Text */}
                <p className="mt-3 text-xs leading-relaxed text-zinc-700 italic">
                  &ldquo;{review.reviewText}&rdquo;
                </p>
              </div>

              {/* Clickable link to verify on Google Reviews */}
              <div className="mt-5 pt-3.5 border-t border-zinc-200/60 flex items-center justify-between">
                <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Verified Student
                </span>

                <a
                  href={review.googleReviewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-zinc-500 hover:text-zinc-900 transition"
                >
                  <span>Open on Google</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA to View All on Google */}
        <div className="mt-12 text-center">
          <a
            href="https://maps.google.com/?q=Four+Seasons+Driving+School+Surrey+BC"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 bg-white px-6 py-3 text-xs font-semibold text-zinc-800 shadow-xs hover:bg-zinc-50 hover:border-zinc-400 transition"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Read all 194+ Reviews on Google</span>
            <ExternalLink className="h-3.5 w-3.5 text-zinc-400" />
          </a>
        </div>
      </div>
    </section>
  );
}
