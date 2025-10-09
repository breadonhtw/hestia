/**
 * Sanitizes a URL to prevent javascript: and data: URI attacks
 */
export function sanitizeUrl(url: string | null | undefined): string {
  if (!url) return '#';
  
  const trimmed = url.trim();
  
  // Block dangerous protocols
  const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:'];
  const lowerUrl = trimmed.toLowerCase();
  
  for (const protocol of dangerousProtocols) {
    if (lowerUrl.startsWith(protocol)) {
      console.warn(`Blocked dangerous URL protocol: ${protocol}`);
      return '#';
    }
  }
  
  // Ensure http/https for external links
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    return `https://${trimmed}`;
  }
  
  return trimmed;
}

/**
 * Sanitizes email for mailto: links
 */
export function sanitizeEmail(email: string | null | undefined): string {
  if (!email) return '';
  
  // Remove any query parameters or special characters that could inject
  const cleaned = email.split('?')[0].split('&')[0].trim();
  
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleaned)) {
    console.warn(`Invalid email format: ${email}`);
    return '';
  }
  
  return encodeURIComponent(cleaned);
}

/**
 * Sanitizes Instagram handle
 */
export function sanitizeInstagramHandle(handle: string | null | undefined): string {
  if (!handle) return '';
  
  // Remove @ if present and sanitize
  const cleaned = handle.replace('@', '').trim();
  
  // Only allow alphanumeric, dots, and underscores
  if (!/^[A-Za-z0-9._]+$/.test(cleaned)) {
    console.warn(`Invalid Instagram handle: ${handle}`);
    return '';
  }
  
  return cleaned;
}
