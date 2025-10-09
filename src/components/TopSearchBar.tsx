import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";

export const TopSearchBar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const navigate = useNavigate();

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > 50) {
      setIsScrolled(true);
    } else {
      setIsScrolled(false);
    }
  });

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <motion.div
      ref={ref}
      initial={{ y: -20, opacity: 0 }}
      animate={{ 
        y: 0, 
        opacity: 1,
        paddingTop: isScrolled ? "0.5rem" : "0.75rem",
        paddingBottom: isScrolled ? "0.5rem" : "0.75rem",
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
      }}
      className="fixed top-0 left-14 right-0 lg:left-0 z-50 transition-all duration-300"
    >
      <motion.div 
        className="max-w-3xl mx-auto md:ml-auto md:mr-auto px-4 md:px-8"
        animate={{
          maxWidth: isScrolled ? "600px" : "768px",
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
        }}
      >
        <div className="relative">
          <div
            className="absolute left-3 lg:left-4 top-1/2 -translate-y-1/2 cursor-pointer z-10"
            onClick={handleSearch}
          >
            <Search className="h-4 w-4 lg:h-5 lg:w-5 text-muted-foreground" />
          </div>
          <Input
            type="search"
            placeholder="Search creators..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-10 lg:pl-12 pr-3 lg:pr-4 text-sm lg:text-base bg-card border-border shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-full transition-all duration-300 h-9 lg:h-auto"
            style={{
              height: window.innerWidth >= 1024 ? (isScrolled ? "2.75rem" : "3.25rem") : "2.25rem",
            }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
};
