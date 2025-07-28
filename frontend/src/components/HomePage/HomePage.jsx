import React from "react";
import "./HomePage.css";
import Header from "../layout/Header";
import Footer from "../layout/Footer";
import AboutSection from "./AboutSection";
import HeroSection from "./HeroSection";
import ProductsSection from "./ProductsSection";
import CategorySection from "./CategorySection";
import CommunitySection from "./CommunitySection";


const HomePage = () => {
  return (
    <div className="escomparte">
      <Header />
      <div className="escomparte__container">
        <main className="escomparte__main">
          <HeroSection />
          <ProductsSection />
          <CategorySection />
          <AboutSection />
          <CommunitySection />
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default HomePage;
