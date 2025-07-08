const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();

// 中间件
app.use(cors());
app.use(express.json());

// JWT 验证中间件
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: '未提供认证令牌' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: '令牌无效或已过期' });
    }
    req.user = user;
    next();
  });
};

// 路由处理函数
const loginHandler = require('./auth/login');
const tokenHandler = require('./auth/token');
const roleHandler = require('./user/role');
const updatePointsHandler = require('./points/update');

// 公开路由
app.post('/api/login', loginHandler);

// 需要认证的路由
app.use('/api/token', authenticateToken, tokenHandler);
app.use('/api/user/role', authenticateToken, roleHandler);
app.use('/api/points/update', authenticateToken, updatePointsHandler);

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('未捕获的错误:', err);
  res.status(500).json({
    success: false,
    message: '服务器内部错误',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 处理 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: '未找到请求的资源'
  });
});

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`服务器已启动，监听端口 ${PORT}`);
  console.log(`健康检查地址: http://localhost:${PORT}/health`);
  
  // 输出环境变量状态（不输出具体值）
  console.log('环境变量检查:');
  console.log('- WECHAT_APP_ID:', process.env.WECHAT_APP_ID ? '已设置' : '未设置');
  console.log('- WECHAT_APP_SECRET:', process.env.WECHAT_APP_SECRET ? '已设置' : '未设置');
  console.log('- JWT_SECRET:', process.env.JWT_SECRET ? '已设置' : '未设置');
});

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('收到 SIGTERM 信号，准备关闭服务器...');
  app.close(() => {
    console.log('服务器已关闭');
    process.exit(0);
  });
});
