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
        backdropFilter: isScrolled ? "blur(10px)" : "blur(16px)",
      }}
      className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border transition-all duration-300"
    >
      <motion.div 
        className="container mx-auto px-4 md:px-8"
        animate={{
          paddingTop: isScrolled ? "0.5rem" : "0.75rem",
          paddingBottom: isScrolled ? "0.5rem" : "0.75rem",
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
        }}
      >
        <motion.div 
          className="mx-auto md:ml-[70px]"
          animate={{
            maxWidth: isScrolled ? "600px" : "672px",
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
          }}
        >
          <div className="relative">
            <motion.div
              animate={{
                scale: isScrolled ? 0.9 : 1,
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
              }}
              className="cursor-pointer"
              onClick={handleSearch}
            >
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </motion.div>
            <Input
              type="search"
              placeholder="Search creators by name, craft, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-10 bg-card border-border focus:border-primary focus:ring-2 focus:ring-primary rounded-xl transition-all duration-300"
              style={{
                height: isScrolled ? "2.5rem" : "2.75rem",
              }}
            />
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};
