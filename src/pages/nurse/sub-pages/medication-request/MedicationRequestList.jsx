import { MedicationRequestCard } from "./MedicationRequestCard.jsx";

export default function MedicationRequestList({ data }) {
    return (
        <div className="flex flex-col gap-4 px-[100px] pb-20">
            {data && data.length > 0 ? (
                data.map((request) => (
                    <MedicationRequestCard key={request.requestId} data={request} />
                ))
            ) : (
                <div className="text-center py-10 bg-[#DAEAF7] font-semibold mt-24">
                    Không có đơn thuốc nào
                </div>
            )}
        </div>
    );
}
