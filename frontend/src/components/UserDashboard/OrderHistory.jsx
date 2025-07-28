import React from 'react';
import { Link } from 'react-router-dom';

const OrderHistory = ({ orders = [] }) => {
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'completado':
        return 'order-history__status--completed';
      case 'procesando':
        return 'order-history__status--processing';
      case 'cancelado':
        return 'order-history__status--cancelled';
      default:
        return 'order-history__status--active';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  return (
    <div className="order-history">
      <div className="order-history__header">
        <h2 className="order-history__title">Historial de Pedidos</h2>
      </div>

      {orders.length === 0 ? (
        <div className="order-history__empty">
          <div className="order-history__empty-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 256 256">
              <path d="M223.68,66.15,135.68,18a15.88,15.88,0,0,0-15.36,0l-88,48.17a16,16,0,0,0-8.32,14v95.64a16,16,0,0,0,8.32,14l88,48.17a15.88,15.88,0,0,0,15.36,0l88-48.17a16,16,0,0,0,8.32-14V80.18A16,16,0,0,0,223.68,66.15ZM128,32l80.34,44L128,120,47.66,76ZM40,90l80,43.78v85.79L40,175.82Zm96,129.57V133.82L216,90v85.78Z" />
            </svg>
          </div>
          <h3 className="order-history__empty-title">No tienes pedidos</h3>
          <p className="order-history__empty-text">
            Parece que aún no has realizado ningún pedido. Explora nuestros productos y realiza tu primera compra.
          </p>
          <Link to="/productos" className="order-history__empty-button">
            Explorar Productos
          </Link>
        </div>
      ) : (
        <div className="order-history__list">
          {orders.map((order) => (
            <div key={order.id_carrito} className="order-history__item">
              <div className="order-history__item-header">
                <div className="order-history__order-info">
                  <span className="order-history__order-id">Pedido #{order.id_carrito}</span>
                  <span className="order-history__order-date">{formatDate(order.fecha_creacion)}</span>
                </div>
                <div className={`order-history__status ${getStatusBadgeClass(order.estado)}`}>
                  {order.estado === 'activo' ? 'En proceso' : 
                   order.estado === 'procesando' ? 'Procesando' : 
                   order.estado === 'completado' ? 'Completado' : 'Cancelado'}
                </div>
              </div>
              
              <div className="order-history__products">
                {order.items.map((item) => (
                  <div key={item.id_item_carrito} className="order-history__product">
                    <div className="order-history__product-image">
                      <img src={item.imagen_principal || 'https://via.placeholder.com/60'} alt={item.nombre} />
                    </div>
                    <div className="order-history__product-info">
                      <Link to={`/productos/${item.id_producto}`} className="order-history__product-name">
                        {item.nombre}
                      </Link>
                      <div className="order-history__product-details">
                        <span className="order-history__product-quantity">Cantidad: {item.cantidad}</span>
                        <span className="order-history__product-price">{formatCurrency(item.precio_unitario)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="order-history__item-footer">
                <div className="order-history__total">
                  <span className="order-history__total-label">Total:</span>
                  <span className="order-history__total-amount">
                    {formatCurrency(order.total)}
                  </span>
                </div>
                <Link 
                  to={`/pedidos/${order.id_carrito}`} 
                  className="order-history__detail-link"
                >
                  Ver Detalles
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
