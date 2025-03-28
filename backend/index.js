require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('redis');
const { nanoid } = require('nanoid');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Redis client setup
const redisClient = createClient({
  url: process.env.REDIS_URL
});

// Connect to Redis
(async () => {
  try {
    redisClient.on('error', (err) => {
      console.error('Redis Client Error', err);
    });
    
    await redisClient.connect();
    console.log('Connected to Redis');
  } catch (error) {
    console.error('Failed to connect to Redis:', error);
    console.warn('Make sure Redis server is running on', process.env.REDIS_URL);
  }
})();

// Add a health check route to verify Redis connection
app.get('/api/health', async (req, res) => {
  try {
    if (!redisClient.isReady) {
      return res.status(500).json({ 
        status: 'error', 
        message: 'Redis not connected',
        redisUrl: process.env.REDIS_URL 
      });
    }
    
    // Try a simple Redis operation
    await redisClient.set('health-check', 'ok', { EX: 5 });
    const result = await redisClient.get('health-check');
    
    res.json({ 
      status: 'ok', 
      redis: result === 'ok' ? 'connected' : 'error',
      port: process.env.PORT
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      message: error.message,
      redisUrl: process.env.REDIS_URL
    });
  }
});

// Routes
app.post('/api/clipboard', async (req, res) => {
  try {
    // Check if Redis is connected
    if (!redisClient.isReady) {
      return res.status(503).json({ 
        error: 'Service temporarily unavailable: database connection error'
      });
    }

    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }
    
    // Generate a unique code (6 characters)
    const code = nanoid(6);
    
    // Store in Redis with expiration (default 24 hours)
    const expiry = parseInt(process.env.DATA_EXPIRY) || 86400;
    
    // Store the content
    await redisClient.set(code, content, { EX: expiry });
    
    // Initialize retrieval count to 0
    await redisClient.set(`${code}:count`, '0', { EX: expiry });
    
    // Save creation timestamp
    await redisClient.set(`${code}:created`, Date.now().toString(), { EX: expiry });
    
    // Add to user's history if user ID is provided
    const { userId } = req.body;
    if (userId) {
      // Store the clipboard code in the user's history list
      await redisClient.lPush(`history:${userId}`, code);
      // Set expiry on history list to avoid unlimited growth
      await redisClient.expire(`history:${userId}`, 30 * 86400); // 30 days
      
      // Associate this clipboard with the user
      await redisClient.set(`${code}:owner`, userId, { EX: expiry });
    }
    
    res.status(201).json({ code });
  } catch (error) {
    console.error('Error creating clipboard:', error);
    res.status(500).json({ error: 'Failed to create clipboard' });
  }
});

app.get('/api/clipboard/:code', async (req, res) => {
  try {
    // Check if Redis is connected
    if (!redisClient.isReady) {
      return res.status(503).json({ 
        error: 'Service temporarily unavailable: database connection error' 
      });
    }

    const { code } = req.params;
    
    // Get content from Redis
    const content = await redisClient.get(code);
    
    if (!content) {
      return res.status(404).json({ error: 'Clipboard not found or expired' });
    }
    
    // Increment the retrieval count
    const newCount = await redisClient.incr(`${code}:count`);
    
    // Get creation timestamp
    const created = await redisClient.get(`${code}:created`) || Date.now().toString();
    
    // Get owner ID if available
    const ownerId = await redisClient.get(`${code}:owner`);
    
    // Notify all clients in the room through socket
    io.to(code).emit('content-retrieved', { count: newCount });
    
    res.status(200).json({ 
      content,
      stats: {
        retrievalCount: parseInt(newCount),
        created: parseInt(created),
        ownerId
      }
    });
  } catch (error) {
    console.error('Error retrieving clipboard:', error);
    res.status(500).json({ error: 'Failed to retrieve clipboard' });
  }
});

