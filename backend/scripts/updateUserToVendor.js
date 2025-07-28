// Script para actualizar el rol de un usuario existente a vendedor
import userModel from '../models/userModel.js';

const updateUserToVendor = async () => {
  try {
    // ID del usuario a actualizar (asumiendo que el ID es 1 para el primer usuario)
    const userId = 1;
    
    // Actualizar rol a vendedor
    const updatedUser = await userModel.updateUserRole(userId, 'vendedor');
    
    console.log('Usuario actualizado exitosamente:');
    console.log(`ID: ${updatedUser.id_usuario}`);
    console.log(`Nombre: ${updatedUser.nombre} ${updatedUser.p_apellido} ${updatedUser.s_apellido}`);
    console.log(`Correo: ${updatedUser.correo}`);
    console.log(`Rol: ${updatedUser.rol}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error actualizando usuario:', error);
    process.exit(1);
  }
};

updateUserToVendor();
