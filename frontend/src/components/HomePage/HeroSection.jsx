import React from "react";
import { Link } from "react-router-dom";
import "./HeroSection.css";

const HeroSection = () => {
  return (
    <section className="escomparte__hero">
      <div className="escomparte__hero-overlay">
        <div className="escomparte__hero-content">
          <h2 className="escomparte__hero-title">Componentes al alcance de la ESCOMunidad</h2>          <p className="escomparte__hero-subtitle">
            Intercambia, dona o adquiere componentes electrónicos y materiales para tus proyectos académicos. 
            Desde resistencias básicas hasta microcontroladores avanzados, encuentra todo lo que necesitas para dar vida a tus ideas.
          </p>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
