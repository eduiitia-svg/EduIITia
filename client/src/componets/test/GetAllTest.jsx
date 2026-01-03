import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../config/firebase";
import { isSubscriptionActive } from "../../../utils/subscriptionHelpers";
import {
  GraduationCap,
  Building2,
  Briefcase,
  ArrowRight,
  Sparkles,
  Loader2,
} from "lucide-react";

const GetAllTest = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [realtimeUserData, setRealtimeUserData] = useState(null);
  const [checkingSubscription, setCheckingSubscription] = useState(false);

  const categories = [
    {
      id: "school",
      title: "School",
      description: "Classes 1-12 comprehensive test series for all subjects",
      icon: GraduationCap,
      gradientTheme: "from-blue-400 via-cyan-400 to-teal-400",
      iconColor: "text-blue-500",
      classes: [
        "Class 1", "Class 2", "Class 3", "Class 4", "Class 5",
        "Class 6", "Class 7", "Class 8", "Class 9", "Class 10",
        "Class 11", "Class 12",
      ],
      route: "/study?category=school",
    },
    {
      id: "entrance",
      title: "Entrance Exams",
      description: "Prepare for JEE, NEET, UPSC, and other competitive exams",
      icon: Building2,
      gradientTheme: "from-violet-400 via-fuchsia-400 to-pink-400",
      iconColor: "text-violet-500",
      exams: [
        "Medical", "Engineering", "Law", "Management", "Architecture",
        "Education", "Science", "Common",
        "Agricultural",
      ],
      route: "/study?category=entrance",
    },
    {
      id: "recruitment",
      title: "Recruitment Exams",
      description:
        "Government job exams including SSC, Banking, Railway & more",
      icon: Briefcase,
      gradientTheme: "from-emerald-400 via-teal-400 to-cyan-400",
      iconColor: "text-emerald-500",
      exams: [
        "SSC", "Banking", "Railway", "UPSC", "Teaching", "General Preparation",
      ],
      route: "/study?category=recruitment",
    },
  ];

  useEffect(() => {
    if (!user?.uid) {
      setRealtimeUserData(null);
      return;
    }
    setCheckingSubscription(true);
    const userRef = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(
      userRef,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const userData = docSnapshot.data();
          setRealtimeUserData(userData);
          setCheckingSubscription(false);
        } else {
          setRealtimeUserData(null);
          setCheckingSubscription(false);
        }
      },
      (error) => {
        console.error("Error fetching user data:", error);
        setCheckingSubscription(false);
      }
    );
    return () => {
      unsubscribe();
    };
  }, [user?.uid]);

  const hasPremiumAccess = () => {
    const userData = realtimeUserData || user;
    if (
      !userData ||
      !userData.subscription ||
      !Array.isArray(userData.subscription)
    ) {
      return false;
    }
    return userData.subscription.some((sub) => isSubscriptionActive(sub));
  };

  const handleCategoryClick = (route) => {
    navigate(route);
  };

  return (
    <div className="relative w-full overflow-hidden bg-gray-50/50 dark:bg-black/20 transition-colors duration-500">
      <div className="relative z-10 w-full max-w-7xl mx-auto py-16 px-6">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 backdrop-blur-md shadow-sm"
          >
            <span className="flex relative h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 tracking-wider uppercase">
              Library Live
            </span>
          </motion.div>
          
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight">
            Next-Gen Mock{" "}
            <span className="relative whitespace-nowrap text-transparent bg-clip-text bg-linear-to-r from-emerald-600 via-teal-500 to-cyan-600 dark:from-emerald-400 dark:via-teal-300 dark:to-cyan-400">
              Testing
            </span>
          </h1>
          
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed font-medium">
            Experience decentralized learning. Start with free demo tests or
            unlock the full potential with our PRO network.
          </p>

          {user && (
            <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl border border-gray-200/80 dark:border-white/10 bg-white/60 dark:bg-zinc-900/50 backdrop-blur-md shadow-sm text-sm font-medium transition-all hover:border-gray-300 dark:hover:border-white/20">
               <div
                className={`w-2 h-2 rounded-full ${
                  hasPremiumAccess()
                    ? "bg-linear-to-r from-emerald-400 to-teal-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]"
                    : "bg-gray-400 dark:bg-gray-600"
                }`}
              ></div>
              <span className="text-gray-800 dark:text-gray-200">
                {hasPremiumAccess() ? "PRO Status Active" : "Free Tier Account"}
              </span>
            </div>
          )}
        </div>

        {checkingSubscription ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
            <p className="text-emerald-700 dark:text-emerald-300 font-medium text-sm tracking-wider animate-pulse">
              SYNCING DATA...
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category, index) => {
              const Icon = category.icon;
              const isPro = hasPremiumAccess();

              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.15, duration: 0.5, ease: "easeOut" }}
                  className="group relative h-full"
                  onClick={() => handleCategoryClick(category.route)}
                >
                  <div className="relative h-full w-full z-10 flex flex-col p-px rounded-[36px] transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-gray-200/50 dark:hover:shadow-black/50 cursor-pointer bg-linear-to-b from-white/80 to-white/40 dark:from-zinc-800/80 dark:to-zinc-900/40">
                    
                    <div className={`absolute inset-0 h-full w-full bg-linear-to-br ${category.gradientTheme} opacity-0 group-hover:opacity-20 dark:group-hover:opacity-30 blur-3xl transition-all duration-700 ease-in-out rounded-[36px] bg-size-[200%_200%] bg-top-left  group-hover:bg-bottom-right`} />

                    <div className="relative h-full flex flex-col p-8 rounded-[35px] bg-white/70 dark:bg-zinc-900/80 backdrop-blur-2xl overflow-hidden border border-white/20 dark:border-white/5 transition-colors duration-500 group-hover:bg-white/80 dark:group-hover:bg-zinc-900/90">
                      
                      <div className="flex justify-between items-start mb-8">
                        <div className={`relative w-16 h-16 rounded-2xl bg-linear-to-br from-gray-50 to-gray-100 dark:from-zinc-800 dark:to-zinc-900 shadow-inner border border-white/40 dark:border-white/5 flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 ${category.iconColor}`}>

                           <div className={`absolute inset-0 bg-linear-to-br ${category.gradientTheme} opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-500 rounded-2xl`}></div>
                          <Icon size={30} strokeWidth={2} className="relative z-10" />
                        </div>

                        {isPro && (
                          <div className="flex items-center gap-1.5 bg-linear-to-r from-amber-50/80 to-orange-50/80 dark:from-amber-900/20 dark:to-orange-900/20 backdrop-blur-md border border-amber-200/50 dark:border-amber-700/30 pl-2 pr-3 py-1.5 rounded-full shadow-sm">
                            <Sparkles size={14} className="text-amber-500" fill="currentColor" />
                            <span className="text-[11px] font-extrabold tracking-widest text-amber-700 dark:text-amber-400 uppercase leading-none">
                              Pro
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="mb-auto relative z-10">
                        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight leading-snug group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-linear-to-r group-hover:from-gray-900 group-hover:to-gray-600 dark:group-hover:from-white dark:group-hover:to-gray-300 transition-all">
                          {category.title}
                        </h2>
                        <p className="text-gray-600 dark:text-gray-300 text-[15px] leading-relaxed font-medium pr-4">
                          {category.description}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2.5 mt-2  mb-10 relative z-10">
                        {(category.classes || category.exams)
                          ?.slice(0, 3)
                          .map((item, i) => (
                            <span
                              key={i}
                              className={`text-xs font-semibold px-3.5 py-2 rounded-lg bg-gray-100/80 dark:bg-zinc-800/80 text-gray-600 dark:text-gray-300 border border-gray-200/50 dark:border-white/5 transition-colors duration-300 group-hover:border-${category.iconColor.split('-')[1]}-200/50 dark:group-hover:border-${category.iconColor.split('-')[1]}-800/50 group-hover:bg-white dark:group-hover:bg-zinc-800`}
                            >
                              {item}
                            </span>
                          ))}
                        {(category.classes || category.exams)?.length > 3 && (
                          <span className="text-xs font-bold px-3.5 py-2 rounded-lg bg-gray-50 dark:bg-zinc-800/50 text-gray-500 dark:text-gray-400 border border-transparent">
                            +{(category.classes || category.exams).length - 3} more
                          </span>
                        )}
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCategoryClick(category.route);
                        }}
                        className="relative z-10 w-full group/btn"
                      >
                        <div className={`relative overflow-hidden rounded-xl p-px bg-linear-to-r ${category.gradientTheme} shadow-md transition-all duration-300 group-hover/btn:shadow-lg group-hover/btn:scale-[1.02]`}>
                           <div className="absolute inset-0 bg-white/20 dark:bg-white/10 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500"></div>
                           
                          <div className={`relative flex h-full w-full items-center justify-center rounded-[11px] bg-linear-to-r ${category.gradientTheme} px-4 py-3.5 text-[15px] font-bold text-white transition-all duration-300`}>
                            <span className="flex items-center gap-3">
                              Explore Now
                              <ArrowRight
                                size={18}
                                className="transition-transform duration-300 group-hover/btn:translate-x-1"
                              />
                            </span>
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default GetAllTest;