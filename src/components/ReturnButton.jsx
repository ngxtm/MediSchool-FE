import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ReturnButton = ({ linkNavigate }) => {
	const navigate = useNavigate();
	return (
		<button
                onClick={() => navigate(linkNavigate)}
                className="group border border-[#023E73] text-[#023E73] px-8 py-1 rounded-3xl font-bold text-base flex items-center gap-4 hover:bg-[#023E73] hover:text-white transition-all duration-200"
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
