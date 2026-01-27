import React from "react";
import { useTranslation, Trans } from "react-i18next";

export const useCheckboxes = () => {
  const { t } = useTranslation();
  
  return [
    {
      name: "isAdult" as const,
      id: "confirm-age",
      label: <>{t('constants.checkboxes.confirmAge')}</>,
    },
    {
      name: "acceptedTerms" as const,
      id: "agree-terms",
      label: (
        <Trans
          i18nKey="constants.checkboxes.agreeTerms"
          components={{
            termsLink: (
              <a
                href="https://valuable-wishbone-63d.notion.site/Terms-of-Service-2615e53c779980cb9a05ce9981c1f0fa"
                target="_blank"
                rel="noopener noreferrer"
                className="text-coral-red underline"
              />
            ),
            privacyLink: (
              <a
                href="https://valuable-wishbone-63d.notion.site/Privacy-Policy-2615e53c77998053a001e1b1fb53e650"
                target="_blank"
                rel="noopener noreferrer"
                className="text-coral-red underline"
              />
            ),
          }}
        />
      ),
    },
  ] as const;
};