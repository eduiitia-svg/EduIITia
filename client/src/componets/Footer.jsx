import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import { Link } from "react-router-dom";
const Footer = () => {
  return (
    <footer className="bg-white dark:bg-transparent text-gray-600 dark:text-gray-400 mt-10 border-t border-gray-200 dark:border-teal-800/50 rounded-tl-2xl rounded-tr-2xl">
      <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2 md:col-span-1">
          <h2 className="text-3xl font-bold text-teal-600 dark:text-teal-400 tracking-wider">
            EduIITia
          </h2>
          <p className="text-sm mt-4 leading-relaxed text-gray-500 dark:text-gray-500">
            "This platform is a software service provider and does not conduct
            or certify examinations. All academic decisions are the
            responsibility of the respective institutions."
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-lg mb-4 text-teal-600 dark:text-teal-300">
            Quick Links
          </h3>
          <ul className="space-y-3 text-sm">
            <li>
              <Link
                to="#"
                className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to="#"
                className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
              >
                About
              </Link>
            </li>
            <li>
              <Link
                to="#"
                className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
              >
                Quizzes
              </Link>
            </li>
            <li>
              <Link
                to="#"
                className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
              >
                Contact
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-lg mb-4 text-teal-600 dark:text-teal-300">
            Support
          </h3>
          <ul className="space-y-3 text-sm">
            <li>
              <Link
                to="/legal-terms/faq"
                className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
              >
                FAQs
              </Link>
            </li>
            <li>
              <Link
                to="/legal-terms/privacy"
                className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
              >
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link
                to="/legal-terms/terms"
                className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
              >
                Terms & Conditions
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-lg mb-4 text-teal-600 dark:text-teal-300">
            Connect with Us
          </h3>
          <div className="flex space-x-5 mt-2">
            <Link
              to={"https://www.facebook.com/profile.php?id=61585658732308"}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="text-gray-500 dark:text-gray-500 hover:text-teal-600 dark:hover:text-teal-400 transition-colors duration-300 transform hover:scale-110"
            >
              <Facebook className="h-6 w-6" />
            </Link>
            <Link
              to="#"
              aria-label="Twitter"
              className="text-gray-500 dark:text-gray-500 hover:text-teal-600 dark:hover:text-teal-400 transition-colors duration-300 transform hover:scale-110"
            >
              <Twitter className="h-6 w-6" />
            </Link>
            <Link
              to="#"
              aria-label="Instagram"
              className="text-gray-500 dark:text-gray-500 hover:text-teal-600 dark:hover:text-teal-400 transition-colors duration-300 transform hover:scale-110"
            >
              <Instagram className="h-6 w-6" />
            </Link>
            <Link
              to="#"
              aria-label="LinkedIn"
              className="text-gray-500 dark:text-gray-500 hover:text-teal-600 dark:hover:text-teal-400 transition-colors duration-300 transform hover:scale-110"
            >
              <Linkedin className="h-6 w-6" />
            </Link>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-teal-900 py-6 text-center text-xs text-gray-500 dark:text-gray-600">
        © {new Date().getFullYear()} EduIITia. All rights reserved. Empowering
        next-gen learning.
      </div>
    </footer>
  );
};

export default Footer;
