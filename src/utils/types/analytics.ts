export interface UTMProps {
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_term?: string;
    utm_content?: string;
    deal?: string;
    [key: string]: string | undefined;
}
