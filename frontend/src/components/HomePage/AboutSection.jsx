import React from "react";
import "./AboutSection.css";
import mascotaImage from "../../assets/images/mascota.png";

const AboutSection = () => {  return (
    <section className="escomparte__about" id="about">
      <div className="escomparte__about-container">
        <div className="escomparte__about-content">        
          <h2 className="escomparte__section-title">
            Acerca de Nosotros
          </h2>

          <p className="escomparte__text">
            ESCOMparte es una iniciativa desarrollada por estudiantes de la Escuela Superior de Cómputo (ESCOM-IPN), pensada para fortalecer la colaboración y el acceso a recursos entre toda la comunidad académica. Nuestra misión es ofrecer una plataforma segura, funcional y exclusiva que permita a los estudiantes, profesores y egresados intercambiar, donar o vender componentes electrónicos, materiales académicos y proyectos estudiantiles de forma sencilla y confiable.
          </p>
          <p className="escomparte__text">
            Sabemos que en ESCOM la innovación y los proyectos técnicos requieren herramientas específicas que no siempre están al alcance de todos. Por eso, creamos ESCOMparte como una solución accesible, sustentable y hecha por y para la ESCOMunidad, donde cada componente cuenta y cada usuario puede apoyar o ser apoyado.
          </p>
          <p className="escomparte__text">
            Creemos en la economía colaborativa, en el aprendizaje compartido y en el poder de la comunidad para generar soluciones reales.
          </p>
        </div>
        <div className="escomparte__about-mascot">
          <img 
            src={mascotaImage} 
            alt="Mascota de ESCOMparte" 
            className="escomparte__mascot-image" 
          />
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
