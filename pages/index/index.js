const regeneratorRuntime = require('../../utils/runtime.js');

Page({
  data: {
    userInfo: null,
    hasUserInfo: false,
    canIUseGetUserProfile: false,
    loading: false,
    error: null
  },

  onLoad() {
    if (wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true
      });
    }

    // 检查是否已登录
    const app = getApp();
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      });
      this.redirectToRole();
    }
  },

  async getUserProfile() {
    if (this.data.loading) return;
    
    try {
      this.setData({ 
        loading: true,
        error: null 
      });

      // 获取用户信息
      const res = await wx.getUserProfile({
        desc: '用于完善用户资料'
      });

      const app = getApp();
      app.globalData.userInfo = res.userInfo;

      this.setData({
        userInfo: res.userInfo,
        hasUserInfo: true
      });

      // 执行登录
      await app.login();

      // 跳转到对应角色页面
      await this.redirectToRole();
    } catch (error) {
      console.error('登录失败:', error);
      
      // 设置具体的错误信息
      let errorMsg = '登录失败，请重试';
      if (error.errMsg) {
        if (error.errMsg.includes('getUserProfile:fail')) {
          errorMsg = '获取用户信息失败，请重新授权';
        } else if (error.errMsg.includes('request:fail')) {
          errorMsg = '网络连接失败，请检查网络设置';
        }
      }
      
      this.setData({ 
        error: errorMsg,
        hasUserInfo: false 
      });
      
      wx.showToast({
        title: errorMsg,
        icon: 'none',
        duration: 2000
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  async redirectToRole() {
    try {
      const role = wx.getStorageSync('role');
      if (role) {
        await wx.redirectTo({
          url: `/pages/${role}/index`
        });
      }
    } catch (error) {
      console.error('跳转失败:', error);
      wx.showToast({
        title: '页面跳转失败，请重试',
        icon: 'none'
      });
    }
  }
}); 