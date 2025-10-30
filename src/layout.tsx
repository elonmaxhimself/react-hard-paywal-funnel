// src/layouts/RootLayout.tsx
import { Toaster } from 'sonner'
import MainContentWrapper from '@/components/layout/MainContentWrapper'
import Providers from '@/components/Providers'

interface RootLayoutProps {
    children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
    return (
        <Providers>
            <div className="min-h-dvh w-full flex flex-col">
                <MainContentWrapper>
                    {children}
                </MainContentWrapper>
                
                <Toaster richColors position="bottom-right" />
            </div>
        </Providers>
    )
}