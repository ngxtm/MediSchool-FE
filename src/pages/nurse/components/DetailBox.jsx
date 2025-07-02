const DetailBox = ({ title, icon, number, subText, width, height, gap, titleSize }) => {
	return (
		<div className={`flex flex-col bg-[#E8F4FB] py-5 px-9 rounded-lg min-w-72`} style={{ width: width, height: height, gap: gap }}>
			<span className="flex items-center justify-between">
				<p className="font-bold text-lg" style={{ fontSize: titleSize }}>{title}</p>
				{icon}
			</span>
			<p className="font-bold text-2xl mt-2">{number}</p>
			{subText && <p className="text-gray-500 text-[13px] italic mt-1">{subText}</p>}
		</div>
	);
};

export default DetailBox;
