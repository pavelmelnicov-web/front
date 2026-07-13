"use client";

import Image from "next/image";

export type TestimonialItem = {
  id: string;
  name: string;
  role: string;
  headline: string;
  body: string;
  avatarSrc: string;
  workbookTone: "men" | "women";
};

type TestimonialsSectionProps = {
  items: TestimonialItem[];
};

export function TestimonialsSection({ items }: TestimonialsSectionProps) {
  console.log("[testimonials-section] Rendering testimonials band", {
    count: items.length,
    ids: items.map((item) => item.id),
  });

  return (
    <section className="testimonialsBand" id="testimonials">
      <div className="testimonialsIntro">
        <div className="testimonialsIntroCopy">
          <h2>
            What people <em>reshape</em> with Space, Self?
          </h2>
        </div>
        <div className="testimonialsIntroAside">
          <p>
            Real stories from people who used the workbook to clarify what their space
            should activate—and made the first changes without waiting for a full
            renovation.
          </p>
        </div>
      </div>

      <div className="testimonialsRail" role="list">
        {items.map((item) => {
          const cardClassName = [
            "testimonialCard",
            item.workbookTone === "men"
              ? "testimonialCard--men"
              : "testimonialCard--women",
          ].join(" ");

          console.log("[testimonials-section] Rendering testimonial card", {
            id: item.id,
            workbookTone: item.workbookTone,
            avatarSrc: item.avatarSrc,
          });

          return (
            <article className={cardClassName} key={item.id} role="listitem">
              <div aria-hidden="true" className="testimonialCardGlow" />
              <div className="testimonialCardInner">
                <blockquote className="testimonialCardHeadline">{item.headline}</blockquote>
                <p className="testimonialCardBody">{item.body}</p>
                <footer className="testimonialCardAuthor">
                  <Image
                    alt={`${item.name} portrait`}
                    className="testimonialCardAvatar"
                    height={44}
                    src={item.avatarSrc}
                    unoptimized
                    width={44}
                  />
                  <div>
                    <strong>{item.name}</strong>
                    <small>{item.role}</small>
                  </div>
                </footer>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
