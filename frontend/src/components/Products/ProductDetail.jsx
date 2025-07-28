import React, { useState, useEffect, useContext } from "react";
import Header from "../layout/Header";
import Footer from "../layout/Footer";
import { useParams, Link, useNavigate } from "react-router-dom";
import "./ProductDetail.css";
import placeholderImage from "../../assets/images/placeholder-component.svg";
import { productService } from "../../services/apiService";
import { CartContext } from "../../contexts/CartContext";

const ProductDetail = () => {
  // Obtenemos el ID del producto de los parámetros de la URL
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('descripcion');
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartMessage, setCartMessage] = useState(null);
  
  // Acceder al contexto del carrito
  const { addToCart } = useContext(CartContext);

  // Obtener los detalles del producto desde la API
  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        const response = await productService.getProductById(id);
        
        // Verificar que la respuesta tenga el formato esperado
        if (!response || !response.success) {
          throw new Error("Formato de respuesta inválido");
        }
        
        const productData = response.data;          // Transformar los datos del producto al formato esperado por el componente
        const transformedProduct = {
          id: productData.id_producto,
          name: productData.nombre,
          description: productData.descripcion,
          category: "componentes_electronicos", // Valor por defecto, podría cambiarse si la API proporciona categorías
          price: productData.precio,
          condition: productData.estado,
          availability: productData.existencia > 0 ? 
            (productData.existencia < 5 ? "pocas_unidades" : "disponible") : 
            "agotado",
          // Usar la mejor imagen disponible
          image: productData.images && productData.images.length > 0 
            ? (productData.images[0].nombre_optimizado 
                ? `http://localhost:8080/uploads/productos/${productData.images[0].nombre_optimizado}`
                : productData.images[0].url_imagen)
            : placeholderImage,
          longDescription: productData.descripcion,
          features: [], // Por defecto, vacío
          inStock: productData.existencia,
          images: productData.images || [],
          vendorInfo: {
            name: productData.nombre_usuario,
            lastName: productData.apellido_usuario,
            email: productData.correo_usuario
          }
        };
        
        setProduct(transformedProduct);
        
        // Obtener productos relacionados (en este caso, simplemente obtenemos algunos productos)
        fetchRelatedProducts();
        
      } catch (err) {
        console.error("Error al obtener los detalles del producto:", err);
        setError("No se pudo cargar la información del producto. Por favor, intente más tarde.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchProductDetails();
  }, [id]);
  
  // Función para obtener productos relacionados
  const fetchRelatedProducts = async () => {
    try {
      // Obtenemos todos los productos y seleccionamos algunos al azar
      const response = await productService.getAllProducts();
      
      if (!response || !response.success || !response.data) {
        throw new Error("Formato de respuesta inválido para productos relacionados");
      }
      
      const allProducts = response.data;
      
      // Transformar productos y excluir el producto actual
      const transformed = allProducts
        .filter(p => p.id_producto !== parseInt(id))
        .map(p => ({
          id: p.id_producto,
          name: p.nombre,
          description: p.descripcion,
          category: "componentes_electronicos",
          price: p.precio,
          condition: p.estado,
          availability: p.existencia > 0 ? 
            (p.existencia < 5 ? "pocas_unidades" : "disponible") : 
            "agotado",
          image: p.imagen_optimizada 
            ? `http://localhost:8080/uploads/productos/${p.imagen_optimizada}` 
            : (p.imagen_principal || placeholderImage)
        }));
      
      // Seleccionar hasta 3 productos aleatorios
      const randomSelection = transformed
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.min(3, transformed.length));
        
      setRelatedProducts(randomSelection);
    } catch (err) {
      console.error("Error al obtener productos relacionados:", err);
      // No establecemos error aquí para no afectar la visualización del producto principal
    }
  };

  // Función para verificar la existencia del token
  const verifyTokenExists = () => {
    const token = localStorage.getItem('token');
    console.log("Token disponible:", token ? "Sí (longitud: " + token.length + ")" : "No");
    return !!token;
  };
  
  // Función para manejar la adición del producto al carrito
  const handleAddToCart = async () => {
    if (!product) return;
    
    // Verificar si existe el token antes de continuar
    if (!verifyTokenExists()) {
      setCartMessage({ type: 'error', text: 'Debe iniciar sesión para agregar productos al carrito' });
      return;
    }
    
    try {
      setAddingToCart(true);
      setCartMessage(null);
      
      console.log("Intentando agregar al carrito:", { 
        productId: product.id, 
        quantity 
      });
      
      const result = await addToCart(product.id, quantity);
      
      console.log("Resultado de agregar al carrito:", result);
      
      if (result.success) {
        setCartMessage({ type: 'success', text: 'Producto agregado al carrito exitosamente' });
      } else {
        setCartMessage({ type: 'error', text: result.message });
      }
    } catch (err) {
      console.error('Error al agregar al carrito:', err);
      setCartMessage({ type: 'error', text: 'Error al agregar producto al carrito' });
    } finally {
      setAddingToCart(false);
      
      // Ocultar el mensaje después de 3 segundos
      setTimeout(() => {
        setCartMessage(null);
      }, 3000);
    }
  };
  
  // Incrementar cantidad
  const incrementQuantity = () => {
    if (product && quantity < product.inStock) {
      setQuantity(prev => prev + 1);
    }
  };
  
  // Decrementar cantidad
  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  if (loading) {
    return (
      <div className="escomparte">
        <Header />
        <div className="escomparte__container">
          <main className="product-detail">
            <div className="product-detail__loading">
              <p>Cargando información del producto...</p>
            </div>
          </main>
          <Footer />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="escomparte">
        <Header />
        <div className="escomparte__container">
          <main className="product-detail">
            <div className="product-detail__error">
              <h2>Error</h2>
              <p>{error || "Producto no encontrado"}</p>
              <button onClick={() => navigate('/productos')} className="escomparte__button">
                Volver al catálogo
              </button>
            </div>
          </main>
          <Footer />
        </div>
      </div>
    );
  }

  return (
    <div className="escomparte">
      <Header />
      <div className="escomparte__container">
        <main className="product-detail">
          <div className="product-detail__breadcrumb">
            <Link to="/">Inicio</Link> / <Link to="/productos">Productos</Link> / <span>{product.name}</span>
          </div>
          
          <div className="product-detail__content">
            <div className="product-detail__image-container">
              <img className="product-detail__image" src={product.image} alt={product.name} />
              {product.condition === "usado" && (
                <div className="product-detail__badge product-detail__badge--used">
                  Usado
                </div>
              )}
            </div>
            
            <div className="product-detail__info">
              <h1 className="product-detail__title">{product.name}</h1>
              
              <div className="product-detail__meta">
                <span className="product-detail__category">Categoría: {product.category}</span>
                <span className="product-detail__availability">
                  {product.inStock > 0 ? `${product.inStock} unidades disponibles` : "Agotado"}
                </span>
              </div>
              
              <div className="product-detail__price-container">
                <span className="product-detail__price">${product.price} MXN</span>
              </div>
              
              <p className="product-detail__description">{product.description}</p>
              
              {product.inStock > 0 && (
                <div className="product-detail__quantity-selector">
                  <span className="product-detail__quantity-label">Cantidad:</span>
                  <div className="product-detail__quantity-controls">
                    <button 
                      className="product-detail__quantity-btn" 
                      onClick={decrementQuantity}
                      disabled={quantity <= 1}
                    >
                      -
                    </button>
                    <span className="product-detail__quantity-value">{quantity}</span>
                    <button 
                      className="product-detail__quantity-btn" 
                      onClick={incrementQuantity}
                      disabled={quantity >= product.inStock}
                    >
                      +
                    </button>
                  </div>
                </div>
              )}
              
              {cartMessage && (
                <div className={`product-detail__cart-message product-detail__cart-message--${cartMessage.type}`}>
                  {cartMessage.text}
                </div>
              )}
              
              <div className="product-detail__actions">
                {product.inStock > 0 ? (
                  <button 
                    className="product-detail__button product-detail__button--cart"
                    onClick={handleAddToCart}
                    disabled={addingToCart}
                  >
                    {addingToCart ? "Añadiendo..." : "Añadir al Carrito"}
                  </button>
                ) : (
                  <button className="product-detail__button product-detail__button--disabled" disabled>
                    Agotado
                  </button>
                )}
                <button className="product-detail__button product-detail__button--secondary">
                  Añadir a Favoritos
                </button>
              </div>
              
              {product.vendorInfo && (
                <div className="product-detail__vendor-info">
                  <h3>Información del Vendedor</h3>
                  <p>
                    <strong>Nombre:</strong> {product.vendorInfo.name} {product.vendorInfo.lastName}<br />
                    <strong>Contacto:</strong> {product.vendorInfo.email}
                  </p>
                </div>
              )}
            </div>
          </div>
          
          <div className="product-detail__tabs">
            <div className="product-detail__tab-headers">
              <div 
                className={`product-detail__tab-header ${activeTab === 'descripcion' ? 'product-detail__tab-header--active' : ''}`}
                onClick={() => setActiveTab('descripcion')}
              >
                Descripción
              </div>
              <div 
                className={`product-detail__tab-header ${activeTab === 'caracteristicas' ? 'product-detail__tab-header--active' : ''}`}
                onClick={() => setActiveTab('caracteristicas')}
              >
                Características
              </div>
              <div 
                className={`product-detail__tab-header ${activeTab === 'compartir' ? 'product-detail__tab-header--active' : ''}`}
                onClick={() => setActiveTab('compartir')}
              >
                Compartir
              </div>
            </div>
            
            <div className="product-detail__tab-content">
              {activeTab === 'descripcion' && (
                <div className="product-detail__tab-panel">
                  <p>{product.longDescription}</p>
                </div>
              )}
              
              {activeTab === 'caracteristicas' && (
                <div className="product-detail__tab-panel">
                  {product.features && product.features.length > 0 ? (
                    <ul className="product-detail__features">
                      {product.features.map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>No hay características detalladas disponibles para este producto.</p>
                  )}
                </div>
              )}
              
              {activeTab === 'compartir' && (
                <div className="product-detail__tab-panel">
                  <div className="product-detail__share">
                    <h3>Comparte este producto</h3>
                    <div className="product-detail__share-buttons">
                      <button className="product-detail__share-button product-detail__share-button--facebook">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M18.77,7.46H14.5V10.24h4.27V13H14.5v9.83H10.73V13H6.5V10.24h4.23V7.46a4,4,0,0,1,4-4h4.27v4"></path>
                        </svg>
                        Facebook
                      </button>
                      <button className="product-detail__share-button product-detail__share-button--twitter">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M22.46,6c-.77.35-1.6.58-2.46.69.88-.53,1.56-1.37,1.88-2.38-.83.5-1.75.85-2.72,1.05C18.37,4.5,17.26,4,16,4c-2.35,0-4.27,1.92-4.27,4.29,0,.34,0,.67.11,1-3.56-.18-6.73-1.89-8.84-4.48-.37.63-.58,1.37-.58,2.15,0,1.49.75,2.81,1.91,3.56-.71,0-1.37-.2-1.95-.5v.03c0,2.08,1.48,3.82,3.44,4.21a4.22,4.22,0,0,1-1.93.07,4.28,4.28,0,0,0,4,2.98,8.521,8.521,0,0,1-5.33,1.84,8.39,8.39,0,0,1-1.02-.06A12.087,12.087,0,0,0,8.12,21,11.965,11.965,0,0,0,20.34,9.147c0-.183,0-.366-.013-.548A8.491,8.491,0,0,0,22.46,6Z"></path>
                        </svg>
                        Twitter
                      </button>
                      <button className="product-detail__share-button product-detail__share-button--whatsapp">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M16.75,13.96C17,14.09 17.16,14.16 17.21,14.26C17.27,14.37 17.25,14.87 17,15.44C16.8,16 15.76,16.54 15.3,16.56C14.84,16.58 14.83,16.92 12.34,15.83C9.85,14.74 8.35,12.08 8.23,11.91C8.11,11.74 7.27,10.53 7.31,9.3C7.36,8.08 8,7.5 8.26,7.26C8.5,7 8.77,6.97 8.94,7H9.41C9.56,7 9.77,6.94 9.96,7.45L10.65,9.32C10.71,9.45 10.75,9.6 10.66,9.76L10.39,10.17L10,10.59C9.88,10.71 9.74,10.84 9.88,11.09C10,11.35 10.5,12.18 11.2,12.87C12.11,13.75 12.91,14.04 13.15,14.17C13.39,14.31 13.54,14.29 13.69,14.13L14.5,13.19C14.69,12.94 14.85,13 15.08,13.08L16.75,13.96M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22C8.84,22 5.85,20.5 3.8,17.94L2,22L2.36,17.77C2.13,16.95 2,16 2,15C2,8.72 6.72,4 13,4C17.42,4 20.44,7.37 20.5,11H19A8,8 0 0,0 12,4Z"></path>
                        </svg>
                        WhatsApp
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {relatedProducts.length > 0 && (
            <div className="product-detail__related">
              <h2 className="product-detail__related-title">Productos Relacionados</h2>
              <div className="product-detail__related-list">
                {relatedProducts.map(relatedProduct => (
                  <div className="product-card" key={relatedProduct.id}>
                    <div className="product-image">
                      <img src={relatedProduct.image} alt={relatedProduct.name} />
                      {relatedProduct.availability === "pocas_unidades" && (
                        <div className="product-badge product-badge--low-stock">
                          ¡Pocas unidades!
                        </div>
                      )}
                      {relatedProduct.condition === "usado" && (
                        <div className="product-badge product-badge--used">
                          Usado
                        </div>
                      )}
                    </div>
                    <div className="product-info">
                      <h3 className="product-title">{relatedProduct.name}</h3>
                      <p className="product-description">{relatedProduct.description}</p>
                      <div className="product-meta">
                        <span className="product-price">${relatedProduct.price} MXN</span>
                        <Link to={`/productos/${relatedProduct.id}`} className="product-action">Ver Detalles</Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default ProductDetail;
