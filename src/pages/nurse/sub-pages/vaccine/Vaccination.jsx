import { DatePicker, Input } from "antd";
import DetailBox from "../../components/DetailBox";
import {
	FileText,
	CircleAlert,
	CircleCheckBig,
	Calendar,
	Activity,
	ChevronRight,
	X,
	Search,
} from "lucide-react";
import { useQueries, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../../utils/api";
import { useEffect, useState } from "react";
import { Dialog } from "radix-ui";
import { Select } from "antd";
import { Zoom, toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { parseDate, formatDate } from "../../../../utils/dateparse";
import Loading from "../../../../components/Loading";

const DialogCreate = ({ open, onOpenChange, onCreateSuccess }) => {
	const [formData, setFormData] = useState({
		vaccineId: null,
		eventTitle: "",
		eventDate: null,
		eventScope: "",
		location: "",
		status: "PENDING",
		classes: [],
	});
	const [vaccines, setVaccines] = useState([]);
	const [classes, setClasses] = useState([]);

	const queryClient = useQueryClient();
	const toastErrorPopup = (message) => {
		toast.error(message, {
			position: "bottom-center",
			autoClose: 5000,
			hideProgressBar: false,
			closeOnClick: true,
			pauseOnHover: false,
			draggable: true,
			progress: undefined,
			theme: "light",
			transition: Zoom,
		});
	};

	const toastSuccessPopup = (message) => {
		toast.success(message, {
			position: "bottom-center",
			autoClose: 5000,
			hideProgressBar: false,
			closeOnClick: true,
			pauseOnHover: false,
			draggable: true,
			progress: undefined,
			theme: "light",
			transition: Zoom,
		});
	};

	useEffect(() => {
		let isMounted = true;
		let hasShownError = false;
		const fetchDataInPopup = async () => {
			try {
				const response = await api.get("/vaccines");
				if (isMounted) setVaccines(response.data);
			} catch (error) {
				console.error("Error fetching vaccines:", error);
				if (isMounted && !hasShownError) {
					toastErrorPopup("Error when fetching data: " + error.message);
					hasShownError = true;
				}
			}

			try {
				const response = await api.get("/classes");
				if (isMounted) setClasses(response.data);
			} catch (err) {
				console.error("Error when fetching classes: ", err);
				if (isMounted && !hasShownError) {
					toastErrorPopup("Error when fetching data: " + err.message);
					hasShownError = true;
				}
			}
		};

		fetchDataInPopup();

		return () => {
			isMounted = false;
		};
	}, []);

	const createEventMutation = useMutation({
		mutationFn: (newEvent) => api.post("/vaccine-events", newEvent),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["vaccine-events"] });
			if (onCreateSuccess) onCreateSuccess();
		},
	});

	const handleSubmit = () => {
		createEventMutation.mutate(formData);
		toastSuccessPopup("Tạo sự kiện tiêm chủng thành công!");
	};

	const handleInputChange = (field, value) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	return (
		<Dialog.Root open={open} onOpenChange={onOpenChange} className="font-inter">
			<Dialog.Trigger asChild>
				<button className="bg-[#023E73] text-white px-7 py-1.5 rounded-lg font-bold text-base transition-all duration-200 ease-in-out hover:bg-[#01294d] hover:scale-105 hover:shadow-lg active:scale-95">
					Tạo lịch tiêm chủng mới
				</button>
			</Dialog.Trigger>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 bg-black/60 data-[state=open]:animate-overlayShow" />
				<Dialog.Content className="fixed left-1/2 top-1/2 max-h-[90vh] w-[90vw] max-w-[630px] -translate-x-1/2 -translate-y-1/2 rounded-md bg-white py-12 px-24 shadow-lg focus:outline-none data-[state=open]:animate-contentShow">
					<Dialog.Title className="m-0 text-2xl font-bold text-[#023E73] text-center">
						Tạo lịch tiêm chủng mới
					</Dialog.Title>
					<Dialog.Description className="mb-5 mt-2.5 text-[15px] leading-normal text-gray-600 text-center">
						Điền thông tin để tạo lịch tiêm chủng mới cho học sinh
					</Dialog.Description>

					<div className="flex flex-col">
						<fieldset className="mb-[15px] flex items-center gap-5">
							<label
								className="w-[210px] text-[15px] font-semibold text-left"
								htmlFor="eventTitle"
							>
								Tên sự kiện
							</label>
							<input
								className="w-full h-[30px] rounded-sm px-3 text-[14px] border-gray-300 leading-none border  outline-none  focus:border-[#1676fb] focus:border-2 placeholder:text-[#bfbfbf]"
								id="eventTitle"
								value={formData.eventTitle}
								onChange={(e) =>
									handleInputChange("eventTitle", e.target.value)
								}
								placeholder="Ví dụ: Tiêm chủng, Viêm gan B,..."
							/>
						</fieldset>

						<fieldset className="mb-[15px] flex items-center gap-5">
							<label
								className="w-[210px] text-[15px] font-semibold text-left"
								htmlFor="vaccineId"
							>
								Loại Vaccine
							</label>
							<Select
								className="w-full custom-select"
								placeholder="Chọn loại vaccine"
								value={formData.vaccineId}
								onChange={(value) => handleInputChange("vaccineId", value)}
								options={vaccines.map((v) => ({
									value: v.vaccineId,
									label: v.name,
								}))}
								getPopupContainer={(trigger) => trigger.parentNode}
							/>
						</fieldset>

						<fieldset className="mb-[15px] flex items-center gap-5">
							<label
								className="w-[210px] text-[15px] font-semibold text-left"
								htmlFor="eventScope"
							>
								Phạm vi tiêm chủng
							</label>
							<Select
								className="w-full custom-select"
								placeholder="Chọn phạm vi tiêm chủng"
								onChange={(value) => handleInputChange("eventScope", value)}
								options={[
									{ value: "SCHOOL", label: "Học sinh toàn trường" },
									{ value: "CLASS", label: "Theo lớp" },
								]}
								getPopupContainer={(trigger) => trigger.parentNode}
							/>
						</fieldset>

						<fieldset className="mb-[15px] flex items-center gap-5">
							<label
								className="w-[210px] text-[15px] font-semibold text-left"
								htmlFor="eventDate"
							>
								Ngày bắt đầu
							</label>
							<DatePicker
								className="w-full custom-picker"
								format="DD/MM/YY"
								placeholder="Chọn ngày bắt đầu"
								onChange={(date) =>
									handleInputChange(
										"eventDate",
										date ? date.format("YYYY-MM-DD") : ""
									)
								}
							/>
						</fieldset>

						<fieldset className="mb-[15px] flex items-center gap-5">
							<label
								className="w-[210px] text-[15px] font-semibold text-left"
								htmlFor="eventDate"
							>
								Ngày kết thúc
							</label>
							<DatePicker
								className="w-full custom-picker"
								format="DD/MM/YY"
								placeholder="Chọn ngày kết thúc"
								onChange={(date) =>
									handleInputChange(
										"eventDate",
										date ? date.format("YYYY-MM-DD") : ""
									)
								}
							/>
						</fieldset>

						<fieldset className="mb-[15px] flex items-center gap-5">
							<label
								className="w-[210px] text-[15px] font-semibold text-left"
								htmlFor="eventScope"
							>
								Lớp
							</label>
							<Select
								mode="multiple"
								disabled={formData.eventScope === "SCHOOL"}
								className="w-full custom-select"
								placeholder="Chọn lớp"
								onChange={(value) => handleInputChange("classes", value)}
								options={classes.map((c) => ({
									value: c.name,
									label: c.name,
								}))}
								getPopupContainer={(trigger) => trigger.parentNode}
							/>
						</fieldset>

						<fieldset className="mb-[15px] flex items-center gap-5">
							<label
								className="w-[210px] text-[15px] font-semibold text-left"
								htmlFor="location"
							>
								Địa điểm
							</label>
							<input
								className="w-full h-[30px] rounded-sm px-3 text-[14px] border-gray-300 leading-none border  outline-none  focus:border-[#1676fb] focus:border-2 placeholder:text-[#bfbfbf]"
								id="location"
								value={formData.location}
								onChange={(e) => handleInputChange("location", e.target.value)}
								placeholder="Nhập địa điểm tiêm chủng"
							/>
						</fieldset>
					</div>

					<div className="mt-[25px] flex justify-end gap-3">
						<Dialog.Close asChild>
							<button className="inline-flex h-[35px] items-center justify-center rounded bg-gray-200 px-[15px] font-medium leading-none text-gray-800 outline-none hover:bg-gray-300">
								Hủy
							</button>
						</Dialog.Close>
						<Dialog.Close asChild>
							<button
								className="inline-flex h-[35px] items-center justify-center rounded bg-[#023E73] px-[15px] font-medium leading-none text-white outline-none hover:bg-[#01294d]"
								onClick={handleSubmit}
								disabled={createEventMutation.isPending}
							>
								{createEventMutation.isPending ? "Đang tạo..." : "Tạo lịch"}
							</button>
						</Dialog.Close>
					</div>

					<Dialog.Close asChild>
						<button
							className="absolute right-2.5 top-2.5 inline-flex h-[25px] w-[25px] appearance-none items-center justify-center rounded-full text-gray-500 hover:bg-gray-200 focus:outline-none"
							aria-label="Close"
						>
							<X size={18} />
						</button>
					</Dialog.Close>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
};

