import { useNavigate } from "react-router-dom";
import { useBlockCheck } from "../../hooks/useBlockCheck";
import BlockedUserModal from "./BlockUserModel";
import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { userLogout } from "../../redux/Slices/userSlice";

const BlockedUserWrapper = ({ children }) => {
    const { isBlocked, handleLogout } = useBlockCheck();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleReturn = useCallback(async () => {
        try {
            dispatch(userLogout());
            await handleLogout();
            navigate('/user/login', { replace: true });
        } catch (error) {
            console.error('Error during logout:', error);
            navigate('/user/login', { replace: true });
        }
    }, [dispatch, handleLogout, navigate]);

    if (isBlocked) {
        return <BlockedUserModal onReturn={handleReturn} />;
    }

    return children;
};

export default BlockedUserWrapper;