// Script para probar la API de productos
// Usamos CommonJS para este script de prueba
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const API_URL = 'http://localhost:8080/api';

// Función para realizar una solicitud a la API
async function callAPI(endpoint, options = {}) {
  const url = `${API_URL}/${endpoint}`;
  
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    
    console.log(`\n--- Respuesta de ${url} ---`);
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(data, null, 2));
    
    return { status: response.status, data };
  } catch (error) {
    console.error(`Error al llamar a ${url}:`, error);
    throw error;
  }
}

// Función principal para ejecutar pruebas
async function runTests() {
  console.log('\n==================================================');
  console.log('PRUEBAS DE LA API DE PRODUCTOS');
  console.log('==================================================\n');
  
  try {
    // 1. Obtener todos los productos
    console.log('\n🔍 Obteniendo todos los productos...');
    const allProducts = await callAPI('productos');
    
    if (allProducts.status !== 200) {
      throw new Error('Error al obtener productos');
    }
    
    // Verificar que hay productos
    if (!allProducts.data.data || allProducts.data.data.length === 0) {
      console.log('⚠️ No se encontraron productos en la base de datos.');
      return;
    }
    
    // 2. Obtener un producto específico
    const productId = allProducts.data.data[0].id_producto;
    console.log(`\n🔍 Obteniendo detalles del producto con ID: ${productId}...`);
    const productDetail = await callAPI(`productos/${productId}`);
    
    // 3. Intentar obtener un producto inexistente
    console.log('\n🔍 Intentando obtener un producto con ID inválido...');
    await callAPI('productos/99999');
    
    console.log('\n==================================================');
    console.log('✅ PRUEBAS COMPLETADAS');
    console.log('==================================================\n');
  } catch (error) {
    console.error('\n❌ Error durante las pruebas:', error);
  }
}

// Ejecutar las pruebas
runTests();
