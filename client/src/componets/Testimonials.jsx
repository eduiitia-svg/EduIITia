import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../config/firebase";

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const q = query(
          collection(db, "testimonials"),
          orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(q);
        const testimonialsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTestimonials(testimonialsData);
      } catch (error) {
        console.error("Error fetching testimonials:", error);
        setTestimonials([
          {
            id: 1,
            name: "Yeray Rosales",
            role: "UI Design",
            image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Yeray",
            text: "I believe in lifelong learning and this is the best place to learn from the experts with step by step learning courses. I've learned a lot and recommended it to all of my friends.",
            time: "12 Days ago",
            rating: 4.85,
          },
          {
            id: 2,
            name: "Lew Silverton",
            role: "Digital Marketing",
            image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lew",
            text: "I really like the content they've offered for marketing and sales. I've purchased many classes and all of them are really good.",
            time: "1 Month ago",
            rating: 4.85,
          },
          {
            id: 3,
            name: "Neville Griffin",
            role: "Engineering",
            image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Neville",
            text: "Skeptical about online learning at first, but the quality of customer support and course content made me decide to become a long-term subscriber.",
            time: "2 Months ago",
            rating: 4.85,
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  const floatingAvatars = [
    { seed: "Alex", top: "10%", left: "5%", delay: 0 },
    { seed: "Sam", top: "20%", left: "15%", delay: 0.2 },
    { seed: "Casey", top: "12%", right: "5%", delay: 0.6 },
    { seed: "Morgan", top: "25%", right: "15%", delay: 0.8 },
  ];

  const formatTime = (createdAt) => {
    if (!createdAt) return "Recently";
    const date = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
    const now = new Date();
    const diff = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diff === 0) return "Today";
    if (diff === 1) return "1 Day ago";
    if (diff < 7) return `${diff} Days ago`;
    if (diff < 30)
      return `${Math.floor(diff / 7)} Week${
        Math.floor(diff / 7) > 1 ? "s" : ""
      } ago`;
    return `${Math.floor(diff / 30)} Month${
      Math.floor(diff / 30) > 1 ? "s" : ""
    } ago`;
  };

  if (loading) {
    return (
      <section className="relative w-full min-h-[80vh] py-20 overflow-hidden flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </section>
    );
  }

  const duplicatedTestimonials = [
    ...testimonials,
    ...testimonials,
    ...testimonials,
  ];

  return (
    <section className="relative w-full min-h-screen py-20 overflow-hidden flex flex-col justify-center bg-white dark:bg-transparent">
      <style>{`
      @keyframes scroll {
        0% { transform: translateX(0); }
        100% { transform: translateX(-33.33%); }
      }
      .animate-infinite-scroll {
        animation: scroll 40s linear infinite;
      }
    `}</style>

      <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-px bg-linear-to-r from-transparent via-teal-500 to-transparent"
            style={{
              top: `${10 + i * 12}%`,
              left: 0,
              right: 0,
            }}
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{
              scaleX: [0, 1.5, 1.5, 0],
              opacity: [0, 0.4, 0.4, 0],
              x: ["-100%", "100%"],
            }}
            transition={{
              duration: 8 + Math.random() * 5,
              delay: i * 0.5,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </div>

      {floatingAvatars.map((avatar, idx) => (
        <motion.div
          key={idx}
          className="absolute w-12 h-12 lg:w-16 lg:h-16 rounded-full border border-teal-500/20 overflow-hidden shadow-[0_0_15px_rgba(20,184,166,0.15)] z-0"
          style={{
            top: avatar.top,
            left: avatar.left,
            right: avatar.right,
          }}
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0.3, 0.8, 0.3],
            y: [0, -20, 0],
          }}
          transition={{
            opacity: { duration: 4, repeat: Infinity },
            y: {
              duration: 4 + idx * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
            },
          }}
        >
          <img
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${avatar.seed}`}
            alt="User"
            className="w-full h-full object-cover opacity-60 grayscale hover:grayscale-0 transition-all duration-500"
          />
        </motion.div>
      ))}

      <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 z-10 mb-12">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
            <span className="text-gray-900 dark:text-white">
              Helping thousands of students
            </span>
            <br />
            <span className="bg-linear-to-r from-teal-400 via-emerald-400 to-teal-500 text-transparent bg-clip-text">
              to succeed with speed
            </span>
          </h2>
        </motion.div>
      </div>

      <div className="relative w-full z-10">
        <div className="absolute left-0 top-0 bottom-0 w-24 sm:w-48 bg-linear-to-r from-white dark:from-[#0A0A0A] via-white/90 dark:via-[#0A0A0A]/90 to-transparent z-20 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 sm:w-48 bg-linear-to-l from-white dark:from-[#0A0A0A] via-white/90 dark:via-[#0A0A0A]/90 to-transparent z-20 pointer-events-none" />

        <div className="flex overflow-hidden">
          <div
            className="flex gap-6 pl-6 animate-infinite-scroll hover:[animation-play-state:paused]"
            style={{ width: "max-content" }}
          >
            {duplicatedTestimonials.map((testimonial, index) => (
              <div
                key={`${testimonial.id}-${index}`}
                className="group relative w-[350px] sm:w-[400px] shrink-0"
              >
                <div className="relative h-full bg-gray-50 dark:bg-[#121212] border border-gray-200 dark:border-white/5 rounded-2xl p-6 sm:p-8 hover:bg-gray-100 dark:hover:bg-[#161616] hover:border-teal-500/30 transition-all duration-500">
                  <div className="absolute inset-0 rounded-2xl bg-linear-to-r from-teal-500/0 via-teal-500/10 to-teal-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                  <div className="text-teal-500/20 text-4xl font-serif mb-4 leading-none">
                    "
                  </div>

                  <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base leading-relaxed mb-8 min-h-20 relative z-10">
                    {testimonial.text}
                  </p>

                  <div className="flex items-center gap-4 pt-6 border-t border-gray-200 dark:border-white/5 mt-auto">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-200 dark:border-white/10 group-hover:border-teal-500/50 transition-colors duration-300">
                        <img
                          src={
                            testimonial.image ||
                            `https://api.dicebear.com/7.x/avataaars/svg?seed=${testimonial.name}`
                          }
                          alt={testimonial.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-teal-500 rounded-full border-2 border-gray-50 dark:border-[#121212]" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="text-gray-900 dark:text-white font-medium text-sm truncate group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                        {testimonial.name}
                      </h4>
                      <p className="text-gray-500 dark:text-gray-500 text-xs truncate">
                        {testimonial.role}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <div className="flex text-amber-400 text-xs gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <span
                            key={i}
                            className={
                              i < Math.floor(testimonial.rating || 5)
                                ? "opacity-100"
                                : "opacity-30"
                            }
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      <span className="text-[10px] text-gray-600 dark:text-gray-600 font-mono">
                        {testimonial.time || formatTime(testimonial.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
