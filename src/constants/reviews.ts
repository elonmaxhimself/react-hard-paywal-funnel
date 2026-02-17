import { useTranslation } from "react-i18next";

export const useReviews = () => {
  const { t } = useTranslation();
  
  return [
    {
      id: 1,
      description: t('constants.reviews.review1.description'),
      avatar: "/images/avatars/avatar_10.webp",
      alt: t('constants.reviews.review1.alt'),
      name: "Taylor M.",
      rating: 5,
      message: t('constants.reviews.review1.message'),
    },
    {
      id: 2,
      description: t('constants.reviews.review2.description'),
      avatar: "/images/avatars/avatar_3.webp",
      alt: t('constants.reviews.review2.alt'),
      name: "Jis_076",
      rating: 5,
      message: t('constants.reviews.review2.message'),
    },
    {
      id: 3,
      description: "",
      avatar: "/images/avatars/avatar_1.webp",
      alt: t('constants.reviews.review3.alt'),
      name: "Jordan A.",
      rating: 5,
      message: t('constants.reviews.review3.message'),
    },
    {
      id: 4,
      description: "",
      avatar: "/images/avatars/avatar_4.webp",
      alt: t('constants.reviews.review4.alt'),
      name: "Niko J.",
      rating: 5,
      message: t('constants.reviews.review4.message'),
    },
    {
      id: 5,
      description: "",
      avatar: "/images/avatars/avatar_5.webp",
      alt: t('constants.reviews.review5.alt'),
      name: "Alex M.",
      rating: 5,
      message: t('constants.reviews.review5.message'),
    },
    {
      id: 6,
      description: "",
      avatar: "/images/avatars/avatar_2.webp",
      alt: t('constants.reviews.review6.alt'),
      name: "Sasha W.",
      rating: 5,
      message: t('constants.reviews.review6.message'),
    },
    {
      id: 7,
      description: "",
      avatar: "/images/avatars/avatar_7.webp",
      alt: t('constants.reviews.review7.alt'),
      name: "Neo_99",
      rating: 5,
      message: t('constants.reviews.review7.message'),
    },
    {
      id: 8,
      description: "",
      avatar: "/images/avatars/avatar_8.webp",
      alt: t('constants.reviews.review8.alt'),
      name: "Cam L.",
      rating: 5,
      message: t('constants.reviews.review8.message'),
    },
  ];
};