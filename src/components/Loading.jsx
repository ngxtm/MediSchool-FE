import { Cardio } from "ldrs/react";
import "ldrs/react/Cardio.css";

const Loading = ({ bgColor }) => {
	return (
		<div className="flex justify-center items-start h-screen mt-40">
			<Cardio size="100" stroke="4" speed="2" color={`${bgColor}`} />
		</div>
	);
};

export default Loading;
