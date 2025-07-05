import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ReturnButton = ({ linkNavigate, actor }) => {
	const navigate = useNavigate();
	const actorColor = actor === "manager" ? "bg-teal-600 hover:bg-white hover:text-teal-600 text-white" : "bg-[#023E73] text-white hover:bg-white hover:text-[#023E73]";
	return (
		<button
                onClick={() => navigate(linkNavigate)}
                className={`group border px-8 py-1 rounded-3xl font-bold text-base flex items-center gap-4 transition-all duration-200 ${actorColor}`}
            >
                <ArrowLeft
                    size={20}
                    className="transition-transform duration-200 group-hover:-translate-x-1"
                />
                Trở về
            </button>
	);
};

export default ReturnButton;
