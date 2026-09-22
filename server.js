require('dotenv').config();
const http = require('http');
const { parse } = require('url');
const express = require('express');
const next = require('next');
const { Server } = require('socket.io');
const cors = require('cors');
const connectDB = require('./src/lib/db');
const apiRoutes = require('./src/server/api');

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

async function startServer() {
  try {
    // 1. Connect to Database
    await connectDB();

    // 2. Prepare Next.js
    await app.prepare();

    const expressApp = express();
    const server = http.createServer(expressApp);

    // 3. Attach Socket.IO
    const io = new Server(server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PATCH'],
      },
    });

    io.on('connection', (socket) => {
      // Staff Room
      socket.on('join:staff', () => {
        socket.join('staff');
        console.log(`🔌 [Socket.IO] Client ${socket.id} joined "staff" room`);
      });

      // Table Room
      socket.on('join:table', (tableNumber) => {
        if (tableNumber) {
          const roomName = `table-${tableNumber}`;
          socket.join(roomName);
          console.log(`🔌 [Socket.IO] Client ${socket.id} joined "${roomName}"`);
        }
      });

      // Specific Order Room
      socket.on('join:order', (orderId) => {
        if (orderId) {
          const roomName = `order-${orderId}`;
          socket.join(roomName);
          console.log(`🔌 [Socket.IO] Client ${socket.id} joined "${roomName}"`);
        }
      });

      socket.on('disconnect', () => {
        // Silent disconnect
      });
    });

    // 4. Middlewares
    expressApp.use(cors());
    expressApp.use(express.json());

    // 5. Mount API Routes with IO instance
    expressApp.use('/api', apiRoutes(io));

    // 6. Pass all other requests to Next.js handler
    expressApp.all('*', (req, res) => {
      const parsedUrl = parse(req.url, true);
      return handle(req, res, parsedUrl);
    });

    server.listen(port, (err) => {
      if (err) throw err;
      console.log(`> 👑 THE ROYAL'S is live on http://localhost:${port}`);
      console.log(`> 📱 Mobile QR Ordering: http://localhost:${port}/table/tbl_01`);
      console.log(`> 👨‍🍳 Staff Dashboard: http://localhost:${port}/staff (PIN: 1234)`);
    });
  } catch (error) {
    console.error('❌ Error starting server:', error);
    process.exit(1);
  }
}

startServer();
