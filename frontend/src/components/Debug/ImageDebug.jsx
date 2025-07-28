import React, { useState, useEffect } from 'react';

const ImageDebug = () => {
  const [testResults, setTestResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState('');

  useEffect(() => {
    // Probar las rutas de imágenes
    const checkImages = async () => {
      try {
        setLoading(true);
        
        // Llamar a la API para obtener información de imágenes
        const response = await fetch('/api/check-images');
        const data = await response.json();
        
        setTestResults(data);
        
        if (data.success && data.config.availableFiles.length > 0) {
          setSelectedImage(data.config.availableFiles[0]);
        }
      } catch (err) {
        console.error('Error checking images:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    checkImages();
  }, []);

  if (loading) {
    return <div>Cargando información de imágenes...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!testResults || !testResults.success) {
    return <div>No se pudo obtener información de imágenes</div>;
  }

  const { config } = testResults;

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Depuración de Imágenes</h1>
      
      <div style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ddd' }}>
        <h2>Configuración del Servidor</h2>
        <ul>
          <li>Ruta de imágenes: {config.imagesPath}</li>
          <li>Carpeta existe: {config.folderExists ? '✅ Sí' : '❌ No'}</li>
          <li>Número de archivos: {config.availableFiles.length}</li>
        </ul>
      </div>
      
      {config.availableFiles.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h2>Archivos Disponibles</h2>
          <select 
            value={selectedImage} 
            onChange={(e) => setSelectedImage(e.target.value)}
            style={{ padding: '8px', marginBottom: '10px', width: '100%' }}
          >
            {config.availableFiles.map((file) => (
              <option key={file} value={file}>{file}</option>
            ))}
          </select>
        </div>
      )}
      
      {selectedImage && (
        <div style={{ marginBottom: '20px' }}>
          <h2>Prueba de Rutas</h2>
          
          <div style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ddd' }}>
            <h3>Ruta 1: /uploads/productos/{selectedImage}</h3>
            <div style={{ border: '1px dashed #ccc', padding: '10px', marginBottom: '10px', minHeight: '200px' }}>
              <img 
                src={`/uploads/productos/${selectedImage}`} 
                alt="Test 1" 
                style={{ maxWidth: '100%', maxHeight: '300px' }}
                onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/300x200?text=Error'; }}
              />
            </div>
            <div>Estado: <span id="status1">Cargando...</span></div>
            <script dangerouslySetInnerHTML={{ __html: `
              const img1 = new Image();
              img1.onload = () => document.getElementById('status1').textContent = '✅ Cargada correctamente';
              img1.onerror = () => document.getElementById('status1').textContent = '❌ Error al cargar';
              img1.src = '/uploads/productos/${selectedImage}';
            `}} />
          </div>
          
          <div style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ddd' }}>
            <h3>Ruta 2: /public/uploads/productos/{selectedImage}</h3>
            <div style={{ border: '1px dashed #ccc', padding: '10px', marginBottom: '10px', minHeight: '200px' }}>
              <img 
                src={`/public/uploads/productos/${selectedImage}`} 
                alt="Test 2" 
                style={{ maxWidth: '100%', maxHeight: '300px' }}
                onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/300x200?text=Error'; }}
              />
            </div>
            <div>Estado: <span id="status2">Cargando...</span></div>
            <script dangerouslySetInnerHTML={{ __html: `
              const img2 = new Image();
              img2.onload = () => document.getElementById('status2').textContent = '✅ Cargada correctamente';
              img2.onerror = () => document.getElementById('status2').textContent = '❌ Error al cargar';
              img2.src = '/public/uploads/productos/${selectedImage}';
            `}} />
          </div>
          
          <div style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ddd' }}>
            <h3>Ruta 3: Ruta absoluta http://localhost:8080/uploads/productos/{selectedImage}</h3>
            <div style={{ border: '1px dashed #ccc', padding: '10px', marginBottom: '10px', minHeight: '200px' }}>
              <img 
                src={`http://localhost:8080/uploads/productos/${selectedImage}`} 
                alt="Test 3" 
                style={{ maxWidth: '100%', maxHeight: '300px' }}
                onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/300x200?text=Error'; }}
              />
            </div>
            <div>Estado: <span id="status3">Cargando...</span></div>
            <script dangerouslySetInnerHTML={{ __html: `
              const img3 = new Image();
              img3.onload = () => document.getElementById('status3').textContent = '✅ Cargada correctamente';
              img3.onerror = () => document.getElementById('status3').textContent = '❌ Error al cargar';
              img3.src = 'http://localhost:8080/uploads/productos/${selectedImage}';
            `}} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageDebug;
