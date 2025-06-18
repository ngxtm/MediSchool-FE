import React, { useState } from "react";
import { useVaccinationsPage } from "../hooks/useVaccinationsPage";
import GroupCard from "./GroupCard";
import SkeletonList from "./SkeletonList";

export default function VaccinationList({ studentId }) {
	const [page, setPage] = useState(0);
	const { data, isFetching } = useVaccinationsPage(studentId, page);

	if (!data) return <SkeletonList />;

	return (
		<div className="space-y-4">
			{data.content.map((group) => (
				<GroupCard key={group.diseaseName} group={group} />
			))}

			<div className="flex justify-between">
				<button
					disabled={page === 0}
					onClick={() => setPage((p) => Math.max(p - 1, 0))}
				>
					Trang trước
				</button>

				<button disabled={data.last} onClick={() => setPage((p) => p + 1)}>
					Trang kế
				</button>
			</div>

			{isFetching && <SkeletonList />}
		</div>
	);
}
