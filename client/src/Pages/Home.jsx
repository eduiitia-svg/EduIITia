import Hero from "../componets/Hero";
import GetAllTest from "../componets/test/GetAllTest";
import AboutPage from "../componets/AboutPage";
import Pricing from "../componets/subscription-model/Pricing";
import ContactPage from "../componets/ContactPage";
 import AppLayout from "../layout/AppLayout";
import Testimonials from "../componets/Testimonials";

const Home = () => {

  return (
    <AppLayout>
      <div id="hero">
        <Hero />
      </div>
      <div id="test">
        <GetAllTest/>
      </div>
      <div id="testimonial">
        <Testimonials/>
      </div>
      <div id="about">
        <AboutPage />
      </div>
      <div id="pricing">
        <Pricing />
      </div>
      <div id="contact-us">
        <ContactPage />
      </div>
    </AppLayout>
  );
};

export default Home;
