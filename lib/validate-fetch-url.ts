export const isPrivateUrl = (url: string): boolean => {
    try {
        const hostname = new URL(url).hostname;
        if(
            hostname === "localhost" ||
            /^127\./.test(hostname) ||
            /^169\.254\./.test(hostname) ||
            /^10\./.test(hostname) ||
            /^192\.168\./.test(hostname) ||
            /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname) ||
            hostname === "::1" ||
            hostname === "0.0.0.0"
        ){
            return true;
        }
        return false;
    } catch {
        return true; 
    }
}