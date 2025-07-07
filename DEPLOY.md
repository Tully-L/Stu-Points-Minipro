# 部署指南

## Vercel 部署

1. 确保你的项目已经初始化：
```bash
npm install
```

2. 执行部署命令：
```bash
npm run deploy
```

## 微信小程序部署

### 前期准备

1. 登录[微信公众平台](https://mp.weixin.qq.com/)

2. 获取小程序代码上传密钥：
   - 进入"开发管理" > "开发设置"
   - 在"小程序代码上传"栏目生成代码上传密钥
   - 下载密钥文件并重命名为 `private.key`，放在项目根目录

3. 配置 IP 白名单：
   - 在同一页面下方找到"IP 白名单"
   - 添加你的服务器 IP 或开发环境 IP

4. 配置服务器域名：
   - 在"开发管理" > "开发设置" > "服务器域名"中
   - 添加 request 合法域名：`https://tully.top`

### 部署步骤

1. 预览版本（生成二维码）：
```bash
npm run preview
```
这将在项目根目录生成 `preview.jpg` 二维码图片，使用微信扫码即可预览。

2. 正式发布：
```bash
npm run deploy
```

### 常见问题

1. 如果遇到 `miniprogram-ci` 相关错误，请确保：
   - Node.js 版本 >= 14
   - 已正确安装依赖：`npm install`
   - private.key 文件存在且有效

2. 如果遇到上传失败，请检查：
   - IP 白名单是否配置正确
   - 密钥文件是否正确放置
   - appid 是否正确

3. 如果遇到预览/真机调试失败，请确保：
   - 微信开发者工具已安装并登录
   - 手机微信已登录并绑定开发者账号

### 目录结构说明

```
project/
  ├── points/            # 小程序源代码
  ├── private.key        # 小程序上传密钥（需自行添加）
  ├── project.config.json # 小程序项目配置
  ├── app.json           # 小程序全局配置
  └── package.json       # 项目依赖配置
``` 