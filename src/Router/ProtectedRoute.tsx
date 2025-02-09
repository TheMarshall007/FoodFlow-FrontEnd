
import { Navigate, Outlet } from "react-router-dom";
import { useUser } from "../context/UserContext";

const ProtectedRoute: React.FC = () => {
    const { user } = useUser();

    if (!user || !user.roles.includes("ROLE_ADMIN")) {
        return <Navigate to="/home" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
