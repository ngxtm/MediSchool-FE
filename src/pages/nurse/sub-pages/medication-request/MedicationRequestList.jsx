import MedicationRequestCard from "./MedicationRequestCard";

export default function MedicationRequestList({ data }) {
    return (
        <div className="px-[120px] pb-20">
            {data && data.length > 0 ? (
                <div className="flex flex-col divide-y">
                    {data.map((request) => (
                        <MedicationRequestCard key={request.requestId} data={request} />
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
