const DetailBox = ({ title, icon, number, subText, width, height, gap, titleSize, bgColor, textColor }) => {
	const backgroundClass = bgColor || "bg-[#DAEAF7]";
	
	const isGradientOrDark = bgColor && (bgColor.includes('gradient') || bgColor.includes('teal-500') || bgColor.includes('teal-600'));
	const defaultTextColor = isGradientOrDark ? 'text-white' : 'text-black';
	const finalTextColor = textColor || defaultTextColor;
	
	return (
		<div className={`flex flex-col ${backgroundClass} py-5 px-9 rounded-lg min-w-72`} style={{ width: width, height: height, gap: gap }}>
			<span className="flex items-center justify-between">
				<p className={`font-bold text-lg ${finalTextColor}`} style={{ fontSize: titleSize }}>{title}</p>
				<span className={finalTextColor}>{icon}</span>
			</span>
			<p className={`font-bold text-2xl mt-2 ${finalTextColor}`}>{number}</p>
			{subText && <p className={`text-[13px] italic mt-1 ${isGradientOrDark ? 'text-white' : 'text-gray-500'}`}>{subText}</p>}
		</div>
	);
};

export default DetailBox;
