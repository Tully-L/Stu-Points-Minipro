# H5移动端成绩管理系统

一个基于原生HTML5 + CSS3 + JavaScript的移动端成绩管理系统，支持学生上传试卷、家长审核积分的完整流程。

## 🚀 技术架构

- **前端**: 原生HTML5 + CSS3 + JavaScript
- **UI框架**: Vant 4 (专业移动端组件库)
- **后端**: Vercel Serverless Functions
- **数据库**: PostgreSQL
- **文件存储**: Cloudinary
- **部署**: Vercel

## 📋 核心功能

### 学生端功能
- 用户注册/登录
- 拍照上传试卷
- 查看积分变化
- 查看历史记录
- 个人中心管理

### 家长端功能
- 用户登录
- 审核学生试卷
- 评分和评语
- 积分扣减管理
- 统计数据查看

## 🛠️ 开发环境设置

### 1. 安装依赖
```bash
npm install
```

### 2. 环境变量配置
复制 `env-template.txt` 创建 `.env.local` 文件，并填入相应配置：
```env
# 数据库配置
DATABASE_URL=your_postgresql_connection_string

# Cloudinary配置
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# JWT配置
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRES_IN=7d
```

### 3. 本地开发
```bash
npm run dev
```

### 4. 部署
```bash
npm run deploy
```

## 📊 数据库设计

### 用户表 (users)
- id: 主键
- username: 用户名
- password: 密码(加密)
- role: 角色(student/parent)
- points: 积分
- parent_id: 家长ID(学生用)
- created_at: 创建时间

### 提交记录表 (submissions)
- id: 主键
- student_id: 学生ID
- image_url: 图片URL
- subject: 科目
- score: 分数
- status: 状态(pending/approved/rejected)
- comment: 评语
- points_change: 积分变化
- created_at: 创建时间
- reviewed_at: 审核时间
- reviewed_by: 审核人ID

### 积分记录表 (point_logs)
- id: 主键
- user_id: 用户ID
- change_amount: 变化数量
- reason: 原因
- submission_id: 提交记录ID
- created_at: 创建时间

## 🔧 开发计划

### 阶段1：基础框架
- [ ] 项目结构搭建
- [ ] 基础页面创建
- [ ] 认证系统实现
- [ ] 数据库连接

### 阶段2：核心功能
- [ ] 学生上传功能
- [ ] 家长审核功能
- [ ] 积分系统
- [ ] 文件存储

### 阶段3：优化完善
- [ ] 数据统计
- [ ] 用户体验优化
- [ ] 性能优化
- [ ] 错误处理

## 📱 PWA支持

项目支持Progressive Web App，可以：
- 离线访问
- 桌面安装
- 推送通知
- 快捷方式

## 🚀 部署指南

1. 连接GitHub仓库到Vercel
2. 配置环境变量
3. 自动部署完成

---

**注意**: 这是一个重新构建的项目，采用渐进式开发策略，确保每个阶段都经过充分测试后再进行下一步开发。 