const Vaccination = () => {
	const navigate = useNavigate();
	const [search, setSearch] = useState("");
	const [selectedYear, setSelectedYear] = useState(null);
	const queryClient = useQueryClient();
	const [isDialogOpen, setIsDialogOpen] = useState(false);

	useEffect(() => {
		if (selectedYear) {
			console.log(selectedYear);
		}
	}, [selectedYear]);

	const onChange = (date, dateString) => {
		setSelectedYear(dateString);
	};

	const handleCreateSuccess = () => {
		queryClient.invalidateQueries({ queryKey: ["vaccine-events"] });
		setIsDialogOpen(false);
	};

	const results = useQueries({
		queries: [
			{
				queryKey: ["vaccine-consent-total"],
				queryFn: async () => {
					const response = await api.get("/vaccine-consents");
					return response.data;
				},
			},
			{
				queryKey: ["vaccine-events", selectedYear],
				queryFn: async () => {
					const url = selectedYear
						? `/vaccine-events/year/${selectedYear}`
						: "/vaccine-events";
					const response = await api.get(url);
					const eventsWithStats = await Promise.all(
						response.data.map(async (event) => {
							try {
								const statsResponse = await api.get(
									`/vaccine-consents/event/${event.id}/results`
								);
								return { ...event, consentStats: statsResponse.data };
							} catch {
								return { ...event, consentStats: null };
							}
						})
					);

					return eventsWithStats;
				},
				enabled: true,
			},
			{
				queryKey: ["upcoming-vaccine-events"],
				queryFn: async () => {
					const response = await api.get("/vaccine-events/upcoming");
					return response.data;
				},
			},
		],
	});

	const isLoading = results.some((result) => result.isLoading);
	const isError = results.some((result) => result.isError);

	if (isLoading) {
		return <Loading />;
	}

	if (isError) {
		return <div>Error loading data</div>;
	}

	const [consentTotal, vaccineEvents, upcomingEvents] = results.map(
		(result) => result.data
	);
	const sortedEvents = [...(vaccineEvents || [])]
		.filter((event) =>
			(event.eventTitle ?? "").toLowerCase().includes(search.toLowerCase())
		)
		.sort((a, b) => parseDate(b.createdAt) - parseDate(a.createdAt));

	const getStatusDisplay = (status, date) => {
		if (!status) return { text: "Lỗi trạng thái", bgColor: "bg-[#DAEAF7]" };

		switch (status.toUpperCase()) {
			case "APPROVED":
				if (date === new Date().toLocaleDateString()) {
					return { text: "Đang diễn ra", bgColor: "bg-[#DAEAF7]" };
				}
				return { text: "Đã duyệt", bgColor: "bg-[#DAEAF7]" };
			case "PENDING":
				return { text: "Chờ duyệt", bgColor: "bg-[#DAEAF7]" };
			case "CANCELLED":
				return { text: "Đã hủy", bgColor: "bg-[#FFCCCC]" };
			case "COMPLETED":
				return { text: "Hoàn thành", bgColor: "bg-[#D1FAE5]" };
			default:
				return { text: "Trạng thái lạ", bgColor: "bg-[#DAEAF7]" };
		}
	};

	return (
		<div className="font-inter">
			<div className="flex max-w-full justify-between mb-16">
				<DetailBox
					title="Đã gửi"
					icon={<FileText size={28} />}
					number={consentTotal.totalConsents}
				/>
				<DetailBox
					title="Đã phản hồi"
					icon={<CircleCheckBig size={28} />}
					number={consentTotal.respondedConsents}
				/>
				<DetailBox
					title="Chưa phản hồi"
					icon={<CircleAlert size={28} />}
					number={consentTotal.pendingConsents}
				/>
				<DetailBox
					title="Sự kiện sắp tới"
					icon={<Calendar size={28} />}
					number={upcomingEvents.length}
				/>
			</div>
			<div className="flex px-[100px] justify-between">
				<div className="flex items-center max-w-fit gap-8">
					<p className="font-bold text-xl">Năm học</p>
					<DatePicker
						placeholder="Chọn năm học"
						onChange={onChange}
						picker="year"
						size="large"
					/>
					<Input
						prefix={<Search size={16} className="text-gray-400 mr-4" />}
						placeholder="Tìm kiếm chiến dịch tiêm chủng"
						style={{ width: 300 }}
						className="h-[38px] rounded-[8px] !border-[#d9d9d9]"
						allowClear
						value={search}
						onChange={(e) => setSearch(e.target.value)}
					/>
				</div>
				<div className="flex gap-10">
					<button
						className="bg-[#023E73] text-white px-7 py-1.5 rounded-lg font-bold text-base transition-all duration-200 ease-in-out hover:bg-[#01294d] hover:scale-105 hover:shadow-lg active:scale-95"
						onClick={() => navigate("vaccine-list")}
					>
						Xem danh sách Vaccine
					</button>
					<DialogCreate
						onCreateSuccess={handleCreateSuccess}
						open={isDialogOpen}
						onOpenChange={setIsDialogOpen}
					/>
				</div>
			</div>
			<div className="flex flex-col justify-center space-y-4 mt-8">
				{vaccineEvents && vaccineEvents.length > 0 ? (
					sortedEvents.map((event) => {
						const { text: statusText, bgColor } = getStatusDisplay(
							event.status,
							event.event_date
						);

						const totalConsents = event.consentStats?.totalConsents || 0;
						const respondedConsents =
							event.consentStats?.respondedConsents || 0;

						return (
							<Link to={`vaccine-event/${event.id}`}>
								<div
									key={event.id}
									className="flex w-full justify-between max-w-[80rem] mx-auto border-gray-300 border-b-1 border-t-1 p-6 transition-colors hover:bg-gray-50 cursor-pointer group"
								>
									<div className="flex justify-center gap-10 items-center">
										<Activity size={50} />
										<div className="flex flex-col gap-2">
											<p className="font-bold text-xl">
												{event.eventTitle ||
													event.vaccine?.name ||
													"Không có tên"}
											</p>
											<p>
												Đối tượng tiêm chủng:{" "}
												{event.eventScope === "SCHOOL"
													? "Học sinh toàn trường"
													: "Theo lớp"}
											</p>
											<p className="italic text-gray-500 text-sm">
												Ngày tạo: {formatDate(event.createdAt)}
											</p>
										</div>
									</div>
									<div className="flex items-center gap-10">
										<div className="flex flex-col gap-2 min-w-[200px] items-center">
											{statusText === "Đã hủy" ? (
												<>
													<p
														className={`text-center ${bgColor} font-bold px-9 py-1 w-fit rounded-4xl`}
													>
														{statusText}
													</p>
												</>
											) : (
												<>
													<p
														className={`text-center ${bgColor} font-bold px-9 py-1 w-fit rounded-4xl`}
													>
														{statusText}
													</p>
													<p className="italic">
														Phản hồi: {respondedConsents ?? "NA"}/
														{totalConsents ?? "NA"} học sinh
													</p>
												</>
											)}
										</div>
										<button>
											<ChevronRight
												size={30}
												className="transition-transform duration-200 group-hover:translate-x-1 group-hover:scale-110 text-[#023E73]"
											/>
										</button>
									</div>
								</div>
							</Link>
						);
					})
				) : (
					<div className="text-center py-10 bg-[#DAEAF7] flex items-center justify-center mt-24 font-semibold">
						Không có sự kiện tiêm chủng nào
					</div>
				)}
			</div>
		</div>
	);
};

export default Vaccination;
