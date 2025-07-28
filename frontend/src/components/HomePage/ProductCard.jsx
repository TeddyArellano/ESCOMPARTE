import React from "react";
import "./ProductCard.css";

const ProductCard = ({ image, title, description, price }) => (
  <article className="escomparte__product-card">
    <img className="escomparte__product-image" src={image} alt={title} />
    <div className="escomparte__product-info">
      <h3 className="escomparte__product-title">{title}</h3>
      <p className="escomparte__product-description">{description}</p>
      {price && <p className="escomparte__product-price">${price} MXN</p>}
      <button className="escomparte__button">Ver más</button>
    </div>
  </article>
);

export default ProductCard;
