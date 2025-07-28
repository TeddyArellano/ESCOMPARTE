import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { userService } from '../../services/apiService';
import Header from '../layout/Header';
import Footer from '../layout/Footer';
import UserProfile from './UserProfile';
import OrderHistory from './OrderHistory';
import UserSidebar from './UserSidebar';
import './UserDashboard.css';

const UserDashboard = () => {
  const { isAuthenticated, user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [userData, setUserData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!isAuthenticated()) {
        setError('Debe iniciar sesión para ver esta página');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('Fetching user data in dashboard component...');
        
        // Fetch user data
        const userDataResponse = await userService.getUserDetails();
        console.log('UserDashboard received:', userDataResponse);
        
        if (userDataResponse && userDataResponse.success && userDataResponse.user) {
          setUserData(userDataResponse.user);
          setError(null);
          
          // Fetch order history if needed
          if (activeTab === 'orders') {
            const ordersResponse = await userService.getOrderHistory();
            if (ordersResponse && ordersResponse.success) {
              setOrders(ordersResponse.orders || []);
            }
          }
        } else {
          console.error('Invalid user data response:', userDataResponse);
          setError('Error al cargar los datos del usuario: Formato de respuesta inválido');
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError(`Error al cargar los datos del usuario: ${err.message || 'Error desconocido'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [isAuthenticated, activeTab]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const renderContent = () => {
    if (loading) {
      return <div className="user-dashboard__loading">Cargando...</div>;
    }

    if (error) {
      return <div className="user-dashboard__error">{error}</div>;
    }

    switch (activeTab) {
      case 'profile':
        return <UserProfile userData={userData} />;
      case 'orders':
        return <OrderHistory orders={orders} />;
      default:
        return <UserProfile userData={userData} />;
    }
  };

  return (
    <div className="escomparte">
      <Header />
      <div className="escomparte__container">
        <main className="user-dashboard">
          <h1 className="user-dashboard__title">Mi Perfil</h1>
          
          <div className="user-dashboard__content">
            <UserSidebar activeTab={activeTab} onTabChange={handleTabChange} />
            <div className="user-dashboard__main">
              {renderContent()}
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default UserDashboard;
