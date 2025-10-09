import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

export const TopSearchBar = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border"
    >
      <div className="container mx-auto px-4 md:px-8 py-3">
        <div className="max-w-2xl mx-auto md:ml-[70px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search creators by name, craft, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-card border-border focus:border-primary focus:ring-primary rounded-xl"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};
