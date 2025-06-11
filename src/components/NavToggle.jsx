import { ToggleGroup } from "radix-ui";
import { useLocation, useNavigate } from "react-router-dom";
const NavToggle = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const currentTab = location.pathname.split("/").pop();
    const handleValueChange = (value) => {
        if (value && value !== currentTab) {
            navigate(`/parent/${value}`);
        }
    }
    return (
        <div>
            <ToggleGroup.Root
                className="inline-flex rounded-md bg-gray-200 w-full justify-between"
                type="single"
                value={currentTab}
                onValueChange={handleValueChange}
                aria-label="Chức năng của phụ huynh"
            >
                <ToggleGroup.Item className="flex-1 text-center hover:bg-[#023E73] py-2 rounded-md hover:text-white hover:font-bold" value="info" aria-label="Thông tin cá nhân">Thông tin cá nhân</ToggleGroup.Item>
                <ToggleGroup.Item className="flex-1 text-center hover:bg-[#023E73] py-2 rounded-md hover:text-white hover:font-bold" value="medical-record" aria-label="Hồ sơ y tế">Hồ sơ y tế</ToggleGroup.Item>
                <ToggleGroup.Item className="flex-1 text-center hover:bg-[#023E73] py-2 rounded-md hover:text-white hover:font-bold" value="vacinnation" aria-label="Tiêm chủng">Tiêm chủng</ToggleGroup.Item>
                <ToggleGroup.Item className="flex-1 text-center hover:bg-[#023E73] py-2 rounded-md hover:text-white hover:font-bold" value="health-check" aria-label="Khám sức khoẻ">Khám sức khoẻ</ToggleGroup.Item>
                <ToggleGroup.Item className="flex-1 text-center hover:bg-[#023E73] py-2 rounded-md hover:text-white hover:font-bold" value="prescription" aria-label="Dặn thuốc">Dặn thuốc</ToggleGroup.Item>
            </ToggleGroup.Root>
        </div>
    );
};

export default NavToggle;
