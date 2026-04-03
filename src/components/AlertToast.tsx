/* eslint-disable react-refresh/only-export-components */
import { toast as sonnerToast } from 'sonner';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';

interface ToastProps {
    id: string | number;
    title: string;
    description?: string;
    type?: string;
    button?: {
        label: ReactNode;
        onClick: () => void;
    };
}

export enum toastType {
    default = 'default',
    success = 'success',
    warning = 'warning',
    error = 'error',
}

const SuccessIcon = () => (
    <svg
        className="w-5 h-5 shrink-0"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Success"
    >
        <circle cx="10" cy="10" r="10" fill="#16a34a" />
        <path
            d="M5.5 10.5L8.5 13.5L14.5 7"
            stroke="white"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

const ErrorIcon = () => (
    <svg
        className="w-5 h-5 shrink-0"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Error"
    >
        <circle cx="10" cy="10" r="10" fill="#e11d48" />
        <path d="M7 7L13 13M13 7L7 13" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
);

const WarningIcon = () => (
    <svg
        className="w-5 h-5 shrink-0"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Warning"
    >
        <circle cx="10" cy="10" r="10" fill="#a16207" />
        <path d="M10 6V11" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="10" cy="13.5" r="1" fill="white" />
    </svg>
);

const CloseIcon = () => (
    <svg
        className="w-4 h-4"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Close"
    >
        <path d="M3 3L13 13M13 3L3 13" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
);

export const triggerToast = (toast: Omit<ToastProps, 'id'>) => {
    return sonnerToast.custom((id) => (
        <Toast
            id={id}
            title={toast.title}
            type={toast.type}
            description={toast.description}
            button={{
                label: <CloseIcon />,
                onClick: () => {},
            }}
        />
    ));
};

const Toast = (props: ToastProps) => {
    const { title, description, button, type = toastType.default, id } = props;

    return (
        <div className="relative overflow-hidden flex rounded-xl bg-smooth-gray shadow-lg ring-1 ring-black/5 w-full md:max-h-[80px] h-[80px] md:max-w-[364px] items-center p-4">
            <div className="flex flex-1 items-center gap-x-3">
                {type === toastType.success && (
                    <>
                        <div
                            className="absolute -top-5 -left-5 w-[100px] h-[100px] rounded-full"
                            style={{ background: 'radial-gradient(circle, rgba(21,128,61,0.6) 0%, transparent 70%)' }}
                        />
                        <SuccessIcon />
                    </>
                )}
                {type === toastType.error && (
                    <>
                        <div
                            className="absolute -top-5 -left-5 w-[100px] h-[100px] rounded-full"
                            style={{ background: 'radial-gradient(circle, rgba(225,29,72,0.6) 0%, transparent 70%)' }}
                        />
                        <ErrorIcon />
                    </>
                )}
                {type === toastType.warning && (
                    <>
                        <div
                            className="absolute -top-5 -left-5 w-[100px] h-[100px] rounded-full"
                            style={{ background: 'radial-gradient(circle, rgba(161,98,7,0.6) 0%, transparent 70%)' }}
                        />
                        <WarningIcon />
                    </>
                )}
                <div className="w-full">
                    <p className="text-sm font-semibold text-white">{title}</p>
                    {description && <p className="mt-1 text-sm text-white">{description}</p>}
                </div>
            </div>
            <div className="ml-5 shrink-0">
                <Button
                    className="rounded-[6px] h-[30px] w-[30px] bg-transparent p-0 flex items-center justify-center hover:bg-zinc-600"
                    onClick={() => {
                        button?.onClick();
                        sonnerToast.dismiss(id);
                    }}
                >
                    {button?.label}
                </Button>
            </div>
        </div>
    );
};
