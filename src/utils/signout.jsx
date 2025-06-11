import { useNavigate } from "react-router-dom";
import { UserAuth } from "../context/AuthContext"

const useSignOut = () => {
    const { signOut } = UserAuth();
    const navigate = useNavigate();
    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    }
    return handleSignOut;
}

export default useSignOut;
