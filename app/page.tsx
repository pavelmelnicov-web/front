"use client";

import { ArrowRight, Check, MessageSquare, Plus, Send, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { HeroFloatCards } from "../components/landing/HeroFloatCards";
import { IntroStackSection } from "../components/landing/IntroStackSection";
import { SituationsSection } from "../components/landing/SituationsSection";
import { VariantSearchCycler } from "../components/landing/VariantSearchCycler";
import { api, ChatMessage, CommunityPost, SessionPayload, Workbook } from "../lib/api";
import { fallbackChat, fallbackPosts, fallbackWorkbook } from "../lib/fallback";

type Answers = Record<string, string>;

export default function Home() {
  const [workbook, setWorkbook] = useState<Workbook>(fallbackWorkbook);
  const [posts, setPosts] = useState<CommunityPost[]>(fallbackPosts);
  const [chat, setChat] = useState<ChatMessage[]>(fallbackChat);
  const [version, setVersion] = useState<"system" | "atmosphere">("system");
  const [situations, setSituations] = useState<string[]>(["new-stage"]);
  const [answers, setAnswers] = useState<Answers>({});
  const [name, setName] = useState("Guest");
  const [summary, setSummary] = useState<Record<string, string | string[]> | null>(null);
  const [chatMessage, setChatMessage] = useState("");
  const [openFaqId, setOpenFaqId] = useState(faqItems[0].id);
  const [isSaving, setIsSaving] = useState(false);
  const variantViewportRef = useRef<HTMLDivElement>(null);
  const [variantSlideWidth, setVariantSlideWidth] = useState(0);

  useEffect(() => {
    console.log("[home] Loading landing page data");

    api
      .getWorkbook()
      .then((data) => {
        console.log("[home] Workbook loaded", { headline: data.headline });
        setWorkbook(data);
      })
      .catch((error) => {
        console.error("[home] Workbook load failed, using fallback", { error });
        setWorkbook(fallbackWorkbook);
      });

    api
      .getCommunity()
      .then((data) => {
        console.log("[home] Community posts loaded", { count: data.posts.length });
        setPosts(data.posts);
      })
      .catch((error) => {
        console.error("[home] Community load failed, using fallback", { error });
        setPosts(fallbackPosts);
      });

    api
      .getChat()
      .then((data) => {
        console.log("[home] Chat messages loaded", { count: data.length });
        setChat(data);
      })
      .catch((error) => {
        console.error("[home] Chat load failed, using fallback", { error });
        setChat(fallbackChat);
      });
  }, []);

  useLayoutEffect(() => {
    const node = variantViewportRef.current;
    if (!node) {
      console.warn("[home] Variant viewport ref is not available yet");
      return;
    }

    const updateWidth = () => {
      const width = node.clientWidth;
      console.log("[home] Variant viewport width updated", { width });
      setVariantSlideWidth(width);
    };

    updateWidth();

    const observer = new ResizeObserver(updateWidth);
    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  const progress = useMemo(() => {
    const filled = workbook.steps.filter((step) => answers[step.id]?.trim()).length;
    return Math.round((filled / workbook.steps.length) * 100);
  }, [answers, workbook.steps]);

  const activeVariantIndex = Math.max(
    workbookVariants.findIndex((item) => item.id === version),
    0,
  );

  function toggleSituation(id: string) {
    console.log("[home] Toggling situation", { id });
    setSituations((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  async function saveWorkbook() {
    console.log("[home] Saving workbook session", { name, version, situations, progress });
    setIsSaving(true);
    const payload: SessionPayload = {
      name,
      version,
      situation_ids: situations,
      answers: workbook.steps.map((step) => ({
        step_id: step.id,
        answer: answers[step.id] ?? "",
      })),
    };

    try {
      const session = await api.createSession(payload);
      console.log("[home] Session created", { sessionId: session.id });
      const nextSummary = await api.getSummary(session.id);
      console.log("[home] Session summary loaded", { sessionId: session.id, title: nextSummary.title });
      setSummary(nextSummary);
    } catch (error) {
      console.error("[home] Session save failed, building local summary", { error });
      setSummary(buildLocalSummary(payload, workbook));
    } finally {
      setIsSaving(false);
    }
  }

  async function submitChat(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!chatMessage.trim()) {
      console.warn("[home] Chat submit ignored because message is empty");
      return;
    }

    const optimistic: ChatMessage = {
      id: `local-${Date.now()}`,
      author: name || "Guest",
      message: chatMessage,
      created_at: new Date().toISOString(),
    };

    console.log("[home] Submitting chat message", { author: optimistic.author, messageLength: chatMessage.length });
    setChat((current) => [...current, optimistic]);
    setChatMessage("");

    try {
      const saved = await api.postChat(optimistic.author, optimistic.message);
      console.log("[home] Chat message saved", { messageId: saved.id });
      setChat((current) => current.map((item) => (item.id === optimistic.id ? saved : item)));
    } catch (error) {
      console.error("[home] Chat message save failed, keeping optimistic message", { error });
      setChat((current) => current);
    }
  }

  return (
    <main>
      <section className="hero">
        <div className="heroShowcase">
          <Image
            src="/hero-visual.jpg"
            alt=""
            fill
            priority
            quality={100}
            unoptimized
            sizes="100vw"
            className="heroShowcaseImage"
          />
          <div className="heroShowcaseScrim" aria-hidden="true" />

          <nav className="heroNav" aria-label="Main">
            <Link className="heroNavGift" href="/onboarding/gift">
              Gift it
            </Link>
            <Link className="heroNavStart" href="/onboarding/0">
              Start
            </Link>
          </nav>

          <div className="heroShowcaseCopy">
            <h1 className="heroShowcaseLogo">{workbook.brand}</h1>
          </div>

          <HeroFloatCards />
        </div>

        <div className="heroIntro">
          <h2 className="heroIntroTitle">{workbook.headline}</h2>
          <p className="heroIntroLead">
            A step-by-step system of exercises that helps you understand yourself and create an
            interior where you are truly comfortable.
          </p>
          <p className="heroIntroNote">
            <span>Without a designer</span>
            <span>Without a renovation</span>
            <span>With meaning</span>
          </p>

          <div className="methodLine" aria-label="Workbook method">
            <ul className="methodSteps">
              {workbook.method.split(" -> ").map((step, index) => (
                <li key={`${step}-${index}`}>{step}</li>
              ))}
            </ul>
          </div>

          <div className="heroIntroActions">
            <Link className="heroIntroCta" href="/onboarding/0">
              Start work
            </Link>
            <p className="heroIntroLogin">
              Already have an account?{" "}
              <Link href="/onboarding/0">Log in</Link>
            </p>
          </div>
        </div>
      </section>

      <IntroStackSection items={workbook.intro} />

      <SituationsSection
        onToggle={toggleSituation}
        selectedIds={situations}
        situations={workbook.situations}
      />

      <section className="variantsBand" id="variants">
        <div className="sectionTitle">
          <h2>{workbookVariants[activeVariantIndex].headline}</h2>
        </div>
        <div className="variantTabs" role="tablist" aria-label="Workbook versions">
          {workbookVariants.map((item) => (
            <button
              aria-selected={version === item.id}
              className={version === item.id ? "variantTab active" : "variantTab"}
              key={item.id}
              onClick={() => {
                console.log("[home] Variant tab selected", { version: item.id });
                setVersion(item.id);
              }}
              role="tab"
              type="button"
            >
              {version === item.id && <Check size={16} />}
              <span>{item.tab}</span>
            </button>
          ))}
        </div>
        <div
          className="variantViewport"
          ref={variantViewportRef}
          style={
            variantSlideWidth
              ? ({ "--variant-slide-width": `${variantSlideWidth}px` } as React.CSSProperties)
              : undefined
          }
        >
          <div
            className="variantTrack"
            style={{
              transform: `translateX(-${activeVariantIndex * variantSlideWidth}px)`,
            }}
          >
            {workbookVariants.map((item) => (
              <article className="variantScreen" key={item.id}>
                <div className="variantCopy">
                  <h3>{item.title}</h3>
                  <div className="variantQuestions">
                    <VariantSearchCycler queries={item.questions} />
                  </div>
                  <p>{item.description}</p>
                </div>
                <div className="variantCard" aria-hidden="true">
                  {item.id === "system" || item.id === "atmosphere" ? (
                    <video
                      autoPlay
                      className="variantCardVideo"
                      loop
                      muted
                      playsInline
                      preload="metadata"
                      src={
                        item.id === "system"
                          ? "/variants/men-version-card.mp4"
                          : "/variants/women-version-card.mp4"
                      }
                    />
                  ) : null}
                  <strong className="variantCardModel">{item.model}</strong>
                  <div className="phoneTop" />
                  <div className="phoneList">
                    {item.points.map((point, index) => (
                      <span className="variantCardFlowSegment" key={point}>
                        {index > 0 ? (
                          <span aria-hidden="true" className="variantCardArrow">
                            →
                          </span>
                        ) : null}
                        <span className="variantCardPoint">{point}</span>
                      </span>
                    ))}
                  </div>
                  <Link className="primaryButton" href="/onboarding/14">
                    Pay
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="howLinkedBand" id="how-linked">
        <div className="sectionTitle">
          <p>How it works</p>
          <h2>How it all connects</h2>
        </div>
        <div className="linkFlow">
          {connectionSteps.map((item, index) => (
            <article className="linkStep" key={item.title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="testimonialsBand" id="testimonials">
        <div className="sectionTitle">
          <p>Testimonials</p>
          <h2>Loved by people who reshaped their space around themselves</h2>
        </div>
        <div className="testimonialsGrid">
          {testimonials.map((item) => (
            <article className="testimonialCard" key={item.name}>
              <div className="stars" aria-label="5 out of 5">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star fill="currentColor" key={index} size={16} />
                ))}
              </div>
              <blockquote>{item.quote}</blockquote>
              <div className="testimonialAuthor">
                <span>{item.initials}</span>
                <div>
                  <strong>{item.name}</strong>
                  <small>{item.role}</small>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {summary && (
        <section className="resultBand">
          <div>
            <p className="eyebrow">Workbook result</p>
            <h2>{summary.title}</h2>
            <p>{summary.core_question}</p>
          </div>
          <dl>
            {["roles", "scenarios", "states", "objects", "plan"].map((key) => (
              <div key={key}>
                <dt>{resultLabels[key]}</dt>
                <dd>{summary[key] as string}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      <section className="communityBand" id="community">
        <div className="sectionTitle">
          <p>Community</p>
          <h2>People who changed their space</h2>
        </div>
        <div className="postsGrid">
          {posts.map((post) => (
            <article className="postCard" key={post.id}>
              <div className="postHeader">
                <div className="postAvatar">{post.author[0]}</div>
                <div>
                  <strong>{post.author}</strong>
                  <span>Telegram · 2h ago</span>
                </div>
              </div>
              <p>{post.title}</p>
              <small>{post.excerpt}</small>
            </article>
          ))}
        </div>
        <div className="channelInvite">
          <div>
            <p>Join our Telegram channel</p>
            <strong>See how people reshape their space around themselves</strong>
          </div>
          <a className="primaryButton" href="https://t.me/space_self" target="_blank" rel="noreferrer">
            Join channel
          </a>
        </div>
      </section>

      <section className="faqBand" id="faq">
        <div className="faqIntro">
          <p className="eyebrow">FAQ</p>
          <h2>Frequently asked questions</h2>
          <p>
            If you are not sure where to start, these answers explain the workbook format and help
            you choose a first step.
          </p>
          <Link href="/onboarding/0">Start the workbook</Link>
        </div>
        <div className="faqList">
          {faqItems.map((item) => {
            const isOpen = openFaqId === item.id;
            return (
              <article
                className={[
                  "faqItem",
                  isOpen ? "open" : "",
                  item.featured ? "featured" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                key={item.id}
              >
                <button
                  aria-expanded={isOpen}
                  onClick={() => setOpenFaqId(isOpen ? "" : item.id)}
                  type="button"
                >
                  <span>
                    {item.featured && <em>important</em>}
                    {item.question}
                  </span>
                  <Plus size={20} />
                </button>
                <div className="faqAnswer" aria-hidden={!isOpen}>
                  <p>{item.answer}</p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <footer className="siteFooter">
        <div className="footerBrand">
          <strong>{workbook.brand}</strong>
          <p>
            A digital workbook for people who want to change their home by understanding
            themselves—not by copying someone else&apos;s pictures.
          </p>
        </div>
        <nav className="footerLinks" aria-label="Footer navigation">
          {footerColumns.map((column) => (
            <div key={column.title}>
              <h3>{column.title}</h3>
              {column.links.map((link) => (
                <a href={link.href} key={link.label}>
                  {link.label}
                </a>
              ))}
            </div>
          ))}
        </nav>
        <div className="footerBottom">
          <span>© 2026 Space, Self.</span>
          <span>Made for homes that help people live as themselves.</span>
        </div>
      </footer>
    </main>
  );
}

const resultLabels: Record<string, string> = {
  roles: "Roles",
  scenarios: "Scenarios",
  states: "States",
  objects: "Objects and environment",
  plan: "Plan",
};

const workbookVariants = [
  {
    id: "system" as const,
    tab: "Men's version",
    kicker: "role -> action -> outcome",
    headline: "Two workbook versions for different decision styles",
    title: "Men start with questions",
    description:
      "This version helps you see space as a system: which goals it should support, which life scenarios should happen here, and how to make the environment clear, effective, and outcome-driven.",
    model: "space as a system",
    result: "role -> action -> outcome",
    questions: [
      "what goals does the space solve",
      "which life scenarios matter to me",
      "how to make the environment more effective",
    ],
    points: ["goals", "scenarios", "outcome"],
  },
  {
    id: "atmosphere" as const,
    tab: "Women's version",
    kicker: "state -> atmosphere -> experience",
    headline: "Two workbook versions for different ways of feeling at home",
    title: "Women start with questions",
    description:
      "This version starts from feeling: what state you want at home, what relationships and atmosphere should emerge in the space, and how to make home reflect you and feel like yours.",
    model: "space as experience",
    result: "state -> atmosphere -> lived experience",
    questions: [
      "what state do I want to feel at home",
      "what atmosphere should emerge",
      "how does the space reflect me",
    ],
    points: ["state", "atmosphere", "experience"],
  },
];

const connectionSteps = [
  {
    title: "You and roles",
    body: "Space is built from you first—not from style: who you are in this place, how you live every day, and which roles home should support.",
  },
  {
    title: "Scenarios",
    body: "Then you look at real repeating scenarios: where you work, rest, recover, connect, and spend time with yourself.",
  },
  {
    title: "States",
    body: "For each scenario it helps to name the state it should activate: focus, calm, energy, steadiness, closeness, or belonging.",
  },
  {
    title: "Objects and zones",
    body: "Then objects, light, order, routes, and layout become tools: they either support the chosen states and scenarios—or drain you.",
  },
];

const testimonials = [
  {
    initials: "AK",
    name: "Alina K.",
    role: "moving into a new apartment",
    quote:
      "I thought I needed a designer and a big renovation. After the workbook I knew which scenarios mattered, and I made the first changes over one weekend.",
  },
  {
    initials: "MR",
    name: "Mark R.",
    role: "working remotely from home",
    quote:
      "The most useful part was looking at home through roles and states. Work stopped taking over the whole apartment, and evenings felt like evenings again.",
  },
  {
    initials: "NS",
    name: "Nika S.",
    role: "space for content and guests",
    quote:
      "The workbook helped me build a space that actually feels like me—not a Pinterest board. Guests pick up on it immediately now.",
  },
];

const faqItems = [
  {
    id: "why-it-works",
    featured: true,
    question: "Why this works",
    answer:
      "Our brain constantly reads the environment. We do not just see objects—we instantly assign meaning, function, and possible action to them. In perception psychology this is affordance: the action a thing or space seems to offer. If space is not shaped intentionally, it activates you randomly—from what is there, not from what you need. Through roles -> life scenarios -> states -> objects, you build a space that reflects you and supports the life you want.",
  },
  {
    id: "what-is",
    question: "What do I get after finishing the workbook?",
    answer:
      "You build a personal space concept: roles, scenarios, states, objects, and first actions you can take without chaotic reference hunting.",
  },
  {
    id: "renovation",
    question: "Is this only for people doing a renovation?",
    answer:
      "No. The workbook works for renovation and for a softer reset: rearranging, storage, light, work zones, and objects that support the life you want.",
  },
  {
    id: "designer",
    question: "Can I use the result with a designer?",
    answer:
      "Yes. The workbook output becomes a more honest brief—not only style and rooms, but how you live and what the space should activate.",
  },
  {
    id: "time",
    question: "How long does it take to complete?",
    answer:
      "You can finish in one calm evening or return to the questions over time. Answers get sharper when you observe your home in real life instead of rushing.",
  },
  {
    id: "budget",
    question: "Do I need budget for big changes?",
    answer:
      "No. The first result often comes from small steps: remove what is extra, change light scenarios, rebuild storage, or define one important zone.",
  },
];

const footerColumns = [
  {
    title: "Workbook",
    links: [
      { label: "Start", href: "#workbook" },
      { label: "Situations", href: "#situations" },
      { label: "Versions", href: "#variants" },
      { label: "How it connects", href: "#how-linked" },
      { label: "FAQ", href: "#faq" },
    ],
  },
  {
    title: "Community",
    links: [
      { label: "Stories", href: "#community" },
      { label: "Live chat", href: "#chat" },
      { label: "Testimonials", href: "#testimonials" },
    ],
  },
  {
    title: "Contact",
    links: [
      { label: "hello@space-self.local", href: "mailto:hello@space-self.local" },
      { label: "Telegram", href: "https://t.me/" },
      { label: "Instagram", href: "https://instagram.com/" },
    ],
  },
];

function buildLocalSummary(payload: SessionPayload, workbook: Workbook) {
  const answerMap = Object.fromEntries(payload.answers.map((item) => [item.step_id, item.answer]));
  const selectedVersion = workbook.versions.find((item) => item.id === payload.version);

  return {
    title: "Personal space concept",
    version: selectedVersion?.title ?? "",
    core_question: "What life do I want to live in this space?",
    roles: answerMap.roles || "Roles not filled in yet",
    scenarios: answerMap.scenarios || "Scenarios not filled in yet",
    states: answerMap.states || "States not filled in yet",
    objects: answerMap.objects || "Objects not filled in yet",
    plan: answerMap.plan || "Plan not filled in yet",
  };
}
