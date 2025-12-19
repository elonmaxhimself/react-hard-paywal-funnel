import { Toaster } from 'sonner'
import MainContentWrapper from '@/components/layout/MainContentWrapper'
import Providers from '@/providers/Providers'
import PostHogPageView from '@/components/PostHogPageView'

interface RootLayoutProps {
    children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
    return (
        <Providers>
            <PostHogPageView />
            <div className="min-h-dvh w-full flex flex-col">
                <MainContentWrapper>
                    {children}
                </MainContentWrapper>
                
                <Toaster richColors position="bottom-right" />
            </div>
        </Providers>
    )
}