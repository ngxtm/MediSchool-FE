const DetailBox = ({ title, icon, number, subText }) => {
	return (
		<div className="bg-[#E8F4FB] py-5 px-9 rounded-lg min-w-72">
			<span className="flex items-center justify-between">
				<p className="font-bold text-lg">{title}</p>
				{icon}
			</span>
			<p className="font-bold text-2xl mt-2">{number}</p>
			<p className="text-gray-500 text-[13px] italic mt-1">{subText}</p>
		</div>
	);
};

export default DetailBox;
