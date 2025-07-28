// Este script verifica el estado de la autenticación
// Ejecútalo en la consola del navegador después de iniciar sesión

(function testAuthState() {
  console.group('Test de autenticación');
  
  // Verificar si hay un token guardado
  const token = localStorage.getItem('token');
  console.log('Token disponible:', token ? `Sí (longitud: ${token.length})` : 'No');
  
  // Verificar si hay datos de usuario guardados
  const userDataStr = localStorage.getItem('escomparte_user');
  console.log('Datos de usuario guardados:', userDataStr ? 'Sí' : 'No');
  
  if (userDataStr) {
    try {
      const userData = JSON.parse(userDataStr);
      console.log('Usuario:', {
        nombre: userData.nombre || 'N/A',
        username: userData.username || 'N/A',
        id: userData.id_usuario || 'N/A'
      });
      console.log('Token en userData:', userData.token ? `Sí (longitud: ${userData.token.length})` : 'No');
    } catch (err) {
      console.error('Error al parsear datos de usuario:', err);
    }
  }
  
  // Probar una solicitud a la API protegida
  console.log('Realizando prueba de solicitud a la API...');
  
  fetch('/api/carrito', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    }
  })
  .then(response => {
    console.log('Respuesta de API status:', response.status);
    return response.json().catch(() => ({ error: 'No se pudo parsear la respuesta' }));
  })
  .then(data => {
    console.log('Respuesta de API data:', data);
  })
  .catch(err => {
    console.error('Error en solicitud de prueba:', err);
  });
  
  console.groupEnd();
})();
