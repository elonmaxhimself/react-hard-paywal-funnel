import { useTranslation } from "react-i18next";

export const useTurnsOfYou = () => {
    const { t } = useTranslation();
    
    return [
        {
            id: 1,
            image: {
                src: `/images/turn-types/innocanse-and-corruption-type.webp`,
                alt: t('hooks.turnsOfYou.innocenceAndCorruption.alt'),
                name: t('hooks.turnsOfYou.innocenceAndCorruption.name'),
            },
            value: "innocanse-and-corruption",
        },
        {
            id: 2,
            image: {
                src: `/images/turn-types/dominance-type.webp`,
                alt: t('hooks.turnsOfYou.dominance.alt'),
                name: t('hooks.turnsOfYou.dominance.name'),
            },
            value: "dominance",
        },
        {
            id: 3,
            image: {
                src: `/images/turn-types/stockings-and-lingerie-type.webp`,
                alt: t('hooks.turnsOfYou.stockingsAndLingerie.alt'),
                name: t('hooks.turnsOfYou.stockingsAndLingerie.name'),
            },
            value: "stockings-and-lingerie",
        },
        {
            id: 4,
            image: {
                src: `/images/turn-types/latex-or-leather-type.webp`,
                alt: t('hooks.turnsOfYou.latexOrLeather.alt'),
                name: t('hooks.turnsOfYou.latexOrLeather.name'),
            },
            value: "latex-or-leather",
        },
        {
            id: 5,
            image: {
                src: `/images/turn-types/dirty-talk-type.webp`,
                alt: t('hooks.turnsOfYou.dirtyTalk.alt'),
                name: t('hooks.turnsOfYou.dirtyTalk.name'),
            },
            value: "dirty-talk",
        },
        {
            id: 6,
            image: {
                src: `/images/turn-types/high-heels-type.webp`,
                alt: t('hooks.turnsOfYou.highHeels.alt'),
                name: t('hooks.turnsOfYou.highHeels.name'),
            },
            value: "high-heels",
        },
        {
            id: 7,
            image: {
                src: `/images/turn-types/lipstick-type.webp`,
                alt: t('hooks.turnsOfYou.lipstick.alt'),
                name: t('hooks.turnsOfYou.lipstick.name'),
            },
            value: "lipstick",
        },
        {
            id: 8,
            image: {
                src: `/images/turn-types/role-play-type.webp`,
                alt: t('hooks.turnsOfYou.rolePlay.alt'),
                name: t('hooks.turnsOfYou.rolePlay.name'),
            },
            value: "role-play",
        },
        {
            id: 9,
            image: {
                src: `/images/turn-types/uniforms-type.webp`,
                alt: t('hooks.turnsOfYou.uniforms.alt'),
                name: t('hooks.turnsOfYou.uniforms.name'),
            },
            value: "uniforms",
        },
    ];
};