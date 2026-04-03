import { useContext } from "react";
import { Navigate } from "react-router-dom";
import CurrentUserContext from "../../contexts/CurrentUserContext";

function ProtectedRoute({ children }) {
  const { isLoggedIn, isCheckingAuth } = useContext(CurrentUserContext);

  // Wait for auth check to complete before redirecting
  if (isCheckingAuth) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
          fontSize: "18px",
          color: "#666",
        }}
      >
        Loading...
      </div>
    );
  }

  return isLoggedIn ? children : <Navigate to="/" replace />;
}

export default ProtectedRoute;
