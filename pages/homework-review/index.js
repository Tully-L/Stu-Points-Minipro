const regeneratorRuntime = require('../../utils/runtime.js');
const parent = require('../../utils/parent.js');

Page({
  data: {
    homeworkId: null,
    homework: null,
    loading: false,
    showReviewForm: false,
    reviewForm: {
      points: '',
      comment: ''
    },
    isLocked: false,
    lockedBy: null,
    previewImages: [],
    currentPreviewIndex: 0
  },

  onLoad(options) {
    this.setData({
      homeworkId: options.id
    });
    this.loadHomeworkDetail();
    this.checkLockStatus();
  },

  async loadHomeworkDetail() {
    try {
      this.setData({ loading: true });
      const homework = await parent.getHomeworkDetail(this.data.homeworkId);
      
      // 处理文件预览
      const previewImages = homework.files
        .filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file.url))
        .map(file => file.url);

      // 格式化时间
      homework.createTime = this.formatTime(homework.createTime);

      this.setData({
        homework,
        previewImages
      });
    } catch (error) {
      console.error('获取作业详情失败:', error);
      wx.showToast({
        title: '加载失败，请重试',
        icon: 'none'
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  async checkLockStatus() {
    try {
      const { isLocked, lockedBy } = await parent.getReviewLockStatus(this.data.homeworkId);
      this.setData({
        isLocked,
        lockedBy
      });

      if (isLocked && !this.isCurrentUser(lockedBy)) {
        wx.showModal({
          title: '提示',
          content: `该作业正在被${lockedBy.name}审核中`,
          confirmText: '接管审核',
          cancelText: '返回',
          success: (res) => {
            if (res.confirm) {
              this.takeoverReview();
            } else {
              wx.navigateBack();
            }
          }
        });
      } else if (!isLocked) {
        this.lockReview();
      }
    } catch (error) {
      console.error('检查锁定状态失败:', error);
    }
  },

  isCurrentUser(user) {
    const app = getApp();
    return app.globalData.userInfo.id === user.id;
  },

  async lockReview() {
    try {
      await parent.lockHomeworkReview(this.data.homeworkId);
      this.setData({ isLocked: true });
    } catch (error) {
      console.error('锁定审核失败:', error);
      wx.showToast({
        title: '锁定失败，请重试',
        icon: 'none'
      });
    }
  },

  async takeoverReview() {
    try {
      await parent.takeoverHomeworkReview(this.data.homeworkId);
      this.setData({
        isLocked: true,
        lockedBy: null
      });
      wx.showToast({
        title: '接管成功',
        icon: 'success'
      });
    } catch (error) {
      console.error('接管审核失败:', error);
      wx.showToast({
        title: '接管失败，请重试',
        icon: 'none'
      });
    }
  },

  showReviewModal() {
    this.setData({
      showReviewForm: true,
      reviewForm: {
        points: '',
        comment: ''
      }
    });
  },

  hideReviewModal() {
    this.setData({
      showReviewForm: false
    });
  },

  onPointsInput(e) {
    this.setData({
      'reviewForm.points': e.detail.value
    });
  },

  onCommentInput(e) {
    this.setData({
      'reviewForm.comment': e.detail.value
    });
  },

  async submitReview() {
    const { points, comment } = this.data.reviewForm;
    if (!points) {
      return wx.showToast({
        title: '请输入积分',
        icon: 'none'
      });
    }

    try {
      this.setData({ loading: true });
      await parent.reviewHomework(this.data.homeworkId, {
        points: Number(points),
        comment
      });

      wx.showToast({
        title: '审核成功',
        icon: 'success'
      });

      // 解锁审核
      await parent.unlockHomeworkReview(this.data.homeworkId);

      // 返回上一页并刷新
      const pages = getCurrentPages();
      const prevPage = pages[pages.length - 2];
      if (prevPage) {
        prevPage.loadInitialData();
      }
      wx.navigateBack();
    } catch (error) {
      console.error('提交审核失败:', error);
      wx.showToast({
        title: error.message || '提交失败，请重试',
        icon: 'none'
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  previewImage(e) {
    const { url } = e.currentTarget.dataset;
    const { previewImages } = this.data;
    const current = previewImages.indexOf(url);
    
    wx.previewImage({
      current: url,
      urls: previewImages
    });

    this.setData({
      currentPreviewIndex: current
    });
  },

  async onUnload() {
    // 页面卸载时解锁
    if (this.data.isLocked) {
      try {
        await parent.unlockHomeworkReview(this.data.homeworkId);
      } catch (error) {
        console.error('解锁失败:', error);
      }
    }
  },

  formatTime(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hour = date.getHours().toString().padStart(2, '0');
    const minute = date.getMinutes().toString().padStart(2, '0');
    return `${year}-${month}-${day} ${hour}:${minute}`;
  }
});

// 页面配置
Page.json = {
  navigationBarTitleText: '作业审核',
  enablePullDownRefresh: false,
  usingComponents: {}
}; 