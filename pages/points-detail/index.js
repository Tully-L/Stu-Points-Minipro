const PointsAPI = require('../../utils/points.js');

Page({
  data: {
    detail: null,
    loading: true
  },

  onLoad(options) {
    if (options.id) {
      this.loadPointsDetail(options.id);
    }
  },

  async loadPointsDetail(id) {
    try {
      wx.showLoading({ title: '加载中' });
      const detail = await PointsAPI.getStudentPointsDetail(id);
      this.setData({ detail });
    } catch (error) {
      console.error('获取积分详情失败:', error);
      wx.showToast({
        title: '加载失败，请重试',
        icon: 'none'
      });
    } finally {
      wx.hideLoading();
      this.setData({ loading: false });
    }
  }
}); 