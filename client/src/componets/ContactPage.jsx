import React, { useState } from "react";
import { motion } from "motion/react";
import { FaEnvelope, FaPhoneAlt, FaMapMarkerAlt } from "react-icons/fa";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { resetContactForm, sendContactEmail } from "../slices/contactSlice";
import { useDispatch } from "react-redux";
const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const validateForm = () => {
    const { name, email, message } = formData;
    if (!name.trim() || name.trim().length < 2) {
      toast.error("Please enter your full name.");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address.");
      return false;
    }
    if (!message.trim() || message.trim().length < 10) {
      toast.error("Message should be at least 10 characters long.");
      return false;
    }
    return true;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      const result = await dispatch(sendContactEmail(formData)).unwrap();
      if (result.success) {
        toast.success(result.message);
        setFormData({
          name: "",
          email: "",
          message: "",
        });
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <section
      id="contact"
      className="min-h-screen bg-white dark:bg-transparent text-gray-900 dark:text-white flex items-center justify-center px-6 py-20 relative overflow-hidden font-inter"
    >
      <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-10 items-stretch relative z-10">
        <motion.div
          initial={{ x: -40, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true }}
          className="bg-gray-50 dark:bg-black/40 backdrop-blur-md shadow-2xl rounded-2xl p-10 border border-gray-200 dark:border-teal-800/50 flex flex-col justify-between"
        >
          <div>
            <h2 className="text-4xl font-bold text-teal-600 dark:text-teal-400 mb-4 tracking-tight">
              Get in Touch
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-10 text-base leading-relaxed">
              Have questions about quizzes, feedback, or collaboration ideas?
              We'd love to hear from you. Fill out the form and we'll respond
              soon.
            </p>
            <ul className="space-y-6 text-gray-800 dark:text-gray-200">
              <li className="flex items-center space-x-4">
                <FaEnvelope className="text-teal-600 dark:text-teal-400 text-xl shrink-0" />
                <span className="text-lg">support@eduiitia.com</span>
              </li>
              <li className="flex items-center space-x-4">
                <FaPhoneAlt className="text-teal-600 dark:text-teal-400 text-xl shrink-0" />
                <span className="text-lg">+91 7662886162</span>
              </li>
              <li className="flex items-center space-x-4">
                <FaMapMarkerAlt className="text-teal-600 dark:text-teal-400 text-xl shrink-0" />
                <span className="text-lg">Kolkata, West Bengal, India</span>
              </li>
            </ul>
          </div>
          <div className="mt-12 border-t border-gray-300 dark:border-teal-900 pt-6 text-sm text-gray-500 dark:text-gray-600">
            © {new Date().getFullYear()} EduIITia. All rights reserved.
          </div>
        </motion.div>

        <motion.div
          initial={{ x: 40, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true }}
          className="bg-gray-50 dark:bg-black/60 shadow-xl rounded-2xl p-10 border border-gray-200 dark:border-teal-800/50"
        >
          <h3 className="text-3xl font-semibold text-teal-600 dark:text-teal-300 mb-8">
            Send Us a Message
          </h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                className="w-full px-4 py-3 bg-white dark:bg-[#111111] border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="example@domain.com"
                className="w-full px-4 py-3 bg-white dark:bg-[#111111] border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
                Message
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Write your message here..."
                rows="5"
                className="w-full px-4 py-3 bg-white dark:bg-[#111111] border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all resize-none"
                required
              />
            </div>
            <motion.button
              whileHover={{ scale: loading ? 1 : 1.03 }}
              whileTap={{ scale: loading ? 1 : 0.95 }}
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center items-center gap-3 bg-linear-to-r from-teal-500 to-emerald-600 text-black font-extrabold py-3.5 rounded-lg shadow-lg transition-all                ${
                loading
                  ? "opacity-70 cursor-not-allowed"
                  : "hover:from-teal-400 hover:to-emerald-500 hover:shadow-[0_0_20px_rgba(20,184,166,0.6)]"
              }`}
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                "Send Message"
              )}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </section>
  );
};
export default ContactPage;