// New route to get a user's clipboard history
app.get('/api/history/:userId', async (req, res) => {
  try {
    // Check if Redis is connected
    if (!redisClient.isReady) {
      return res.status(503).json({ 
        error: 'Service temporarily unavailable: database connection error' 
      });
    }

    const { userId } = req.params;
    
    // Get all clipboard codes from the user's history
    const codes = await redisClient.lRange(`history:${userId}`, 0, -1);
    
    if (!codes || codes.length === 0) {
      return res.json({ history: [] });
    }
    
    // Get details for each code
    const history = await Promise.all(codes.map(async (code) => {
      const content = await redisClient.get(code);
      const count = await redisClient.get(`${code}:count`) || '0';
      const created = await redisClient.get(`${code}:created`) || null;
      
      // If content doesn't exist (expired), return null
      if (!content) return null;
      
      // Create a preview (first 50 characters)
      const preview = content.length > 50 ? `${content.substring(0, 50)}...` : content;
      
      return {
        code,
        preview,
        retrievalCount: parseInt(count),
        created: created ? parseInt(created) : null
      };
    }));
    
    // Filter out expired items
    const validHistory = history.filter(item => item !== null);
    
    res.json({ history: validHistory });
  } catch (error) {
    console.error('Error retrieving history:', error);
    res.status(500).json({ error: 'Failed to retrieve history' });
  }
});

// New route to update clipboard content (for original creator only)
app.put('/api/clipboard/:code', async (req, res) => {
  try {
    // Check if Redis is connected
    if (!redisClient.isReady) {
      return res.status(503).json({ 
        error: 'Service temporarily unavailable: database connection error' 
      });
    }

    const { code } = req.params;
    const { content, userId } = req.body;
    
    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    // Get the owner ID to verify edit permission
    const ownerId = await redisClient.get(`${code}:owner`);
    
    // Check if content exists
    const existingContent = await redisClient.get(code);
    if (!existingContent) {
      return res.status(404).json({ error: 'Clipboard not found or expired' });
    }
    
    // Verify that the current user is the owner
    if (!ownerId || ownerId !== userId) {
      return res.status(403).json({ error: 'You do not have permission to edit this clipboard' });
    }
    
    // Get the expiry time left on the original key
    const ttl = await redisClient.ttl(code);
    
    // Update the content with the same expiration as before
    await redisClient.set(code, content, { EX: ttl > 0 ? ttl : 86400 });
    
    // Update the history item preview if it exists
    // No need to update other metadata (owner, creation time)
    
    // Notify all clients in the room about the content update
    io.to(code).emit('content-updated', { 
      updatedBy: userId,
      timestamp: Date.now()
    });
    
    res.status(200).json({ 
      success: true,
      message: 'Clipboard content updated'
    });
  } catch (error) {
    console.error('Error updating clipboard:', error);
    res.status(500).json({ error: 'Failed to update clipboard' });
  }
});

// Socket.io for real-time updates
io.on('connection', (socket) => {
  console.log('User connected');
  
  socket.on('join-room', (code) => {
    socket.join(code);
    console.log(`User joined room: ${code}`);
  });
  
  socket.on('leave-room', (code) => {
    socket.leave(code);
    console.log(`User left room: ${code}`);
  });

  // Track user identifiers for analytics
  socket.on('identify', async (data) => {
    const { userId, code } = data;
    
    if (userId && code) {
      // Store user in active viewers set with expiration
      await redisClient.sAdd(`${code}:viewers`, userId);
      await redisClient.expire(`${code}:viewers`, 3600); // 1 hour expiry for viewer info
      
      // Notify room about active viewers count
      const viewersCount = await redisClient.sCard(`${code}:viewers`) || 0;
      io.to(code).emit('viewers-updated', { count: viewersCount });
    }
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Set up event listener for Redis to emit updates
const subscriber = redisClient.duplicate();
(async () => {
  await subscriber.connect();
  
  // Subscribe to keyspace events for SET operations
  await subscriber.subscribe('__keyevent@0__:set', (message) => {
    // When a key is updated, notify all clients in that room
    if (!message.includes(':')) {  // Only for primary clipboard keys (not metadata)
      // This is a basic update from Redis events
      // More detailed updates with user info come from the API endpoints
      io.to(message).emit('content-updated', {
        fromRedisEvent: true,
        timestamp: Date.now()
      });
    }
  });
})();

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 