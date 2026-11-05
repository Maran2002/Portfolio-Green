"use client";

import React, { useEffect } from "react";
import Home from "./Home";
import About from "./About";
import MyServices from "./MyServices";
import MySkills from "./MySkills";
import Projects from "./Projects";
import ContactForm from "./ContactForm";
import Workflow from "./Workflow";
import PageTransition from "./common/PageTransition";

const Welcome = () => {
  useEffect(() => {
    if (window.location.hash) {
      const id = window.location.hash.replace("#", "");
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) {
          window.scrollTo({
            top: el.getBoundingClientRect().top + window.scrollY - 20,
            behavior: "smooth",
          });
        }
      }, 150);
    }
  }, []);
  return (
    <PageTransition variant="fade">
      {/* pt-14 clears the mobile top bar; sidebar on desktop needs no top offset */}
      <div className="public-site pt-14 lg:pt-0">
      <div>
        <Home />
      </div>
      <div>
        <About />
      </div>
      <div>
        <MyServices />
      </div>
      <div>
        <Projects />
      </div>
      <div>
        <Workflow />
      </div>
      <div>
        <MySkills />
      </div>
      <div>
        <ContactForm />
      </div>
      </div>
    </PageTransition>
  );
};

export default Welcome;
