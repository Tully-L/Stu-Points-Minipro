const regeneratorRuntime = require("./utils/runtime.js");

App({
  globalData: {
    userInfo: null,
    baseUrl: "https://0704-stu-points-88ejqfi0p-tullys-projects-8854f3cf.vercel.app", // 生产环境
    token: null,
    role: null,
    retryCount: 0,
    maxRetries: 3,
    retryDelay: 1000
  },

  onLaunch() {
    const token = wx.getStorageSync("token");
    if (token) {
      this.globalData.token = token;
    }
  },

  // Promise 化 wx.request
  request(options) {
    return new Promise((resolve, reject) => {
      wx.request({
        ...options,
        success: resolve,
        fail: reject
      });
    });
  },

  // 登录方法
  async login() {
    try {
      // 获取code
      const loginRes = await new Promise((resolve, reject) => {
        wx.login({
          success: resolve,
          fail: reject
        });
      });

      if (!loginRes.code) {
        throw new Error("获取code失败");
      }

      // 发送code到服务器
      const res = await this.request({
        url: `${this.globalData.baseUrl}/api/login`,
        method: "POST",
        data: {
          code: loginRes.code
        }
      });

      if (!res.data || !res.data.success) {
        throw new Error(res.data?.message || "登录失败");
      }

      // 保存token
      const token = res.data.data.token;
      wx.setStorageSync("token", token);
      this.globalData.token = token;

      return res.data.data;
    } catch (error) {
      console.error("登录失败:", error);
      wx.showToast({
        title: error.message || "登录失败，请重试",
        icon: "none"
      });
      throw error;
    }
  },

  // 检查并获取用户信息
  async getUserInfo() {
    try {
      const setting = await new Promise((resolve, reject) => {
        wx.getSetting({
          success: resolve,
          fail: reject
        });
      });

      if (!setting.authSetting["scope.userInfo"]) {
        return null;
      }

      const userInfo = await new Promise((resolve, reject) => {
        wx.getUserInfo({
          success: resolve,
          fail: reject
        });
      });

      this.globalData.userInfo = userInfo.userInfo;
      return userInfo.userInfo;
    } catch (error) {
      console.error("获取用户信息失败:", error);
      return null;
    }
  },

  // 检查token是否有效
  async checkToken() {
    try {
      const token = wx.getStorageSync("token");
      if (!token) {
        return false;
      }

      const res = await this.request({
        url: `${this.globalData.baseUrl}/api/check-token`,
        method: "GET",
        header: {
          "Authorization": `Bearer ${token}`
        }
      });

      return res.data && res.data.success;
    } catch (error) {
      console.error("检查token失败:", error);
      return false;
    }
  },

  // 统一的请求方法
  async makeRequest(options) {
    try {
      if (!this.globalData.token) {
        await this.login();
      }

      const header = {
        "Authorization": `Bearer ${this.globalData.token}`,
        ...options.header
      };

      const res = await this.request({
        url: `${this.globalData.baseUrl}${options.url}`,
        method: options.method || "GET",
        data: options.data,
        header
      });

      if (res.statusCode === 401) {
        wx.removeStorageSync("token");
        this.globalData.token = null;
        await this.login();
        return this.makeRequest(options);
      }

      if (!res.data.success) {
        throw new Error(res.data.message || "请求失败");
      }

      return res.data;
    } catch (error) {
      console.error("请求失败:", error);
      throw error;
    }
  }
});
