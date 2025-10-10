import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import PageNotFound from "@/components/ui/page-not-found";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    navigate("/");
  };

  return (
    <PageNotFound onGoBack={handleGoBack} onGoHome={handleGoHome} />
  );
};

export default NotFound;
