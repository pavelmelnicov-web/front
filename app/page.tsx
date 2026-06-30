"use client";

import { ArrowRight, Check, MessageSquare, Plus, Send, Sparkles, Star } from "lucide-react";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
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
  const [name, setName] = useState("Гость");
  const [summary, setSummary] = useState<Record<string, string | string[]> | null>(null);
  const [chatMessage, setChatMessage] = useState("");
  const [openFaqId, setOpenFaqId] = useState(faqItems[0].id);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    api.getWorkbook().then(setWorkbook).catch(() => setWorkbook(fallbackWorkbook));
    api.getCommunity().then((data) => setPosts(data.posts)).catch(() => setPosts(fallbackPosts));
    api.getChat().then(setChat).catch(() => setChat(fallbackChat));
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
    setSituations((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  async function saveWorkbook() {
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
      const nextSummary = await api.getSummary(session.id);
      setSummary(nextSummary);
    } catch {
      setSummary(buildLocalSummary(payload, workbook));
    } finally {
      setIsSaving(false);
    }
  }

  async function submitChat(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!chatMessage.trim()) return;

    const optimistic: ChatMessage = {
      id: `local-${Date.now()}`,
      author: name || "Гость",
      message: chatMessage,
      created_at: new Date().toISOString(),
    };

    setChat((current) => [...current, optimistic]);
    setChatMessage("");

    try {
      const saved = await api.postChat(optimistic.author, optimistic.message);
      setChat((current) => current.map((item) => (item.id === optimistic.id ? saved : item)));
    } catch {
      setChat((current) => current);
    }
  }

  return (
    <main>
      <section className="hero">
        <nav className="topbar" aria-label="Main">
          <div className="topbarBrand">
            <strong>{workbook.brand}</strong>
            <span className="topbarTagline">{workbook.tagline}</span>
          </div>
          <div className="topbarActions">
            <Link className="topbarGift" href="/onboarding/gift">
              Подарить
            </Link>
            <Link href="/onboarding/0">Начать</Link>
          </div>
        </nav>

        <div className="heroCenter">
          <h1>{workbook.headline}</h1>
          <p className="lead">
            Через роли, сценарии жизни, состояния и предметы ты соберёшь пространство, которое
            будет отражать тебя и поддерживать жизнь, которую ты хочешь жить.
          </p>
          <div className="heroActions">
            <Link className="heroCta" href="/onboarding/0">
              Начать исследование
              <ArrowRight size={18} />
            </Link>
          </div>
          <div className="methodLine">
            <Sparkles size={18} aria-hidden="true" />
            <ul className="methodSteps">
              {workbook.method.split(" -> ").map((step, index) => (
                <li key={`${step}-${index}`}>{step}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="band introBand">
        {workbook.intro.map((item, index) => (
          <article className="introItem" key={item.title}>
            <span>{index + 1}</span>
            <h2>{item.title}</h2>
            <p>{item.body}</p>
          </article>
        ))}
      </section>

      <section className="band situationsBand" id="situations">
        <div className="sectionTitle">
          <p>В каких ситуациях поможет</p>
          <h2>Почему выбирают этот воркбук</h2>
        </div>
        <div className="situationsGrid">
          {workbook.situations.map((item) => (
            <button
              className={situations.includes(item.id) ? "situation selected" : "situation"}
              key={item.id}
              onClick={() => toggleSituation(item.id)}
              type="button"
            >
              <span>{situations.includes(item.id) && <Check size={16} />}</span>
              <strong>{item.title}</strong>
              <small>{item.description}</small>
              <em>{item.examples.join(" / ")}</em>
            </button>
          ))}
        </div>
      </section>

      <section className="variantsBand" id="variants">
        <div className="sectionTitle">
          <p>Варианты воркбука</p>
          <h2>{workbookVariants[activeVariantIndex].headline}</h2>
        </div>
        <div className="variantTabs" role="tablist" aria-label="Версии воркбука">
          {workbookVariants.map((item) => (
            <button
              aria-selected={version === item.id}
              className={version === item.id ? "variantTab active" : "variantTab"}
              key={item.id}
              onClick={() => setVersion(item.id)}
              role="tab"
              type="button"
            >
              {version === item.id && <Check size={16} />}
              <span>{item.tab}</span>
            </button>
          ))}
        </div>
        <div className="variantViewport">
          <div
            className="variantTrack"
            style={{ transform: `translateX(-${activeVariantIndex * 100}%)` }}
          >
            {workbookVariants.map((item) => (
              <article className="variantScreen" key={item.id}>
                <div className="variantCopy">
                  <span>{item.kicker}</span>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  <div className="variantQuestions">
                    {item.questions.map((question) => (
                      <em key={question}>{question}</em>
                    ))}
                  </div>
                </div>
                <div className="variantCard" aria-hidden="true">
                  <div className="phoneTop" />
                  <strong>{item.model}</strong>
                  <p>{item.result}</p>
                  <div className="phoneList">
                    {item.points.map((point) => (
                      <span key={point}>{point}</span>
                    ))}
                  </div>
                  <Link className="primaryButton" href="/onboarding/14">
                    Оплатить
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="howLinkedBand" id="how-linked">
        <div className="sectionTitle">
          <p>Как это работает</p>
          <h2>Как всё связано</h2>
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
          <p>Отзывы</p>
          <h2>Любят те, кто уже пересобрал пространство под себя</h2>
        </div>
        <div className="testimonialsGrid">
          {testimonials.map((item) => (
            <article className="testimonialCard" key={item.name}>
              <div className="stars" aria-label="5 из 5">
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
            <p className="eyebrow">Результат прохождения</p>
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
          <h2>Люди, которые изменили своё пространство</h2>
        </div>
        <div className="postsGrid">
          {posts.map((post) => (
            <article className="postCard" key={post.id}>
              <div className="postHeader">
                <div className="postAvatar">{post.author[0]}</div>
                <div>
                  <strong>{post.author}</strong>
                  <span>Telegram · 2 ч назад</span>
                </div>
              </div>
              <p>{post.title}</p>
              <small>{post.excerpt}</small>
            </article>
          ))}
        </div>
        <div className="channelInvite">
          <div>
            <p>Присоединяйся к нашему Telegram-каналу</p>
            <strong>Смотри, как люди меняют своё пространство под себя</strong>
          </div>
          <a className="primaryButton" href="https://t.me/space_self" target="_blank" rel="noreferrer">
            В канал
          </a>
        </div>
      </section>

      <section className="faqBand" id="faq">
        <div className="faqIntro">
          <p className="eyebrow">FAQ</p>
          <h2>Часто задаваемые вопросы</h2>
          <p>
            Если ты пока не уверен, с чего начать, эти ответы помогут понять формат воркбука и
            выбрать первый шаг.
          </p>
          <Link href="/onboarding/0">Начать воркбук</Link>
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
                    {item.featured && <em>важно</em>}
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
            Digital workbook для тех, кто хочет начать менять дом с понимания себя,
            а не с чужих картинок.
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
  roles: "Роли",
  scenarios: "Сценарии",
  states: "Состояния",
  objects: "Предметы и среда",
  plan: "План",
};

const workbookVariants = [
  {
    id: "system" as const,
    tab: "Версия для мужчин",
    kicker: "роль -> действие -> результат",
    headline: "Две версии воркбука под разные способы принятия решений",
    title: "Мужчины начинают с вопросов",
    description:
      "Эта версия помогает смотреть на пространство как на систему: какие цели оно должно поддерживать, какие сценарии жизни должны происходить здесь и как сделать среду понятной, эффективной и работающей на результат.",
    model: "пространство как система",
    result: "роль -> действие -> результат",
    questions: [
      "какие цели должно поддерживать пространство",
      "какие сценарии жизни должны происходить здесь",
      "как сделать среду более эффективной",
    ],
    points: ["цели", "сценарии", "результат"],
  },
  {
    id: "atmosphere" as const,
    tab: "Версия для женщин",
    kicker: "состояние -> атмосфера -> опыт",
    headline: "Две версии воркбука под разные способы чувствовать дом",
    title: "Женщины начинают с вопросов",
    description:
      "Эта версия помогает идти от ощущений: какое состояние хочется чувствовать дома, какие отношения и атмосфера должны возникать в пространстве и как сделать так, чтобы дом отражал меня и давал ощущение себя.",
    model: "пространство как проживание",
    result: "состояние -> атмосфера -> проживание опыта",
    questions: [
      "какое состояние хочется чувствовать дома",
      "какая атмосфера должна возникать",
      "как пространство отражает меня",
    ],
    points: ["состояние", "атмосфера", "опыт"],
  },
];

const connectionSteps = [
  {
    title: "Ты и роли",
    body: "Сначала пространство собирается не от стиля, а от тебя: кто ты в этом месте, как живёшь каждый день и какие роли дом должен поддерживать.",
  },
  {
    title: "Сценарии",
    body: "Потом ты смотришь на реальные повторяющиеся сценарии: где работаешь, отдыхаешь, восстанавливаешься, общаешься, остаёшься наедине с собой.",
  },
  {
    title: "Состояния",
    body: "Для каждого сценария важно понять, какое состояние он должен включать: фокус, спокойствие, энергию, устойчивость, близость или ощущение своего места.",
  },
  {
    title: "Вещи и зоны",
    body: "Дальше вещи, свет, порядок, маршруты и расстановка становятся инструментами: они либо поддерживают выбранные состояния и сценарии, либо забирают силы.",
  },
];

const testimonials = [
  {
    initials: "АК",
    name: "Алина К.",
    role: "переезд в новую квартиру",
    quote:
      "Я думала, что мне нужен дизайнер и большой ремонт. После воркбука стало ясно, какие сценарии мне важны, и первые изменения я сделала за выходные.",
  },
  {
    initials: "МР",
    name: "Марк Р.",
    role: "удалённая работа дома",
    quote:
      "Самым полезным оказалось смотреть на дом через роли и состояния. Рабочее место перестало захватывать всю квартиру, а вечер снова стал вечером.",
  },
  {
    initials: "НС",
    name: "Ника С.",
    role: "пространство для контента и гостей",
    quote:
      "Воркбук помог собрать не красивую картинку из Pinterest, а пространство, которое правда похоже на меня. Гости теперь сразу это считывают.",
  },
];

const faqItems = [
  {
    id: "why-it-works",
    featured: true,
    question: "Почему это работает",
    answer:
      "Наш мозг постоянно считывает окружающую среду. Мы не просто видим предметы - мы мгновенно приписываем им смысл, функцию и возможность действия с ними. В психологии восприятия есть понятие affordance - «возможность действия», которую предмет или среда как будто предлагают человеку. Если пространство не настроено осознанно - оно будет включать человека случайно. Из того, что есть. А не из того, что нужно. Через: роли -> сценарии жизни -> состояния -> предметы ты соберешь пространство, которое будут отражать тебя и поддерживать ту жизнь, которой ты хочешь жить.",
  },
  {
    id: "what-is",
    question: "Что я получу после прохождения воркбука?",
    answer:
      "Ты соберёшь личную концепцию пространства: роли, сценарии, состояния, предметы и первые действия, которые можно сделать без хаотичного поиска референсов.",
  },
  {
    id: "renovation",
    question: "Это только для тех, кто делает ремонт?",
    answer:
      "Нет. Воркбук подходит и для ремонта, и для мягкой пересборки дома: перестановки, хранения, света, рабочих зон и предметов, которые поддерживают нужный образ жизни.",
  },
  {
    id: "designer",
    question: "Можно ли использовать результат с дизайнером?",
    answer:
      "Да. Итог воркбука можно передать дизайнеру как более честный бриф: не только стиль и комнаты, а то, как ты живёшь и что пространство должно включать.",
  },
  {
    id: "time",
    question: "Сколько времени занимает заполнение?",
    answer:
      "Можно пройти за один спокойный вечер или возвращаться к вопросам постепенно. Лучше не торопиться: ответы становятся точнее, когда ты наблюдаешь за своим домом в реальной жизни.",
  },
  {
    id: "budget",
    question: "Нужен ли бюджет на большие изменения?",
    answer:
      "Нет. Первый результат часто появляется после небольших шагов: убрать лишнее, изменить сценарии света, пересобрать хранение или выделить одну важную зону.",
  },
];

const footerColumns = [
  {
    title: "Workbook",
    links: [
      { label: "Начать", href: "#workbook" },
      { label: "Ситуации", href: "#situations" },
      { label: "Варианты", href: "#variants" },
      { label: "Как связано", href: "#how-linked" },
      { label: "FAQ", href: "#faq" },
    ],
  },
  {
    title: "Community",
    links: [
      { label: "Истории", href: "#community" },
      { label: "Live chat", href: "#chat" },
      { label: "Отзывы", href: "#testimonials" },
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
    title: "Личная концепция пространства",
    version: selectedVersion?.title ?? "",
    core_question: "Какую жизнь я хочу жить в этом пространстве?",
    roles: answerMap.roles || "Роли пока не заполнены",
    scenarios: answerMap.scenarios || "Сценарии пока не заполнены",
    states: answerMap.states || "Состояния пока не заполнены",
    objects: answerMap.objects || "Предметы пока не заполнены",
    plan: answerMap.plan || "План пока не заполнен",
  };
}
