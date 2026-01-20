import React, { useState } from "react";
import { motion } from "motion/react";
import { FaEnvelope, FaPhoneAlt, FaMapMarkerAlt } from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";
import { Loader2, Building2 } from "lucide-react";
import {  sendContactEmail, sendPartnerInquiry } from "../slices/contactSlice";
import { useDispatch } from "react-redux";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [formType, setFormType] = useState("message");
  
  const [partnerFormData, setPartnerFormData] = useState({
    name: "",
    email: "",
    phone: "",
    instituteName: "",
    message: "",
  });

  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePartnerChange = (e) => {
    setPartnerFormData({ ...partnerFormData, [e.target.name]: e.target.value });
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

  const validatePartnerForm = () => {
    const { name, email, instituteName, message } = partnerFormData;
    
    if (!name.trim() || name.trim().length < 2) {
      toast.error("Please enter your full name.");
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address.");
      return false;
    }
    
    if (!instituteName.trim()) {
      toast.error("Please enter your institute name.");
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
        toast.success(result.message || "Message sent successfully!");
        setFormData({
          name: "",
          email: "",
          message: "",
        });
      }
    } catch (error) {
      toast.error(error || "Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  const handlePartnerSubmit = async (e) => {
    e.preventDefault();
    if (!validatePartnerForm()) return;
    
    setLoading(true);
    try {
      const result = await dispatch(sendPartnerInquiry(partnerFormData)).unwrap();
      if (result.success) {
        toast.success("Partner inquiry submitted successfully!");
        setPartnerFormData({
          name: "",
          email: "",
          phone: "",
          instituteName: "",
          message: "",
        });
      }
    } catch (error) {
      toast.error(error || "Failed to submit inquiry");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      id="contact"
      className="min-h-dvh w-full bg-white dark:bg-[#09090b] flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden font-inter transition-colors duration-300"
    >
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-teal-500/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
      
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#1e293b",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.1)",
            fontSize: "14px",
          },
        }}
      />

      <div className="max-w-6xl w-full grid lg:grid-cols-5 shadow-2xl rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0f1115] relative z-10">
        
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="lg:col-span-2 bg-linear-to-br from-teal-600 to-teal-800 dark:from-teal-900 dark:to-black p-8 sm:p-10 lg:p-12 text-white flex flex-col justify-between relative overflow-hidden"
        >
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none"></div>
          
          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4 text-white">
              Get in Touch
            </h2>
            <p className="text-teal-100 text-sm sm:text-base leading-relaxed mb-8 sm:mb-12 max-w-sm">
              Have questions about quizzes, feedback, or collaboration ideas?
              We'd love to hear from you.
            </p>

            <ul className="space-y-6">
              <li className="flex items-start space-x-4 group">
                <div className="p-3 bg-white/10 rounded-lg group-hover:bg-white/20 transition-colors">
                  <FaEnvelope className="text-xl text-teal-200" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-teal-200 uppercase tracking-wider font-semibold">Email</span>
                  <span className="text-sm sm:text-base font-medium break-all">support@eduiitia.com</span>
                </div>
              </li>
              <li className="flex items-start space-x-4 group">
                <div className="p-3 bg-white/10 rounded-lg group-hover:bg-white/20 transition-colors">
                  <FaPhoneAlt className="text-xl text-teal-200" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-teal-200 uppercase tracking-wider font-semibold">Phone</span>
                  <span className="text-sm sm:text-base font-medium">+91 7662886162</span>
                </div>
              </li>
              <li className="flex items-start space-x-4 group">
                <div className="p-3 bg-white/10 rounded-lg group-hover:bg-white/20 transition-colors">
                  <FaMapMarkerAlt className="text-xl text-teal-200" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-teal-200 uppercase tracking-wider font-semibold">Office</span>
                  <span className="text-sm sm:text-base font-medium">Kolkata, West Bengal, India</span>
                </div>
              </li>
            </ul>
          </div>

          <div className="relative z-10 mt-12 pt-8 border-t border-teal-500/30 text-xs text-teal-200/60">
             © {new Date().getFullYear()} EduIITia. All rights reserved.
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          viewport={{ once: true }}
          className="lg:col-span-3 p-6 sm:p-10 lg:p-14 bg-white dark:bg-[#0f1115]"
        >
          <div className="bg-gray-100 dark:bg-gray-800/50 p-1.5 rounded-xl flex mb-8 sm:mb-10 w-full max-w-md mx-auto lg:mx-0">
            <button
              type="button"
              onClick={() => setFormType("message")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                formType === "message"
                  ? "bg-white dark:bg-gray-700 text-teal-600 dark:text-teal-400 shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              <FaEnvelope className={formType === "message" ? "scale-110" : ""} />
              Message
            </button>
            <button
              type="button"
              onClick={() => setFormType("partner")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                formType === "partner"
                  ? "bg-white dark:bg-gray-700 text-teal-600 dark:text-teal-400 shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              <Building2 className={formType === "partner" ? "scale-110" : ""} size={18} />
              Partner
            </button>
          </div>

          <div className="mb-6">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              {formType === "message" ? "Send a Message" : "Partner With Us"}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
              {formType === "message" 
                ? "We'll get back to you within 24 hours." 
                : "Join our network of educational institutes."}
            </p>
          </div>

          {formType === "message" ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="How can we help you?"
                  rows="4"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm resize-none"
                  required
                />
              </div>

              <motion.button
                whileHover={{ scale: loading ? 1 : 1.01 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                disabled={loading}
                className={`w-full py-3.5 px-6 rounded-xl font-bold text-white shadow-lg shadow-teal-500/20 transition-all flex justify-center items-center gap-2 mt-2 ${
                  loading 
                    ? "bg-gray-400 cursor-not-allowed opacity-70" 
                    : "bg-linear-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500"
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  "Send Message"
                )}
              </motion.button>
            </form>
          ) : (
            <form onSubmit={handlePartnerSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Contact Name</label>
                  <input
                    type="text"
                    name="name"
                    value={partnerFormData.name}
                    onChange={handlePartnerChange}
                    placeholder="Jane Doe"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={partnerFormData.email}
                    onChange={handlePartnerChange}
                    placeholder="partner@institute.com"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={partnerFormData.phone}
                    onChange={handlePartnerChange}
                    placeholder="+91 98765 43210"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Institute Name</label>
                  <input
                    type="text"
                    name="instituteName"
                    value={partnerFormData.instituteName}
                    onChange={handlePartnerChange}
                    placeholder="Academy Name"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Requirements / Details</label>
                <textarea
                  name="message"
                  value={partnerFormData.message}
                  onChange={handlePartnerChange}
                  placeholder="Tell us about your requirements..."
                  rows="4"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm resize-none"
                  required
                />
              </div>

              <motion.button
                whileHover={{ scale: loading ? 1 : 1.01 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                disabled={loading}
                className={`w-full py-3.5 px-6 rounded-xl font-bold text-white shadow-lg shadow-teal-500/20 transition-all flex justify-center items-center gap-2 mt-2 ${
                  loading 
                    ? "bg-gray-400 cursor-not-allowed opacity-70" 
                    : "bg-linear-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500"
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  "Submit Inquiry"
                )}
              </motion.button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default ContactPage;