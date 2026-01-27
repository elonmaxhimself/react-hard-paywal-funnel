import { useTranslation } from "react-i18next";

export const useTurnsOffInDating = () => {
    const { t } = useTranslation();
    
    return [
        { 
            id: 1, 
            label: t('hooks.turnsOffInDating.ghosting'), 
            value: "ghosting" 
        },
        { 
            id: 2, 
            label: t('hooks.turnsOffInDating.rejection'), 
            value: "rejection" 
        },
        { 
            id: 3, 
            label: t('hooks.turnsOffInDating.cheating'), 
            value: "cheating" 
        },
        { 
            id: 4, 
            label: t('hooks.turnsOffInDating.expectationsMismatch'), 
            value: "expectations-mismatch" 
        },
        { 
            id: 5, 
            label: t('hooks.turnsOffInDating.somethingElse'), 
            value: "something-else" 
        },
    ];
};