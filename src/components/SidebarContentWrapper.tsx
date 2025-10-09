import { motion } from "framer-motion";
import { useSidebar } from "@/components/ui/sidebar-aceternity";
import { useEffect, useState } from "react";

export const SidebarContentWrapper = ({ children }: { children: React.ReactNode }) => {
  const { open } = useSidebar();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  return (
    <motion.div
      className="flex-1 overflow-auto flex flex-col items-center"
      animate={{
        marginLeft: isMobile ? "0" : (open ? "300px" : "70px"),
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
      }}
    >
      {children}
    </motion.div>
  );
};
