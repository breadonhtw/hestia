import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import hestiaLogo from "@/assets/hestia-logo.png";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <img
            src={hestiaLogo}
            alt="Hestia"
            className="h-20 mx-auto mb-8 opacity-50"
          />
          <h1 className="font-serif text-6xl font-bold text-foreground mb-4">404</h1>
          <p className="text-2xl text-muted-foreground mb-8">Lost your way home?</p>
          <p className="text-muted-foreground mb-8">
            This page seems to have wandered off. Let's get you back to the hearth.
          </p>
          <Link to="/">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
              Return to Home
            </Button>
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default NotFound;
