import { QueryProvider } from "@/components/QueryProvider";
import { ClientPosthogProvider } from "./PostHogProvider";

interface IProvidersProps {
    children: React.ReactNode;
}

const Providers = ({ children }: IProvidersProps) => {
    return (
        <ClientPosthogProvider>
            <QueryProvider>{children}</QueryProvider>
        </ClientPosthogProvider>
    );
};

export default Providers;
