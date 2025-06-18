export default function SkeletonList() {
	return (
		<div className="space-y-6 animate-pulse">
			{[...Array(3)].map((_, i) => (
				<div key={i} className="h-20 bg-gray-200 rounded" />
			))}
		</div>
	);
}
