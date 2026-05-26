import { promises as dns } from 'dns';

export const isPrivateUrl = async (url: string): Promise<boolean> => {
    try {
        const hostname = new URL(url).hostname;

        if (
            hostname === "localhost" ||
            hostname === "::1" ||
            hostname === "0.0.0.0"
        ) {
            return true;
        }

        const { address } = await dns.lookup(hostname);

        if (
            /^127\./.test(address) ||
            /^169\.254\./.test(address) ||
            /^10\./.test(address) ||
            /^192\.168\./.test(address) ||
            /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(address) ||
            address === "::1" ||
            address === "0.0.0.0"
        ) {
            return true;
        }

        return false;
    } catch {
        return true;
    }
};