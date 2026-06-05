export function safeImageUrl(url) {
  if (!url) return ''
  try {
    const { hostname } = new URL(url)
    const allowed = ['ik.imagekit.io', 'i.ytimg.com']
    return allowed.includes(hostname) ? url : ''
  } catch {
    return ''
  }
}

export function safeDownloadUrl(url) {
  if (!url) return null
  try {
    const parsed = new URL(url)
    if (parsed.protocol === 'https:' && parsed.hostname === 'ik.imagekit.io') {
      return url
    }
    return null
  } catch {
    return null
  }
}
