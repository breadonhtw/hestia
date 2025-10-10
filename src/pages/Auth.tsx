import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { AuthCardFlip } from "@/components/ui/auth-card-flip";
import { SignInCard } from "@/components/ui/sign-in-card";
import { SignUpCard } from "@/components/ui/sign-up-card";
import { motion } from "framer-motion";

const Auth = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isFlipped, setIsFlipped] = useState(false);

  // Redirect if already logged in
  if (user) {
    navigate("/");
    return null;
  }

  return (
    <AuroraBackground>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.3,
          duration: 0.8,
          ease: "easeInOut",
        }}
        className="relative flex flex-col gap-4 items-center justify-center px-4"
      >
        <AuthCardFlip
          frontCard={<SignInCard onFlipToSignUp={() => setIsFlipped(true)} />}
          backCard={<SignUpCard onFlipToSignIn={() => setIsFlipped(false)} />}
          isFlipped={isFlipped}
        />
      </motion.div>
    </AuroraBackground>
  );
};

export default Auth;
