const normalizeYouTubeUrl = (inputUrl) => {
    try {
        const parsed = new URL(inputUrl.trim());

        if (parsed.hostname.includes('youtu.be')) {
            const videoId = parsed.pathname.replace('/', '');
            return `https://www.youtube.com/watch?v=${videoId}`;
        }

        if (parsed.hostname.includes('youtube.com')) {
            const videoId = parsed.searchParams.get('v');
            if (videoId) {
                return `https://www.youtube.com/watch?v=${videoId}`;
            }
        }

        return parsed.toString();
    } catch {
        return inputUrl;
    }
};

export default normalizeYouTubeUrl;
