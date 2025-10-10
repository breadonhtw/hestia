import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AuthCardFlipProps {
  frontCard: React.ReactNode;
  backCard: React.ReactNode;
  isFlipped: boolean;
}

export const AuthCardFlip = ({ frontCard, backCard, isFlipped }: AuthCardFlipProps) => {
  return (
    <div className="perspective-1000 w-full max-w-sm">
      <motion.div
        className="relative w-full preserve-3d"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Front Card (Sign In) */}
        <div
          className={cn(
            "backface-hidden w-full",
            isFlipped && "pointer-events-none"
          )}
          style={{ backfaceVisibility: "hidden" }}
        >
          {frontCard}
        </div>

        {/* Back Card (Sign Up) */}
        <div
          className="backface-hidden absolute top-0 left-0 w-full"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          {backCard}
        </div>
      </motion.div>
    </div>
  );
};
