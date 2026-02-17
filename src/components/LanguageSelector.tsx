import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { languages } from '@/configs/languages';
import * as Flags from 'country-flag-icons/react/3x2';

const flagMap: { [key: string]: any } = {
    en: Flags.GB,
    cs: Flags.CZ,
    fr: Flags.FR,
    de: Flags.DE,
    el: Flags.GR,
    hu: Flags.HU,
    it: Flags.IT,
    pl: Flags.PL,
    pt: Flags.PT,
    es: Flags.ES,
};

export default function LanguageSelector() {
    const { i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const currentLangCode = i18n.language.split('-')[0];
    const currentLanguage = languages.find(lang => lang.code === currentLangCode) || languages[0];
    const CurrentFlag = flagMap[currentLanguage.code];

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLanguageChange = (code: string) => {
        i18n.changeLanguage(code);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-1.5 px-2 py-1.5 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/15 transition-all border border-white/20 cursor-pointer"
                aria-label="Select language"
            >
                {CurrentFlag && <CurrentFlag className="w-5 h-4 rounded shadow-sm" />}
                <svg
                    className={`w-3 h-3 text-white transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-14 bg-gray-900/95 backdrop-blur-sm rounded-xl shadow-2xl overflow-hidden z-50 border border-white/10">
                    {languages.map((lang) => {
                        const Flag = flagMap[lang.code];
                        return (
                            <button
                                key={lang.code}
                                onClick={() => handleLanguageChange(lang.code)}
                                className={`w-full p-1.5 hover:bg-white/10 transition-colors cursor-pointer ${
                                    currentLangCode === lang.code ? 'bg-white/5' : ''
                                }`}
                            >
                                {Flag && <Flag className="w-full h-6 rounded shadow-sm" />}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}