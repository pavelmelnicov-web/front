"use client";

import Image from "next/image";
import { useEffect } from "react";

const TELEGRAM_MEMBER_COUNT = 2847;

const peoplePortraitAvatars = [
  { src: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80", id: "portrait-w-fashion-01" },
  { src: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=120&h=120&q=80", id: "portrait-w-fashion-02" },
  { src: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&h=120&q=80", id: "portrait-w-fashion-03" },
  { src: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&h=120&q=80", id: "portrait-m-fashion-01" },
  { src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80", id: "portrait-m-fashion-02" },
] as const;

const constellationSlots = [
  { className: "channelInviteCloudAvatarWrap--slot0", size: 56 },
  { className: "channelInviteCloudAvatarWrap--slot1", size: 44 },
  { className: "channelInviteCloudAvatarWrap--slot2", size: 72 },
  { className: "channelInviteCloudAvatarWrap--slot3", size: 48 },
  { className: "channelInviteCloudAvatarWrap--slot4", size: 104 },
] as const;

const staticConstellationAvatars = [
  { src: "/testimonials/alina-k-avatar.png", id: "alina" },
  { src: "/testimonials/mark-r-avatar.png", id: "mark" },
  { src: "/testimonials/nika-s-avatar.png", id: "nika" },
  { src: "/testimonials/kiano-avatar.png", id: "kiano" },
  peoplePortraitAvatars[0],
].map((avatar, slotIndex) => ({
  ...avatar,
  className: constellationSlots[slotIndex].className,
  size: constellationSlots[slotIndex].size,
  slotIndex,
}));

function formatCompactMemberCount(count: number) {
  if (count >= 1000) {
    const compact = (count / 1000).toFixed(1).replace(/\.0$/, "");
    return `+${compact}K`;
  }

  return `+${count}`;
}

const compactMemberCount = formatCompactMemberCount(TELEGRAM_MEMBER_COUNT);

export function CommunityTelegramInvite() {
  useEffect(() => {
    console.log("[community-telegram-invite] Static constellation rendered", {
      memberCount: TELEGRAM_MEMBER_COUNT,
      compactMemberCount,
      avatarCount: staticConstellationAvatars.length,
      avatarIds: staticConstellationAvatars.map((avatar) => avatar.id),
    });
  }, []);

  return (
    <div className="channelInvite">
      <div className="channelInviteMeta">
        <span>Real people</span>
        <span>Real homes</span>
      </div>

      <div aria-hidden="true" className="channelInviteCloud">
        {staticConstellationAvatars.map((avatar) => (
          <div
            className={["channelInviteCloudAvatarWrap", avatar.className].join(" ")}
            key={avatar.id}
          >
            <Image
              alt=""
              className="channelInviteCloudAvatar"
              height={avatar.size}
              onError={() => {
                console.error("[community-telegram-invite] Avatar image failed to load", {
                  avatarId: avatar.id,
                  avatarSrc: avatar.src,
                  slotIndex: avatar.slotIndex,
                });
              }}
              onLoad={() => {
                console.log("[community-telegram-invite] Avatar image loaded", {
                  avatarId: avatar.id,
                  slotIndex: avatar.slotIndex,
                });
              }}
              src={avatar.src}
              unoptimized
              width={avatar.size}
            />
          </div>
        ))}

        <span className="channelInviteCountBadge">{compactMemberCount}</span>

        <div className="channelInviteSkeleton">
          <span />
          <span />
        </div>
      </div>

      <div className="channelInviteFooter">
        <p className="channelInviteHeadline">
          <strong>Join our Telegram channel.</strong>
          <span>
            {" "}
            Stories, updates, and real homes in progress from people using the workbook.
          </span>
        </p>

        <a
          className="channelInviteCta"
          href="https://t.me/space_self"
          onClick={() => {
            console.log("[community-telegram-invite] Telegram link clicked", {
              memberCount: TELEGRAM_MEMBER_COUNT,
              avatarIds: staticConstellationAvatars.map((avatar) => avatar.id),
            });
          }}
          rel="noreferrer"
          target="_blank"
        >
          Join channel
        </a>
      </div>
    </div>
  );
}
