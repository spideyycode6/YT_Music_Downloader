export const YOUTUBE_URL_REGEX = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]{11}/

export function isValidYouTubeUrl(url) {
  return YOUTUBE_URL_REGEX.test((url || '').trim())
}
