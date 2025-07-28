import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ProductCard from "./ProductCard";
import "./ProductsSection.css";
import { productService } from "../../services/apiService";
import placeholderImage from "../../assets/images/placeholder-component.svg";

const ProductsSection = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);
        const response = await productService.getAllProducts();

        // Verificar que la respuesta tenga el formato esperado
        if (!response || !response.success || !response.data) {
          throw new Error("Formato de respuesta inválido");
        }

        // Tomar solo los primeros 5 productos
        const products = response.data.slice(0, 5);

        // Transformar los productos al formato esperado por ProductCard
        const transformedProducts = products.map((product) => ({
          id: product.id_producto,
          image: product.imagen_optimizada
            ? `http://localhost:8080/uploads/productos/${product.imagen_optimizada}`
            : product.imagen_principal || placeholderImage,
          title: product.nombre,
          description: product.descripcion,
          price: product.precio,
        }));

        setFeaturedProducts(transformedProducts);
        setError(null);
      } catch (err) {
        console.error("Error al obtener productos destacados:", err);
        setError("No se pudieron cargar los productos destacados");
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  return (
    <section className="escomparte__products" id="products">
      <h2 className="escomparte__section-title">Productos Destacados</h2>
      {loading ? (
        <div className="escomparte__loading">
          <p>Cargando productos destacados...</p>
        </div>
      ) : error ? (
        <div className="escomparte__error">
          <p>{error}</p>
        </div>
      ) : (
        <div className="escomparte__product-container">
          <div className="escomparte__product-list">
            {featuredProducts.map((product) => (
              <Link
                to={`/productos/${product.id}`}
                key={product.id}
                className="escomparte__product-link"
              >
                <ProductCard
                  image={product.image}
                  title={product.title}
                  description={product.description}
                  price={product.price}
                />
              </Link>
            ))}
          </div>
          <div className="escomparte__view-all">
            <Link
              to="/productos"
              className="escomparte__button escomparte__button--secondary"
            >
              Ver todos los productos
            </Link>
          </div>
        </div>
      )}
    </section>
  );
};

export default ProductsSection;
