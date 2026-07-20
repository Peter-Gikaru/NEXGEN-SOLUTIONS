export const getImageUrl = (url: string | undefined | null): string => {
  if (!url) {
    return '/favicon.png';
  }
  if (url.startsWith('http') || url.startsWith('data:')) {
    return url;
  }
  const apiUrl = import.meta.env.VITE_API_URL;
  if (!apiUrl) {
    throw new Error('VITE_API_URL must be configured to resolve image URLs.');
  }
  const baseUrl = apiUrl.replace(/\/api\/?$/, '/');
  let cleanUrl = url.trim();
  cleanUrl = cleanUrl.startsWith('/') ? cleanUrl.substring(1) : cleanUrl;
  const encodedUrl = cleanUrl.split('/').map(part => encodeURIComponent(part)).join('/');
  return `${baseUrl}${encodedUrl}`;
};
