"use client";

import { Workbook } from "../../lib/api";
import { friendSituationCopy } from "../../lib/onboarding/friend-copy";
import { OnboardingFlow, OnboardingState } from "../../lib/onboarding/types";
import { formatCardExpiry, formatCardNumber } from "../../lib/onboarding/validation";

type OnboardingStepContentProps = {
  flow: OnboardingFlow;
  step: number;
  workbook: Workbook;
  state: OnboardingState;
  onUpdate: (patch: Partial<OnboardingState>) => void;
  onToggleSubSituation: (value: string) => void;
};

export function OnboardingStepContent({
  flow,
  step,
  workbook,
  state,
  onUpdate,
  onToggleSubSituation,
}: OnboardingStepContentProps) {
  const selectedSituation = workbook.situations.find((item) => item.id === state.selectedSituationId);

  if (flow === "regular") {
    switch (step) {
      case 0:
        return (
          <div>
            <h2>Расскажи немного о себе</h2>
            <p>Имя и возраст помогут сделать квиз персональным.</p>
            <label>
              Имя
              <input
                value={state.name}
                onChange={(event) => onUpdate({ name: event.target.value })}
                placeholder="Ваше имя"
              />
            </label>
            <label>
              Возраст
              <input
                value={state.age}
                onChange={(event) => onUpdate({ age: event.target.value })}
                placeholder="Ваш возраст"
                inputMode="numeric"
              />
            </label>
          </div>
        );
      case 1:
        return (
          <div>
            <h2>Пока другие откладывают, ты движешься вперед</h2>
            <div className="onboardingStats">
              <div>
                <strong>72%</strong>
                <p>людей так и не начинают ремонт</p>
              </div>
              <div>
                <strong>58%</strong>
                <p>не довольны результатом ремонта</p>
              </div>
              <div>
                <strong>65%</strong>
                <p>начинают изменения без четкого плана</p>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div>
            <h2>В какой ситуации вы находитесь?</h2>
            <p>Выбери одну категорию, чтобы мы поняли твой старт.</p>
            <div className="onboardingOptions">
              {workbook.situations.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={item.id === state.selectedSituationId ? "active" : ""}
                  onClick={() => onUpdate({ selectedSituationId: item.id, selectedSubSituations: [] })}
                >
                  <strong>{item.title}</strong>
                  <small>{item.description}</small>
                </button>
              ))}
            </div>
          </div>
        );
      case 3:
        return (
          <div>
            <h2>Выбери точные сигналы</h2>
            <p>Какие из этих ситуаций лучше всего описывают ваш контекст?</p>
            <div className="onboardingOptions">
              {selectedSituation?.examples.map((example) => (
                <button
                  key={example}
                  type="button"
                  className={state.selectedSubSituations.includes(example) ? "active" : ""}
                  onClick={() => onToggleSubSituation(example)}
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        );
      case 4:
        return (
          <div>
            <h2>Для кого это будет удобно</h2>
            <p>Выбери вариант, который звучит ближе.</p>
            <div className="onboardingOptions">
              {[
                { value: "male", label: "Для мужчины" },
                { value: "female", label: "Для женщины" },
                { value: "other", label: "Мне важна нейтральная версия" },
              ].map((item) => (
                <button
                  type="button"
                  key={item.value}
                  className={state.selectedGender === item.value ? "active" : ""}
                  onClick={() =>
                    onUpdate({ selectedGender: item.value as OnboardingState["selectedGender"] })
                  }
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        );
      case 5:
        return (
          <div>
            <h2>Понимаем твой контекст</h2>
            <p>
              {state.name
                ? `${state.name}, ты сейчас переходишь к новому этапу жизни и меняешь своё пространство.`
                : "Похоже, ты сейчас переходишь к новому этапу жизни и меняешь своё пространство."}
            </p>
            <p>
              Удалённая работа влияет на дом: он должен быть и рабочим, и уютным. Сейчас важно
              сделать пространство таким, чтобы оно поддерживало твой ритм и помогало
              сосредоточиться.
            </p>
          </div>
        );
      case 6:
        return (
          <div>
            <h2>Как будет происходить</h2>
            <div className="onboardingCards">
              <article>
                <strong>Будут вопросы</strong>
                <p>Мы спросим о вашем ритме, целях и том, как вы живете.</p>
              </article>
              <article>
                <strong>Можно отправлять фото</strong>
                <p>Покажите текущее пространство и детали, которые вам важны.</p>
              </article>
              <article>
                <strong>Можно записывать голосовые</strong>
                <p>Расскажите, как вам комфортнее — текстом или голосом.</p>
              </article>
            </div>
          </div>
        );
      case 7:
        return (
          <div>
            <h2>Как заполнять</h2>
            <p>Сначала сядь в specialty кофейне и запиши первые мысли о доме и своей жизни.</p>
          </div>
        );
      case 8:
        return (
          <div>
            <h2>Как заполнять</h2>
            <p>
              На выходной день расслабься в постели и представь, как хочешь, чтобы дом работал для
              тебя.
            </p>
          </div>
        );
      case 9:
        return (
          <div>
            <h2>Как заполнять</h2>
            <p>Закрепи окончательные мысли позже, когда идеи станут яснее и не нужно спешить.</p>
          </div>
        );
      case 10:
        return (
          <div>
            <h2>Поймешь лучше себя</h2>
            <p>На этом этапе ты увидишь, что важно именно тебе и зачем ты меняешь пространство.</p>
          </div>
        );
      case 11:
        return (
          <div>
            <h2>Определишься, нужен ли ремонт или перестановка</h2>
            <p>Мы поможем понять, где достаточно перестановки, а где стоит задуматься о ремонте.</p>
          </div>
        );
      case 12:
        return (
          <div>
            <h2>Получишь информацию для дизайнера</h2>
            <p>В результате появится понятный контекст, который можно передать специалисту.</p>
          </div>
        );
      case 13:
        return (
          <div>
            <h2>Твоё пространство будет отражать тебя</h2>
            <p>Мы соберем всё так, чтобы дом начал работать на твой ритм и ощущения.</p>
          </div>
        );
      case 14:
        return (
          <PaywallStep
            title="Оплата доступа к воркбуку"
            description="Введите данные карты, чтобы перейти к исследованию пространства."
            state={state}
            onUpdate={onUpdate}
          />
        );
      default:
        return null;
    }
  }

  switch (step) {
    case 20:
      return (
        <div>
          <h2>Воркбук — хороший и глубокий подарок</h2>
          <p>
            Мы отправим красивое письмо на почту или в одну из социальных сетей вашему другу. Можно
            сделать упоминание от вашего имени или отправить анонимно.
          </p>
          <div className="onboardingOptions">
            <button
              type="button"
              className={state.giftMention === "mention" ? "active" : ""}
              onClick={() => onUpdate({ giftMention: "mention" })}
            >
              С упоминанием вас
            </button>
            <button
              type="button"
              className={state.giftMention === "anonymous" ? "active" : ""}
              onClick={() => onUpdate({ giftMention: "anonymous" })}
            >
              Без упоминания
            </button>
          </div>
          {state.giftMention === "mention" && (
            <label>
              Как вы хотите представить себя?
              <input
                value={state.giftMentionText}
                onChange={(event) => onUpdate({ giftMentionText: event.target.value })}
                placeholder="Например: Твой друг из архитектуры"
              />
            </label>
          )}
        </div>
      );
    case 21:
      return (
        <div>
          <h2>В какой ситуации находится ваш друг?</h2>
          <p>Выберите один вариант, чтобы письмо было точнее.</p>
          <div className="onboardingOptions">
            {workbook.situations.map((item) => {
              const friendText = friendSituationCopy[item.id] ?? {
                title: item.title,
                description: item.description,
              };

              return (
                <button
                  key={item.id}
                  type="button"
                  className={state.giftSituationId === item.id ? "active" : ""}
                  onClick={() => onUpdate({ giftSituationId: item.id })}
                >
                  <strong>{friendText.title}</strong>
                  <small>{friendText.description}</small>
                </button>
              );
            })}
          </div>
        </div>
      );
    case 22:
      return (
        <div>
          <h2>Куда отправить письмо и ссылку?</h2>
          <p>Укажите email или аккаунт в социальной сети, чтобы мы отправили подарок.</p>
          <label>
            Email или социальный аккаунт
            <input
              value={state.giftContact}
              onChange={(event) => onUpdate({ giftContact: event.target.value })}
              placeholder="example@domain.com или @username"
            />
          </label>
        </div>
      );
    case 23:
      return (
        <PaywallStep
          title="Оплата подарка"
          description="Введите данные карты, чтобы отправить доступ вашему другу."
          state={state}
          onUpdate={onUpdate}
        />
      );
    case 24:
      return (
        <div>
          <h2>Подарок готов</h2>
          <p>
            Мы подготовили письмо для вашего друга. После оплаты он получит доступ к воркбуку и
            красивую ссылку.
          </p>
        </div>
      );
    default:
      return null;
  }
}

function PaywallStep({
  title,
  description,
  state,
  onUpdate,
}: {
  title: string;
  description: string;
  state: OnboardingState;
  onUpdate: (patch: Partial<OnboardingState>) => void;
}) {
  return (
    <div>
      <h2>{title}</h2>
      <p>{description}</p>
      <div className="paywallForm">
        <label>
          Номер карты
          <input
            value={state.cardNumber}
            onChange={(event) => onUpdate({ cardNumber: formatCardNumber(event.target.value) })}
            placeholder="0000 0000 0000 0000"
          />
        </label>
        <div className="paywallRow">
          <label>
            Срок действия
            <input
              value={state.cardExpiry}
              onChange={(event) => onUpdate({ cardExpiry: formatCardExpiry(event.target.value) })}
              placeholder="MM/YY"
            />
          </label>
          <label>
            CVC
            <input
              value={state.cardCvc}
              onChange={(event) =>
                onUpdate({ cardCvc: event.target.value.replace(/\D/g, "").slice(0, 4) })
              }
              placeholder="000"
            />
          </label>
        </div>
        <label>
          Имя на карте
          <input
            value={state.cardName}
            onChange={(event) => onUpdate({ cardName: event.target.value })}
            placeholder="Иван Иванов"
          />
        </label>
        <div className="paywallSummary">
          <span>Тариф «Начать исследование»</span>
          <strong>390 ₽</strong>
        </div>
      </div>
    </div>
  );
}
