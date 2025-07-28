import React from "react";
import "./CategorySection.css";
import arduinoMega from "../../assets/images/categories/microcontroladores.webp";
import kitResistencias from "../../assets/images/categories/componentes_pasivos.jpg";
import sensoresUltrasonicos from "../../assets/images/categories/sensores.jpg";

const CategorySection = () => {  const categories = [
    {
      image: arduinoMega,
      title: "Microcontroladores",
      alt: "Categoría de Microcontroladores"
    },
    {
      image: kitResistencias,
      title: "Componentes Pasivos",
      alt: "Categoría de Componentes Pasivos"
    },
    {
      image: sensoresUltrasonicos,
      title: "Sensores",
      alt: "Categoría de Sensores"
    },
    {
      image: "/src/assets/images/hero-background.png",
      title: "Materiales Didácticos",
      alt: "Categoría de Materiales Didácticos"
    }
  ];

  return (
    <section className="escomparte__categories" id="categories">
      <h2 className="escomparte__section-title">Explorar Categorías</h2>
      <div className="escomparte__category-list">
        {categories.map((category, index) => (
          <article className="escomparte__category-card" key={index}>
            <img 
              className="escomparte__category-image"
              src={category.image}
              alt={category.alt}
            />
            <h3 className="escomparte__category-title">{category.title}</h3>
          </article>
        ))}
      </div>
    </section>
  );
};

export default CategorySection;
