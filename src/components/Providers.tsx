import { QueryProvider } from "@/components/QueryProvider";

interface IProvidersProps {
    children: React.ReactNode;
}

const Providers = ({ children }: IProvidersProps) => {
    return (
            <QueryProvider>{children}</QueryProvider>
    );
};

export default Providers;
