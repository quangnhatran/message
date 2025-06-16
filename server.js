const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

// Middleware
app.use(bodyParser.json());
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/register.html');
});

app.use(express.static('public'));
// Đăng ký
app.post('/register', (req, res) => {
  const { username, email, password } = req.body;
  const users = JSON.parse(fs.readFileSync('users.json'));
  
  if (users.find(u => u.email === email)) {
    return res.status(400).json({ message: 'Email đã tồn tại!' });
  }

  users.push({ username, email, password });
  fs.writeFileSync('users.json', JSON.stringify(users, null, 2));
  res.json({ message: 'Đăng ký thành công!' });
});

// Đăng nhập
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const users = JSON.parse(fs.readFileSync('users.json'));
  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).json({ message: 'Sai email hoặc mật khẩu!' });
  }

  res.json({ message: 'Đăng nhập thành công', username: user.username });
});

// Chat socket
io.on('connection', (socket) => {
  console.log('1 người dùng đã kết nối');
  
  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
  });
});

// Khởi động server
http.listen(3000, () => {
  console.log('Server đang chạy tại http://localhost:3000');
});
