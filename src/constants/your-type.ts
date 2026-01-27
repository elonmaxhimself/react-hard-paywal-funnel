import { useTranslation } from "react-i18next";

export const useYourType = () => {
    const { t } = useTranslation();
    
    return [
        {
            id: 1,
            image: {
                src: `/images/character-types/girl-next-door-type.webp`,
                alt: t('hooks.yourType.girlNextDoor.alt'),
                name: t('hooks.yourType.girlNextDoor.name'),
            },
            value: "girl-next-door",
        },
        {
            id: 2,
            image: {
                src: `/images/character-types/femme-fatale-type.webp`,
                alt: t('hooks.yourType.femmeFatale.alt'),
                name: t('hooks.yourType.femmeFatale.name'),
            },
            value: "femme-fatale",
        },
        {
            id: 3,
            image: {
                src: `/images/character-types/manic-pixie-girl-type.webp`,
                alt: t('hooks.yourType.manicPixieGirl.alt'),
                name: t('hooks.yourType.manicPixieGirl.name'),
            },
            value: "manic-pixie-girl",
        },
        {
            id: 4,
            image: {
                src: `/images/character-types/innocent-ingenue-type.webp`,
                alt: t('hooks.yourType.innocentIngenue.alt'),
                name: t('hooks.yourType.innocentIngenue.name'),
            },
            value: "innocent-ingenue",
        },
        {
            id: 5,
            image: {
                src: `/images/character-types/goth-girl-type.webp`,
                alt: t('hooks.yourType.gothGirl.alt'),
                name: t('hooks.yourType.gothGirl.name'),
            },
            value: "goth-girl",
        },
        {
            id: 6,
            image: {
                src: `/images/character-types/anime-otaku-type.webp`,
                alt: t('hooks.yourType.animeOtaku.alt'),
                name: t('hooks.yourType.animeOtaku.name'),
            },
            value: "anime-otaku",
        },
        {
            id: 7,
            image: {
                src: `/images/character-types/nerdy-girl-type.webp`,
                alt: t('hooks.yourType.nerdyGirl.alt'),
                name: t('hooks.yourType.nerdyGirl.name'),
            },
            value: "nerdy-girl",
        },
        {
            id: 8,
            image: {
                src: `/images/character-types/biker-chick-type.webp`,
                alt: t('hooks.yourType.bikerChick.alt'),
                name: t('hooks.yourType.bikerChick.name'),
            },
            value: "biker-chick",
        },
        {
            id: 9,
            image: {
                src: `/images/character-types/lady-boss-type.webp`,
                alt: t('hooks.yourType.ladyBoss.alt'),
                name: t('hooks.yourType.ladyBoss.name'),
            },
            value: "lady-boss",
        },
        {
            id: 10,
            image: {
                src: `/images/character-types/e-girl-type.webp`,
                alt: t('hooks.yourType.eGirl.alt'),
                name: t('hooks.yourType.eGirl.name'),
            },
            value: "e-girl",
        },
        {
            id: 11,
            image: {
                src: `/images/character-types/tomboy-type.webp`,
                alt: t('hooks.yourType.tomboy.alt'),
                name: t('hooks.yourType.tomboy.name'),
            },
            value: "tomboy",
        },
        {
            id: 12,
            image: {
                src: `/images/character-types/rebel-type.webp`,
                alt: t('hooks.yourType.rebel.alt'),
                name: t('hooks.yourType.rebel.name'),
            },
            value: "rebel",
        },
        {
            id: 13,
            image: {
                src: `/images/character-types/athlete-type.webp`,
                alt: t('hooks.yourType.athlete.alt'),
                name: t('hooks.yourType.athlete.name'),
            },
            value: "athlete",
        },
        {
            id: 14,
            image: {
                src: `/images/character-types/woke-girl-type.webp`,
                alt: t('hooks.yourType.woke.alt'),
                name: t('hooks.yourType.woke.name'),
            },
            value: "woke-girl",
        },
        {
            id: 15,
            image: {
                src: `/images/character-types/instagram-baddie-type.webp`,
                alt: t('hooks.yourType.instagramBaddie.alt'),
                name: t('hooks.yourType.instagramBaddie.name'),
            },
            value: "instagram-baddie",
        },
    ];
};