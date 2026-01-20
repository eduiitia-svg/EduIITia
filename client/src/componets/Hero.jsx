import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  BookOpen,
  Brain,
  Trophy,
  Target,
  Sparkles,
  Zap,
  GraduationCap,
  ChartBar,
  ArrowRight,
  PlayCircle,
  CheckCircle2,
} from "lucide-react";

const Hero = () => {
  const navigate = useNavigate();
  const [typedText, setTypedText] = useState("");
  const [isTypingDone, setIsTypingDone] = useState(false);
  const fullText = "Practice smarter, Perform better.";

  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 150]);
  const y2 = useTransform(scrollY, [0, 500], [0, -100]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  useEffect(() => {
    let index = 0;
    const timeout = setTimeout(() => {
      const timer = setInterval(() => {
        if (index <= fullText.length) {
          setTypedText(fullText.slice(0, index));
          index++;
        } else {
          setIsTypingDone(true);
          clearInterval(timer);
        }
      }, 50);
      return () => clearInterval(timer);
    }, 200);
    return () => clearTimeout(timeout);
  }, []);

  const handleGetStarted = () => {
    navigate("/study?category=school");
  };

  const handleBecomePartner = () => {
    const contactSection = document.getElementById("contact-us");
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const floatingCards = [
    { icon: BookOpen, position: "top-[15%] left-[10%]", delay: 0 },
    { icon: Brain, position: "top-[25%] right-[10%]", delay: 0.2 },
    { icon: Trophy, position: "bottom-[20%] left-[8%]", delay: 0.4 },
    { icon: Target, position: "bottom-[25%] right-[8%]", delay: 0.6 },
    { icon: Sparkles, position: "top-[40%] right-[20%]", delay: 0.3 },
    { icon: Zap, position: "bottom-[40%] left-[15%]", delay: 0.5 },
  ];

  return (
    <section className="relative w-full min-h-screen flex flex-col pt-12 items-center justify-center overflow-hidden bg-white dark:bg-transparent selection:bg-emerald-500/30">
      <div className="absolute inset-0 w-full h-full dark:bg-grid-white/[0.04] bg-grid-black/[0.03] pointer-events-none" />

      <motion.div
        style={{ y: y1, opacity }}
        className="absolute top-0 left-0 right-0 h-[500px] bg-linear-to-b from-emerald-500/10 via-transparent to-transparent blur-[100px] pointer-events-none"
      />
      <motion.div
        style={{ y: y2 }}
        className="absolute inset-0 pointer-events-none overflow-hidden"
      >
        {floatingCards.map((card, index) => {
          const Icon = card.icon;
          const cardY = useTransform(scrollY, [0, 500], [0, -50 * card.speed]);

          return (
            <motion.div
              key={index}
              style={{ y: cardY }}
              className={`absolute ${card.position} flex items-center justify-center`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: 1,
                scale: 1,
                y: [0, -15, 0],
              }}
              transition={{
                duration: 4 + index,
                repeat: Infinity,
                ease: "easeInOut",
                delay: card.delay,
                opacity: { duration: 0.6, delay: card.delay },
                scale: { duration: 0.6, delay: card.delay },
              }}
            >
              <div className="relative group cursor-pointer pointer-events-auto">
                <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative w-14 h-14 rounded-2xl bg-white/40 dark:bg-white/5 backdrop-blur-md border border-white/20 dark:border-white/10 shadow-sm flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3">
                  <Icon
                    className="w-6 h-6 text-gray-600 dark:text-gray-300 group-hover:text-emerald-500 transition-colors"
                    strokeWidth={1.5}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      <div
        style={{ opacity }}
        className="relative z-10 w-full max-w-5xl mx-auto px-6 text-center"
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-10"
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 dark:border-white/10 bg-white/50 dark:bg-white/5 backdrop-blur-xl shadow-sm hover:border-emerald-500/30 transition-colors cursor-default"
          >
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-semibold tracking-wide text-gray-600 dark:text-gray-300 uppercase">
              Next-Gen Learning
            </span>
          </motion.div>

          <div>
            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-medium tracking-tighter text-gray-900 dark:text-white leading-[0.9]">
              Your ultimate
              <span className="block text-transparent bg-clip-text bg-linear-to-br from-emerald-500 via-teal-500 to-cyan-600 dark:from-white dark:via-gray-200 dark:to-gray-500 pb-14 leading-20">
                learning platform
              </span>
            </h1>

            <div className="flex flex-col items-center justify-center gap-2">
              <span className="text-xl sm:text-2xl text-gray-500 dark:text-gray-400 font-bold tracking-tight text-center">
                Create. Practice. Analyze. Succeed.
              </span>

              <div className="flex items-center">
                <span className="text-xl sm:text-2xl text-gray-500 dark:text-gray-400 font-light tracking-tight">
                  {typedText}
                </span>

                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  className={`w-0.5 h-6 bg-emerald-500 ml-1 ${
                    isTypingDone ? "opacity-50" : ""
                  }`}
                />
              </div>
            </div>
          </div>

          <div className="max-w-2xl mx-auto ">
            <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed font-light">
              Master online exams with smart mock tests, instant insights, and
              personalized improvement paths powered by AI. A unified online
              platform where teachers create high-quality mock tests and
              students practice in a real exam environment with instant
              evaluation and smart performance analytics.
            </p>
          </div>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <button
              onClick={handleGetStarted}
              className="group relative h-12 px-8 rounded-full bg-gray-900 dark:bg-white text-white dark:text-black font-medium text-sm transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center gap-2"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>

            <button
              onClick={handleBecomePartner}
              className="group relative h-12 px-8 rounded-full 
             bg-gray-50/50 dark:bg-gray-900/50 
             backdrop-blur-md 
             border border-gray-200 dark:border-gray-700 
             text-gray-900 dark:text-white 
             font-medium text-sm 
             transition-all duration-300 
             hover:bg-gray-100/80 dark:hover:bg-gray-800/80 
             hover:scale-[1.02] 
             hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-black/30
             flex items-center gap-2"
            >
              Become a Partner
              <ArrowRight className="w-4 h-4 text-gray-600 dark:text-gray-300 transition-transform group-hover:translate-x-1" />
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="pt-16"
          >
            <div className="inline-flex flex-wrap justify-center gap-8 md:gap-16 px-8 py-6 rounded-3xl bg-white/40 dark:bg-white/3 border border-gray-200 dark:border-white/5 backdrop-blur-sm">
              {[
                { val: "12k+", label: "Active Questions" },
                { val: "98%", label: "Success Rate" },
                { val: "4.9/5", label: "User Rating" },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center sm:items-start gap-1"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                      {stat.val}
                    </span>
                  </div>
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider pl-6">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>

      <div className="absolute bottom-0 w-full h-24 bg-linear-to-t from-white dark:from-[#050505] to-transparent pointer-events-none" />

      <style>{`
        .bg-grid-black\\/\\[0\\.03\\] {
          background-size: 30px 30px;
          background-image: linear-gradient(to right, rgba(0, 0, 0, 0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 0, 0, 0.03) 1px, transparent 1px);
        }
        .bg-grid-white\\/\\[0\\.04\\] {
          background-size: 30px 30px;
          background-image: linear-gradient(to right, rgba(255, 255, 255, 0.04) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.04) 1px, transparent 1px);
        }
      `}</style>
    </section>
  );
};

export default Hero;
