import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { api } from "../api/axios";

const PAGE_SIZE = 10;

export function useVaccinationsPage(studentId, page) {
	return useQuery(
		["vaccinations", studentId, page],
		async () => {
			const { data } = await api.get(`/students/${studentId}/vaccinations`, {
				params: { page, size: PAGE_SIZE },
			});
			return data;
		},
		{
			placeholderData: keepPreviousData,
			staleTime: 60 * 1000,
		}
	);
}
