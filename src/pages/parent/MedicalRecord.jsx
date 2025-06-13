const MedicalRecord = () => {
	const rowBlue =
		"flex justify-between flex-col md:flex-row bg-[#DAEAF7] px-6 py-3 rounded-xl";
	const rowWhite = "flex justify-between flex-col md:flex-row px-6 py-3";
	const header = "font-bold mb-4 text-2xl mb-6";
	return (
		<div className="flex justify-between gap-4 md:gap-30 md:flex-row flex-col">
			<div className="md:w-1/2">
				<div className="mb-6">
					<h1 className={header}>Thông tin sức khoẻ cơ bản</h1>
					<div className={rowBlue}>
						<p className="w-fit font-bold">Chiều cao</p>
						<p className="w-fit"></p>
					</div>
					<div className={rowWhite}>
						<p className="w-fit font-bold">Cân nặng</p>
						<p className="w-fit"></p>
					</div>
					<div className={rowBlue}>
						<p className="w-fit font-bold">Nhóm máu</p>
						<p className="w-fit"></p>
					</div>
					<div className={rowWhite}>
						<p className="w-fit font-bold">Giá trị huyết áp</p>
						<p className="w-fit"></p>
					</div>
					<div className={rowBlue}>
						<p className="w-fit font-bold">Chỉ số BMI</p>
						<p className="w-fit"></p>
					</div>
				</div>
				<div className="mb-6">
					<h1 className={header}>Thị lực</h1>
					<div className={rowBlue}>
						<p className="w-fit font-bold">Mắt trái</p>
						<p className="w-fit"></p>
					</div>
					<div className={rowWhite}>
						<p className="w-fit font-bold">Mắt phải</p>
						<p className="w-fit"></p>
					</div>
				</div>
				<div className="mb-6">
					<h1 className={header}>Tai mũi họng</h1>
					<div className={rowBlue}>
						<p className="w-fit font-bold">Tai</p>
						<p className="w-fit"></p>
					</div>
					<div className={rowWhite}>
						<p className="w-fit font-bold">Mũi</p>
						<p className="w-fit"></p>
					</div>
					<div className={rowBlue}>
						<p className="w-fit font-bold">Họng</p>
						<p className="w-fit"></p>
					</div>
				</div>
			</div>
			<form className="md:w-1/2">
				<h1 className={header}>Thông tin chung</h1>
				<div>
					<div>
						<p>Tiểu sử gia đình học sinh</p>
						<p>
							Có ai trong gia đình (ông, bà, bố, mẹ
							hoặc anh chị em ruột) mắc một trong các bệnh: Truyền nhiễm, tim
							mạch, đái tháo đường, lao, hen phế quản, ung thư, động kinh, rối
							loạn tâm thần, bệnh khác.
						</p>
                        <div>
                                <input type="button" />
                        </div>
					</div>
				</div>
			</form>
		</div>
	);
};

export default MedicalRecord;
