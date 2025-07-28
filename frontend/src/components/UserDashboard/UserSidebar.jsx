import React from 'react';

const UserSidebar = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'profile', label: 'Información Personal', icon: 'user' },
    { id: 'orders', label: 'Historial de Pedidos', icon: 'package' },
    { id: 'settings', label: 'Configuración', icon: 'settings' }
  ];

  return (
    <div className="user-sidebar">
      <div className="user-sidebar__menu">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`user-sidebar__item ${activeTab === tab.id ? 'user-sidebar__item--active' : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            <span className={`user-sidebar__icon user-sidebar__icon--${tab.icon}`}>
              {tab.icon === 'user' && (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M230.92,212c-15.23-26.33-38.7-45.21-66.09-54.16a72,72,0,1,0-73.66,0C63.78,166.78,40.31,185.66,25.08,212a8,8,0,1,0,13.85,8c18.84-32.56,52.14-52,89.07-52s70.23,19.44,89.07,52a8,8,0,1,0,13.85-8ZM72,96a56,56,0,1,1,56,56A56.06,56.06,0,0,1,72,96Z" />
                </svg>
              )}
              {tab.icon === 'package' && (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M223.68,66.15,135.68,18a15.88,15.88,0,0,0-15.36,0l-88,48.17a16,16,0,0,0-8.32,14v95.64a16,16,0,0,0,8.32,14l88,48.17a15.88,15.88,0,0,0,15.36,0l88-48.17a16,16,0,0,0,8.32-14V80.18A16,16,0,0,0,223.68,66.15ZM128,32l80.34,44L128,120,47.66,76ZM40,90l80,43.78v85.79L40,175.82Zm96,129.57V133.82L216,90v85.78Z" />
                </svg>
              )}
              {tab.icon === 'settings' && (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M128,80a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160Zm88-29.84q.06-2.16,0-4.32l14.92-18.64a8,8,0,0,0,1.48-7.06,107.21,107.21,0,0,0-10.88-26.25,8,8,0,0,0-6-3.93l-23.72-2.64q-1.48-1.56-3-3l-2.64-23.76a8,8,0,0,0-3.93-6,107.71,107.71,0,0,0-26.25-10.87,8,8,0,0,0-7.07,1.49L130.16,39.94c-1.44,0-2.88-.06-4.32,0L107.2,25A8,8,0,0,0,100.13,23.6a107.71,107.71,0,0,0-26.25,10.87,8,8,0,0,0-3.93,6L67.31,64.27c-1,.93-2,1.89-3,3L40.55,69.88a8,8,0,0,0-6,3.93,107.21,107.21,0,0,0-10.88,26.25,8,8,0,0,0,1.48,7.06L40.06,125.76q-.06,2.16,0,4.32L25.14,148.72a8,8,0,0,0-1.48,7.06,107.71,107.71,0,0,0,10.88,26.25,8,8,0,0,0,6,3.93l23.72,2.64q1.49,1.56,3,3l2.64,23.76a8,8,0,0,0,3.93,6,107.71,107.71,0,0,0,26.25,10.87,8,8,0,0,0,7.07-1.49l18.64-14.92c1.44,0,2.88.06,4.32,0l18.64,14.92a8,8,0,0,0,7.07,1.49,107.21,107.21,0,0,0,26.25-10.87,8,8,0,0,0,3.93-6l2.64-23.76c1-.93,2-1.89,3-3l23.72-2.64a8,8,0,0,0,6-3.93,107.71,107.71,0,0,0,10.88-26.25,8,8,0,0,0-1.48-7.06ZM128,168a40,40,0,1,1,40-40A40,40,0,0,1,128,168Z" />
                </svg>
              )}
            </span>
            <span className="user-sidebar__label">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default UserSidebar;
