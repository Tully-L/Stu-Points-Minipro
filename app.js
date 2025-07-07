const regeneratorRuntime = require('./utils/runtime.js');

App({
  globalData: {
    userInfo: null,
    // 使用开发者工具内置的环境变量
    baseUrl: wx.getSystemInfoSync().platform === 'devtools' 
      ? 'http://127.0.0.1:3000'  // 开发环境
      : 'https://your-production-domain.com', // 生产环境
    token: null,
    role: null,
    retryCount: 0,
    maxRetries: 3,
    retryDelay: 1000, // 重试延迟时间（毫秒）
  },

  onLaunch() {
    // 检查是否有存储的token
    const token = wx.getStorageSync('token');
    if (token) {
      this.globalData.token = token;
    }
  },

  // 登录方法
  async login() {
    try {
      // 获取code
      const loginRes = await wx.login();
      if (!loginRes.code) {
        throw new Error('获取code失败');
      }

      // 发送code到服务器
      const res = await wx.request({
        url: `${this.globalData.baseUrl}/api/login`,
        method: 'POST',
        data: {
          code: loginRes.code
        }
      });

      if (!res.data || !res.data.success) {
        throw new Error(res.data?.message || '登录失败');
      }

      // 保存token
      const token = res.data.data.token;
      wx.setStorageSync('token', token);
      this.globalData.token = token;

      return res.data.data;
    } catch (error) {
      console.error('登录失败:', error);
      wx.showToast({
        title: error.message || '登录失败，请重试',
        icon: 'none'
      });
      throw error;
    }
  },

  // 检查并获取用户信息
  async getUserInfo() {
    try {
      // 检查是否已授权
      const setting = await wx.getSetting();
      if (!setting.authSetting['scope.userInfo']) {
        return null;
      }

      // 获取用户信息
      const userInfo = await wx.getUserInfo();
      this.globalData.userInfo = userInfo.userInfo;
      return userInfo.userInfo;
    } catch (error) {
      console.error('获取用户信息失败:', error);
      return null;
    }
  },

  // 检查token是否有效
  async checkToken() {
    try {
      const token = wx.getStorageSync('token');
      if (!token) {
        return false;
      }

      const res = await wx.request({
        url: `${this.globalData.baseUrl}/api/check-token`,
        method: 'GET',
        header: {
          'Authorization': `Bearer ${token}`
        }
      });

      return res.data && res.data.success;
    } catch (error) {
      console.error('检查token失败:', error);
      return false;
    }
  },

  // 统一的请求方法
  async request(options) {
    try {
      // 检查token
      if (!this.globalData.token) {
        await this.login();
      }

      // 添加token到header
      const header = {
        'Authorization': `Bearer ${this.globalData.token}`,
        ...options.header
      };

      // 发送请求
      const res = await wx.request({
        url: `${this.globalData.baseUrl}${options.url}`,
        method: options.method || 'GET',
        data: options.data,
        header
      });

      // 处理token失效
      if (res.statusCode === 401) {
        // 清除token
        wx.removeStorageSync('token');
        this.globalData.token = null;

        // 重新登录
        await this.login();

        // 重试请求
        return this.request(options);
      }

      if (!res.data.success) {
        throw new Error(res.data.message || '请求失败');
      }

      return res.data;
    } catch (error) {
      console.error('请求失败:', error);
      throw error;
    }
  },

  // 设置用户角色
  async setUserRole(role) {
    try {
      const res = await this.request({
        url: '/user/role',
        method: 'POST',
        data: { role }
      });

      if (res.success) {
        this.globalData.role = role;
        wx.setStorageSync('role', role);
        return true;
      }
      throw new Error(res.message || '设置角色失败');
    } catch (error) {
      console.error('设置角色失败:', error);
      throw error;
    }
  },

  // 获取用户角色
  async getUserRole() {
    try {
      const res = await this.request({
        url: '/user/role',
        method: 'GET'
      });
      return res.data.role;
    } catch (error) {
      console.error('获取角色失败:', error);
      throw error;
    }
  }
}); 