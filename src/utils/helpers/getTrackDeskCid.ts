/**
 * Gets the TrackDesk CID (Click ID) from the trakdesk_cid cookie.
 * The cookie value is a JSON string containing tenantId and cid.
 * @returns CID value or null if cookie is not found or invalid
 */
export function getTrackDeskCid(): string | null {
    if (typeof document === "undefined") return null;

    const cookies = document.cookie.split("; ");

    for (const cookie of cookies) {
        const [name, value] = cookie.split("=");
        // Note: cookie name is "trakdesk_cid" (with typo in "trakdesk")
        if (name === "trakdesk_cid") {
            try {
                const decodedValue = decodeURIComponent(value);
                const parsed = JSON.parse(decodedValue);
                return parsed?.cid || null;
            } catch {
                return null;
            }
        }
    }

    return null;
}
