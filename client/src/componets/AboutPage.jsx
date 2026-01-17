import React from "react";
import { motion } from "framer-motion";
import aboutImg from "../assets/about.webp";
import { Link } from "react-router";

const AboutPage = () => {
  return (
    <section
      id="about"
      className="w-full bg-white dark:bg-transparent text-gray-900 dark:text-white py-20 px-6 md:px-16 flex flex-col md:flex-row items-center justify-between"
    >
      <motion.div
        className="md:w-1/2 flex justify-center mb-12 md:mb-0"
        initial={{ opacity: 0, x: -60 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        viewport={{ once: true }}
      >
        <div className="relative">
          <div className="absolute -top-6 -left-6 w-24 h-24 bg-emerald-700/30 rounded-full blur-3xl opacity-50"></div>
          <img
            src={aboutImg}
            alt="Chemistry Quiz Illustration"
            className="w-[90%] max-w-md rounded-3xl border border-gray-200 dark:border-white/10 shadow-[0_0_40px_rgba(16,185,129,0.2)]"
          />
          <div className="absolute -bottom-6 -right-6 w-28 h-28 bg-teal-700/30 rounded-full blur-3xl opacity-50"></div>
        </div>
      </motion.div>

      <motion.div
        className="md:w-1/2 text-center md:text-left md:pl-10"
        initial={{ opacity: 0, x: 60 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        viewport={{ once: true }}
      >
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
          Discover{" "}
          <span className="text-emerald-600 dark:text-emerald-400">
            EduIITia
          </span>
        </h2>

        <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed mb-5">
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
            EduIITia
          </span>{" "}
          is a smart, exam-focused mock testing platform built to make
          high-quality online assessments accessible, powerful, and easy to use
          for both <strong>educators and learners</strong>. Designed for today’s
          digital examination landscape, EduIITia combines structured practice,
          precision-based evaluation, and performance insights to help users
          prepare smarter and perform better.
        </p>

        <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed mb-8">
          Whether you are a teacher, coaching centre, institution, or a student,
          EduIITia adapts to your needs. <strong>Educators</strong> can create
          professional MCQ-based mock tests without any coding or technical
          expertise, using an intuitive interface with time limits, automatic
          evaluation, and detailed analytics, while <strong>students</strong>{" "}
          experience a real exam-like environment with instant results, progress
          tracking, and insights into accuracy, speed, and time management —
          essential skills for modern online and competitive exams.
        </p>

        <Link
          to="/study"
          className="bg-linear-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-black font-semibold px-8 py-3 rounded-full shadow-[0_0_15px_rgba(52,211,153,0.3)] hover:shadow-[0_0_25px_rgba(52,211,153,0.5)] transition-all duration-300 transform hover:scale-[1.02]"
        >
          Explore Quizzes
        </Link>
      </motion.div>
    </section>
  );
};

export default AboutPage;
