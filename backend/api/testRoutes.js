import express from 'express';
import { testConnection } from '../db/config.js';

const router = express.Router();

// Test API endpoint
router.get('/test', async (req, res) => {
  try {
    const connected = await testConnection();
    if (connected) {
      res.status(200).json({ 
        success: true, 
        message: 'API is working. Database connection successful.',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(500).json({ 
        success: false, 
        message: 'API is working but database connection failed.' 
      });
    }
  } catch (error) {
    console.error('API test endpoint error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error occurred during test', 
      error: error.message 
    });
  }
});

// Status endpoint
router.get('/stats', async (req, res) => {
  try {
    const connected = await testConnection();
    res.status(200).json({ 
      success: true, 
      dbConnected: connected,
      serverStatus: 'running',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Stats endpoint error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching server stats', 
      error: error.message 
    });
  }
});

export default router;
