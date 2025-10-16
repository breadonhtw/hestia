"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { cn } from "@/lib/utils";

type FloatingActionMenuProps = {
  options: {
    label: string;
    onClick: () => void;
    Icon?: React.ReactNode;
  }[];
  className?: string;
  isFixed?: boolean;
};

const FloatingActionMenu = ({
  options,
  className,
  isFixed = false,
}: FloatingActionMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={cn("relative", className)}>
      {isFixed ? (
        <button
          onClick={toggleMenu}
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-background/80 backdrop-blur-lg border border-border shadow-lg flex items-center justify-center hover:bg-primary/10 transition-all hover:scale-110 touch-manipulation"
          aria-label="User Menu"
        >
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{
              duration: 0.3,
              ease: "easeInOut",
              type: "spring",
              stiffness: 300,
              damping: 20,
            }}
          >
            <Settings className="w-5 h-5" />
          </motion.div>
        </button>
      ) : (
        <Button
          onClick={toggleMenu}
          variant="ghost"
          size="icon"
          className="rounded-full hover:bg-primary/10 w-10 h-10 sm:w-11 sm:h-11 touch-manipulation"
          aria-label="User Menu"
        >
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{
              duration: 0.3,
              ease: "easeInOut",
              type: "spring",
              stiffness: 300,
              damping: 20,
            }}
          >
            <Settings className="w-5 h-5" />
          </motion.div>
        </Button>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 10, y: 10, filter: "blur(10px)" }}
            animate={{ opacity: 1, x: 0, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, x: 10, y: 10, filter: "blur(10px)" }}
            transition={{
              duration: 0.6,
              type: "spring",
              stiffness: 300,
              damping: 20,
              delay: 0.1,
            }}
            className="absolute top-10 right-0 mt-2 z-[70] sm:top-10 sm:right-0"
          >
            <div className="flex flex-col items-end gap-2">
              {options.map((option, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{
                    duration: 0.3,
                    delay: index * 0.05,
                  }}
                >
                  <Button
                    onClick={option.onClick}
                    size="sm"
                    variant="outline"
                    className="flex items-center gap-2 bg-background/95 backdrop-blur-md border-border shadow-lg min-w-[140px] text-sm"
                  >
                    {option.Icon}
                    <span>{option.label}</span>
                  </Button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FloatingActionMenu;
