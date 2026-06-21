/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	// Temporarily disable all security headers for debugging
	// async headers() {
	// 	const csp = [
	// 		"default-src 'self'",
	// 		"script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com https://unpkg.com https://cdnjs.cloudflare.com",
	// 		"style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com",
	// 		"img-src 'self' data: https:",
	// 		"font-src 'self' https://cdnjs.cloudflare.com",
	// 		"connect-src 'self' https:",
	// 		"frame-ancestors 'self'",
	// 		"base-uri 'self'",
	// 		"form-action 'self' https://formsubmit.co",
	// 		"object-src 'none'",
	// 		"frame-src 'self'",
	// 		"upgrade-insecure-requests"
	// 	].join('; ');

	// 	const securityHeaders = [
	// 		{ key: 'Content-Security-Policy', value: csp },
	// 		{ key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
	// 		{ key: 'X-Content-Type-Options', value: 'nosniff' },
	// 		{ key: 'X-Frame-Options', value: 'SAMEORIGIN' },
	// 		{ key: 'X-XSS-Protection', value: '0' },
	// 		{ key: 'Permissions-Policy', value: 'geolocation=(), microphone=(), camera=()' }
	// 	];
	// 	return [
	// 		{
	// 			source: '/(.*)',
	// 			headers: securityHeaders,
	// 		},
	// 	];
	// },
};
export default nextConfig;
