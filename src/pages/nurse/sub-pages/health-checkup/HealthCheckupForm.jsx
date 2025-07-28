import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { ArrowLeft } from 'lucide-react'
import api from '../../../../utils/api.js'

export default function HealthCheckupForm() {
  const navigate = useNavigate()

  const [eventTitle, setEventTitle] = useState('')
  const now = new Date();
  const currentYear = now.getFullYear();
  const schoolYearOptions = [
    `${currentYear - 1}-${currentYear}`,
    `${currentYear}-${currentYear + 1}`,
    `${currentYear + 1}-${currentYear + 2}`
  ];
  const [schoolYear, setSchoolYear] = useState(`${currentYear}-${currentYear + 1}`);

  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const [categories, setCategories] = useState([])
  const [selectedCategories, setSelectedCategories] = useState([])


  useEffect(() => {
    api
        .get('/checkup-categories')
        .then(res => setCategories(res.data))
        .catch(() => toast.error('Không thể tải danh sách hạng mục khám'))
  }, [])

  const toggleCategory = id => {
    setSelectedCategories(prev => (prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]))
  }

  const selectAllCategories = () => {
    if (selectedCategories.length === categories.length) {
      setSelectedCategories([])
    } else {
      setSelectedCategories(categories.map(c => c.id))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!eventTitle || !startDate || !endDate || selectedCategories.length === 0) {
      toast.error("Vui lòng điền đầy đủ thông tin và chọn ít nhất 1 hạng mục.");
      return;
    }

    const today = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Kiểm tra ngày bắt đầu phải sau hôm nay ít nhất 7 ngày
    const minStart = new Date();
    minStart.setDate(today.getDate() + 7);
    if (start < minStart) {
      toast.error("Ngày bắt đầu phải sau ngày hôm nay ít nhất 7 ngày.");
      return;
    }

    // Kiểm tra ngày kết thúc phải sau ngày bắt đầu
    if (end <= start) {
      toast.error("Ngày kết thúc phải sau ngày bắt đầu.");
      return;
    }

    const payload = {
      eventTitle,
      schoolYear,
      startDate,
      endDate,
      categoryIds: selectedCategories
    };

    try {
      await api.post("/health-checkup/create", payload);
      toast.success("Tạo sự kiện thành công!");
      navigate("/manager/health-checkup");
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi tạo sự kiện.");
    }
  };

  return (
      <div className="font-inter mx-auto max-w-4xl px-6 py-10">
        <button
            onClick={() => navigate(-1)}
            className="group border px-8 py-1 rounded-3xl font-bold text-base flex items-center gap-4 transition-all duration-200 bg-[#023E73] text-white"
        >
          <ArrowLeft size={20} className="transition-transform group-hover:-translate-x-1" />
          Trở về
        </button>

        <h1 className="mb-8 text-center text-3xl font-bold">THÔNG TIN SỰ KIỆN KHÁM SỨC KHỎE</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="mb-2 block text-lg font-semibold">Tên sự kiện</label>
            <input
                type="text"
                value={eventTitle}
                onChange={e => setEventTitle(e.target.value)}
                className="w-full rounded border px-4 py-2"
                placeholder="VD: Khám sức khỏe đầu năm học"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-lg font-semibold">Năm học</label>
              <select
                  value={schoolYear}
                  onChange={(e) => setSchoolYear(e.target.value)}
                  className="w-full rounded border px-4 py-2"
              >
                {schoolYearOptions.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                ))}
              </select>

            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-lg font-semibold">Ngày bắt đầu</label>
              <input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="w-full rounded border px-4 py-2"
              />
            </div>
            <div>
              <label className="mb-2 block text-lg font-semibold">Ngày kết thúc</label>
              <input
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="w-full rounded border px-4 py-2"
              />
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-lg font-semibold">Hạng mục khám</label>
              <button type="button" onClick={selectAllCategories} className="text-sm text-[#023E73] hover:underline">
                {selectedCategories.length === categories.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {categories.map(c => (
                  <label key={c.id} className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={selectedCategories.includes(c.id)}
                        onChange={() => toggleCategory(c.id)}
                    />
                    {c.name}
                  </label>
              ))}
            </div>
          </div>

          <div className="flex justify-center pt-6">
            <button
                type="submit"
                className="rounded-xl bg-[#023E73] text-white font-semibold px-5 py-3 text-m rounded-lg hover:bg-[#034a8a]"
            >
              Xác nhận
            </button>
          </div>
        </form>
      </div>
  )
}