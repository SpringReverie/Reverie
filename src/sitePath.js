// Vite supplies '/' locally and the repository subdirectory on GitHub Pages.
export const sitePath = path => `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`;
