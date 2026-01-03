import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronDown,
  Shield,
  FileText,
  HelpCircle,
  CheckCircle,
  ArrowLeft,
} from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

const LegalPages = () => {
  const { type } = useParams();
  const location = useLocation();
  const [activePage, setActivePage] = useState(type || "faq");
  const [expandedFaq, setExpandedFaq] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (type) {
      setActivePage(type);
    }
  }, [type]);

  const faqData = [
    {
      q: "Is this platform only for competitive exams?",
      a: "No. The platform supports school exams, college exams, competitive exams, and custom assessments.",
    },
    {
      q: "Who creates the exams?",
      a: "Exams are created by Admins or authorized teachers assigned by institutions.",
    },
    {
      q: "Can schools have their own separate admin panel?",
      a: "Yes. Each school/institute gets its own isolated admin dashboard.",
    },
    {
      q: "Can students upload profile photos and roll numbers?",
      a: "Yes. Students can upload profile photos and roll numbers as required by their institution.",
    },
    {
      q: "Is this platform affiliated with any government body?",
      a: "No. This platform is independent and not affiliated with CBSE, ICSE, NTA, IITs, or any government authority.",
    },
    {
      q: "Is online payment secure?",
      a: "Yes. All payments are processed via secure third-party payment gateways.",
    },
    {
      q: "Can admins download reports?",
      a: "Yes. Admins can export results and reports in PDF or Excel formats.",
    },
    {
      q: "Can the platform be customized for my school?",
      a: "Yes. Branding, exam rules, and features can be customized as per institutional requirements.",
    },
  ];

  const termsData = [
    {
      title: "Acceptance of Terms",
      content:
        "By accessing or using this platform, you agree to comply with these Terms & Conditions. If you do not agree, you must not use the services.",
    },
    {
      title: "Platform Description",
      content:
        "This platform is a Software-as-a-Service (SaaS) solution that enables schools, colleges, and institutes to conduct online exams, competitive exam practice and mock tests, test creation, evaluation, analytics, and reporting. The platform operates on a role-based system including Super Admin, Organization/School Admin, Teachers/Exam Managers, and Students/Users.",
    },
    {
      title: "User Roles & Responsibilities",
      content:
        "Super Admin manages platform infrastructure, creates and assigns Admin accounts, and controls global features. Admins manage students, teachers, exams, and results while ensuring ethical and lawful use. Students must use the platform only for academic purposes and must not engage in unfair practices during exams.",
    },
    {
      title: "Account Registration & Information",
      content:
        "Users must provide accurate and complete details including name, roll number, profile photo (if required), and mobile number. Sharing of login credentials is strictly prohibited. Institutions are responsible for student data accuracy.",
    },
    {
      title: "Exams, Results & Accuracy",
      content:
        "The platform provides technical tools only. Exam content, marking schemes, and evaluation rules are controlled by the Admin/Institute. The platform is not responsible for academic decisions based on results.",
    },
    {
      title: "Subscription, Payments & Billing",
      content:
        "Some features may require paid subscriptions. Payments are processed through secure third-party gateways. Subscription fees are non-refundable unless stated otherwise. Pricing and features may be updated periodically.",
    },
    {
      title: "Intellectual Property",
      content:
        "The platform software, UI, and system architecture are proprietary. Exam content uploaded by Admins remains their responsibility. Users may not copy, reverse-engineer, or misuse platform features.",
    },
    {
      title: "Prohibited Activities",
      content:
        "Users must not attempt to cheat or manipulate exam results, upload illegal or offensive material, hack or disrupt the platform, or impersonate another user. Violation may result in account suspension or termination.",
    },
    {
      title: "Data & System Availability",
      content:
        "The platform strives for high availability but does not guarantee uninterrupted service. Scheduled maintenance or unforeseen technical issues may occur.",
    },
    {
      title: "Limitation of Liability",
      content:
        "The platform is not liable for academic losses or exam outcomes, data errors caused by Admin uploads, or internet or device-related issues.",
    },
    {
      title: "Modifications to Terms",
      content:
        "These Terms may be updated at any time. Continued usage implies acceptance of revised terms.",
    },
    {
      title: "Contact & Support",
      content:
        "For queries, users may contact support via the official communication channels.",
    },
  ];

  const privacyData = [
    {
      title: "Information We Collect",
      content:
        "We collect personal information including name, email address, mobile number, roll number/student ID, and profile photograph (optional). System information such as login activity, exam attempts and results, and device/browser information is also collected.",
    },
    {
      title: "Purpose of Data Collection",
      content:
        "Data is collected to create and manage user accounts, conduct exams and evaluations, generate reports and analytics, and improve platform performance and security.",
    },
    {
      title: "Storage & Security",
      content:
        "All data is stored securely using industry-standard practices. Payment details are handled by third-party payment gateways and not stored on our servers.",
    },
    {
      title: "Data Sharing",
      content:
        "We do not sell user data. Data may be shared with authorized school/institute admins, payment gateway providers, and legal authorities if required by law.",
    },
    {
      title: "Profile Photos & Public Visibility",
      content:
        "Profile photos and roll numbers are visible only within the organization/institute. Public leaderboards (if enabled) show limited non-sensitive information.",
    },
    {
      title: "Cookies & Tracking",
      content:
        "Cookies may be used to maintain sessions, improve user experience, and analyze platform usage. Users can manage cookies through browser settings.",
    },
    {
      title: "Children's Privacy",
      content:
        "Student accounts are created under institutional supervision. Schools are responsible for parental consent where required.",
    },
    {
      title: "Data Retention",
      content:
        "Data is retained as long as accounts remain active or as required by institutions. Users may request data deletion through Admin or support.",
    },
    {
      title: "Privacy Policy Updates",
      content:
        "This policy may be updated periodically. Users are encouraged to review it regularly.",
    },
  ];

  const pageConfig = {
    faq: {
      icon: HelpCircle,
      title: "Frequently Asked",
      highlight: "Questions",
      description: "Find answers to common questions about our platform",
    },
    terms: {
      icon: FileText,
      title: "Terms &",
      highlight: "Conditions",
      description:
        "Please read these terms carefully before using our services",
    },
    privacy: {
      icon: Shield,
      title: "Privacy",
      highlight: "Policy",
      description: "Learn how we collect, use, and protect your information",
    },
  };

  const currentConfig = pageConfig[activePage];
  const IconComponent = currentConfig.icon;

  return (
  <div className="relative w-full min-h-screen bg-gray-50 dark:bg-transparent overflow-hidden">
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

    <nav className="sticky top-0 z-20 border-b border-gray-200 dark:border-white/5 backdrop-blur-xl bg-white/80 dark:bg-transparent">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-6">
        <div className="flex items-center justify-between">
          <motion.button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
            whileHover={{ x: -5 }}
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back to Home</span>
          </motion.button>

          <div className="flex gap-2 sm:gap-4">
            {Object.keys(pageConfig).map((page) => {
              const Icon = pageConfig[page].icon;
              return (
                <motion.button
                  key={page}
                  onClick={() => {
                    setActivePage(page);
                    navigate(`/legal-terms/${page}`);
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    activePage === page
                      ? "bg-linear-to-r from-teal-100 dark:from-teal-500/20 to-emerald-100 dark:to-emerald-500/20 text-teal-700 dark:text-teal-400 border border-teal-300 dark:border-teal-500/30"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">
                    {page.charAt(0).toUpperCase() + page.slice(1)}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>

    <div className="relative z-10 max-w-5xl mx-auto px-6 sm:px-8 lg:px-12 py-16">
      <motion.div
        key={activePage}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <motion.div
          className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br from-teal-100 dark:from-teal-500/20 to-emerald-100 dark:to-emerald-500/20 border border-teal-300 dark:border-teal-500/30 mb-6"
          whileHover={{ scale: 1.1, rotate: 5 }}
        >
          <IconComponent className="w-8 h-8 text-teal-600 dark:text-teal-400" />
        </motion.div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
          <span className="text-gray-900 dark:text-white">{currentConfig.title} </span>
          <span className="bg-linear-to-r from-teal-600 dark:from-teal-400 via-emerald-600 dark:via-emerald-400 to-teal-600 dark:to-teal-500 text-transparent bg-clip-text">
            {currentConfig.highlight}
          </span>
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
          {currentConfig.description}
        </p>
      </motion.div>

      <AnimatePresence mode="wait">
        {activePage === "faq" && (
          <motion.div
            key="faq"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            {faqData.map((faq, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="group"
              >
                <button
                  onClick={() =>
                    setExpandedFaq(expandedFaq === idx ? null : idx)
                  }
                  className="w-full text-left bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/5 rounded-2xl p-6 hover:bg-gray-50 dark:hover:bg-[#161616] hover:border-teal-300 dark:hover:border-teal-500/30 transition-all duration-300 shadow-sm dark:shadow-none"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="shrink-0 w-8 h-8 rounded-lg bg-linear-to-br from-teal-100 dark:from-teal-500/20 to-emerald-100 dark:to-emerald-500/20 flex items-center justify-center text-teal-700 dark:text-teal-400 font-bold text-sm">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-gray-900 dark:text-white font-medium text-lg mb-2 group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">
                          {faq.q}
                        </h3>
                        <AnimatePresence>
                          {expandedFaq === idx && (
                            <motion.p
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="text-gray-600 dark:text-gray-400 leading-relaxed"
                            >
                              {faq.a}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                    <motion.div
                      animate={{ rotate: expandedFaq === idx ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      className="shrink-0"
                    >
                      <ChevronDown className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                    </motion.div>
                  </div>
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}

        {activePage === "terms" && (
          <motion.div
            key="terms"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {termsData.map((term, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/5 rounded-2xl p-6 sm:p-8 hover:bg-gray-50 dark:hover:bg-[#161616] hover:border-teal-300 dark:hover:border-teal-500/30 transition-all duration-300 shadow-sm dark:shadow-none"
              >
                <div className="flex items-start gap-4">
                  <div className="shrink-0 w-8 h-8 rounded-lg bg-linear-to-br from-teal-100 dark:from-teal-500/20 to-emerald-100 dark:to-emerald-500/20 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-gray-900 dark:text-white font-semibold text-xl mb-3">
                      {idx + 1}. {term.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {term.content}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {activePage === "privacy" && (
          <motion.div
            key="privacy"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {privacyData.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/5 rounded-2xl p-6 sm:p-8 hover:bg-gray-50 dark:hover:bg-[#161616] hover:border-teal-300 dark:hover:border-teal-500/30 transition-all duration-300 shadow-sm dark:shadow-none"
              >
                <div className="flex items-start gap-4">
                  <div className="shrink-0 w-8 h-8 rounded-lg bg-linear-to-br from-teal-100 dark:from-teal-500/20 to-emerald-100 dark:to-emerald-500/20 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-gray-900 dark:text-white font-semibold text-xl mb-3">
                      {idx + 1}. {item.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {item.content}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-16 text-center"
      >
        <div className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/5 rounded-full shadow-sm dark:shadow-none">
          <div className="w-2 h-2 bg-teal-600 dark:bg-teal-500 rounded-full animate-pulse" />
          <p className="text-gray-600 dark:text-gray-400 text-sm">Last updated: December 2025</p>
        </div>
      </motion.div>
    </div>
  </div>
);
};

export default LegalPages;
