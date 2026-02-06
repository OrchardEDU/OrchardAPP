// Server-side auth check for dashboard routes
// This is a placeholder - actual implementation will depend on your server setup
// For now, we'll let the API handle auth checks on each request
export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	// Server-side auth check would go here
	// For now, we rely on API route protection
	// If not authenticated, API will return 401 and client will redirect
	
	return <>{children}</>;
}
