import MedicationRequestCard from "./MedicationRequestCard";

const statusOrder = {
    PENDING: 1,
    APPROVED: 2,
    DONE: 3,
    REJECTED: 4,
};

export default function MedicationRequestList({ data, nurseId }) {
    const sortedData = [...data].sort(
        (a, b) => statusOrder[a.medicationStatus] - statusOrder[b.medicationStatus]
    );

    return (
        <div className="px-[120px] pb-20">
            {sortedData && sortedData.length > 0 ? (
                <div className="flex flex-col divide-y">
                    {sortedData.map((request, index) => (
                        <MedicationRequestCard key={request.requestId || index} data={request} nurseId={nurseId} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-10 bg-[#DAEAF7] font-semibold mt-24 rounded-lg">
                    Không có đơn thuốc nào
                </div>
            )}
        </div>
    );
}
