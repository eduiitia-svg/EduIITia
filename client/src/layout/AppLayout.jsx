import React, { useEffect } from "react";
import Navbar from "../componets/Navbar";
import Footer from "../componets/Footer";
import { useLocation } from "react-router";

const AppLayout = ({ children }) => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  const handleScroll = (e, id) => {
    e.preventDefault();
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div>
      <Navbar handleScroll={handleScroll} />
      {children}
      <Footer />
    </div>
  );
};

export default AppLayout;
