/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['lh3.googleusercontent.com', 'avatars.githubusercontent.com', 'images.unsplash.com', 'picsum.photos'],
  },
  // No root redirect — / now serves the landing page
  // /dashboard is protected by ProtectedRoute and redirects to /auth/login if not authenticated
};

module.exports = nextConfig;
