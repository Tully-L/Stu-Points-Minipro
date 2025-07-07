const regeneratorRuntime = require('../../utils/runtime.js');
const points = require('../../utils/points.js');
const upload = require('../../utils/upload.js');
const app = getApp();

Page({
  data: {
    userInfo: null,
    pointsDetail: {
      totalPoints: 0,
      monthPoints: 0,
      submissionCount: 0,
      passRate: 0
    },
    pointsHistory: [],
    pointsRules: [],
    currentTab: 0,
    loading: false,
    uploading: false,
    uploadProgress: 0,
    selectedFiles: [],
    tabs: ['积分概况', '积分历史', '积分规则'],
    page: 1,
    pageSize: 20,
    hasMore: true
  },

  onLoad() {
    this.loadInitialData();
  },

  async loadInitialData() {
    try {
      wx.showLoading({
        title: '加载中...',
        mask: true
      });

      const userInfo = await this.getUserInfo();
      this.setData({ userInfo });

      await Promise.all([
        this.loadPointsDetail(),
        this.loadPointsHistory(),
        this.loadPointsRules()
      ]);
    } catch (error) {
      console.error('加载数据失败:', error);
      wx.showToast({
        title: '加载失败，请重试',
        icon: 'none'
      });
    } finally {
      wx.hideLoading();
    }
  },

  async getUserInfo() {
    const app = getApp();
    return app.globalData.userInfo || {};
  },

  async loadPointsDetail() {
    try {
      const data = await points.getStudentPoints();
      this.setData({
        pointsDetail: {
          totalPoints: data.totalPoints || 0,
          monthPoints: data.monthPoints || 0,
          submissionCount: data.submissionCount || 0,
          passRate: data.passRate || 0
        }
      });
    } catch (error) {
      console.error('获取积分详情失败:', error);
      throw error;
    }
  },

  async loadPointsHistory() {
    try {
      const data = await points.getPointsHistory();
      this.setData({
        pointsHistory: data.map(item => ({
          ...item,
          createTime: this.formatTime(item.createTime),
          reviewer: item.reviewer ? `审核者：${item.reviewer}` : ''
        }))
      });
    } catch (error) {
      console.error('获取积分历史失败:', error);
      throw error;
    }
  },

  async loadPointsRules() {
    try {
      const data = await points.getPointsRules();
      this.setData({ pointsRules: data });
    } catch (error) {
      console.error('获取积分规则失败:', error);
      throw error;
    }
  },

  onTabChange(e) {
    const currentTab = e.currentTarget.dataset.index;
    this.setData({ currentTab });
  },

  async handleChooseFile() {
    if (this.data.uploading) {
      return wx.showToast({
        title: '正在上传中...',
        icon: 'none'
      });
    }

    try {
      const files = await upload.chooseFiles();
      if (files.length === 0) return;

      this.setData({
        selectedFiles: files.map(file => ({
          path: file,
          name: upload.getFileName(file)
        }))
      });
    } catch (error) {
      console.error('选择文件失败:', error);
      wx.showToast({
        title: error.message || '选择文件失败',
        icon: 'none'
      });
    }
  },

  async handleUpload() {
    if (this.data.uploading || this.data.selectedFiles.length === 0) return;

    try {
      this.setData({ uploading: true, uploadProgress: 0 });

      const files = this.data.selectedFiles.map(f => f.path);
      const results = await upload.uploadFiles(files, (progress) => {
        this.setData({ uploadProgress: progress });
      });

      // 提交作业
      await points.submitHomework({
        files: results.map(r => r.url)
      });

      wx.showToast({
        title: '提交成功',
        icon: 'success'
      });

      // 刷新数据
      this.setData({ selectedFiles: [] });
      await this.loadPointsDetail();
      await this.loadPointsHistory();

    } catch (error) {
      console.error('上传失败:', error);
      wx.showToast({
        title: error.message || '上传失败，请重试',
        icon: 'none'
      });
    } finally {
      this.setData({ uploading: false, uploadProgress: 0 });
    }
  },

  handleCancelUpload() {
    this.setData({ selectedFiles: [] });
  },

  async onPullDownRefresh() {
    try {
      await this.loadInitialData();
    } catch (error) {
      console.error('刷新失败:', error);
    } finally {
      wx.stopPullDownRefresh();
    }
  },

  formatTime(timestamp) {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hour = date.getHours().toString().padStart(2, '0');
    const minute = date.getMinutes().toString().padStart(2, '0');
    return `${year}-${month}-${day} ${hour}:${minute}`;
  },

  // 上拉加载更多
  async onReachBottom() {
    if (this.data.currentTab === 1) {
      await this.loadPointsHistory();
    }
  },

  // 查看积分详情
  viewPointsDetail(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/points-detail/index?id=${id}`
    });
  }
}); 