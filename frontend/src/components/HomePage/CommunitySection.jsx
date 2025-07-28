import React from "react";
import "./CommunitySection.css";

const CommunitySection = () => {
  return (
    <section className="escomparte__community" id="community">
      <div className="escomparte__community-container">
        <h2 className="escomparte__section-title">Únete a Nuestra Comunidad</h2>
        <p className="escomparte__text">
          Conecta con otros entusiastas de la electrónica, comparte tus proyectos y recibe apoyo.
          Forma parte de nuestra red de estudiantes y profesionales de ESCOM.
        </p>
        <div className="escomparte__community-features">
          <div className="escomparte__community-feature">
            <div className="escomparte__community-icon">💡</div>
            <h3>Comparte Ideas</h3>
            <p>Intercambia conocimientos y propuestas para mejorar tus proyectos.</p>
          </div>
          <div className="escomparte__community-feature">
            <div className="escomparte__community-icon">🛠️</div>
            <h3>Colabora</h3>
            <p>Encuentra compañeros para colaborar en proyectos académicos y personales.</p>
          </div>
          <div className="escomparte__community-feature">
            <div className="escomparte__community-icon">📚</div>
            <h3>Aprende</h3>
            <p>Accede a recursos educativos compartidos por la comunidad.</p>
          </div>
        </div>
        <button className="escomparte__button escomparte__button--primary">Unirse Ahora</button>
      </div>
    </section>
  );
};

export default CommunitySection;
