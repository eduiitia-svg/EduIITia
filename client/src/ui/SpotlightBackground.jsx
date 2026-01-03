import { motion } from "framer-motion";
import { useTheme } from "../context/ThemeProvider";

const SpotlightBackground = () => {
  const { theme } = useTheme();

  const spotlightVariant = {
    animate: {
      scale: [1, 1.2, 1],
      opacity: [0.3, 0.5, 0.3],
      transition: {
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  return (
    <div className="fixed inset-0 z-0 w-full h-full bg-linear-to-br from-gray-50 via-white to-gray-100 dark:from-[#050505] dark:via-[#0A0A0A] dark:to-[#050505] overflow-hidden pointer-events-none">
      {theme === "light" && (
        <>
          <motion.div
            variants={spotlightVariant}
            animate="animate"
            className="absolute -top-20 -left-20 w-[700px] h-[700px] bg-gradient-radial from-emerald-300/30 via-emerald-200/20 to-transparent rounded-full blur-3xl"
          />

          <motion.div
            variants={spotlightVariant}
            animate="animate"
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
            className="absolute -bottom-20 -right-20 w-[700px] h-[700px] bg-gradient-radial from-teal-300/30 via-teal-200/20 to-transparent rounded-full blur-3xl"
          />

          <motion.div
            variants={spotlightVariant}
            animate="animate"
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 4,
            }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-cyan-200/20 via-cyan-100/10 to-transparent rounded-full blur-3xl"
          />
        </>
      )}

      {theme === "dark" && (
        <>
          <motion.div
            variants={spotlightVariant}
            animate="animate"
            className="absolute -top-20 -left-20 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px]"
          />

          <motion.div
            variants={spotlightVariant}
            animate="animate"
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
            className="absolute -bottom-20 -right-20 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[120px]"
          />
        </>
      )}

      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.08] dark:opacity-20 mix-blend-overlay"></div>
    </div>
  );
};

export default SpotlightBackground;