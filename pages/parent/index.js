const regeneratorRuntime = require('../../utils/runtime.js');
const parent = require('../../utils/parent.js');

Page({
  data: {
    userInfo: null,
    students: [],
    currentStudent: null,
    pendingHomework: [],
    currentTab: 0,
    loading: false,
    showAddStudent: false,
    addStudentForm: {
      username: '',
      name: ''
    },
    stats: {
      totalPoints: 0,
      monthPoints: 0,
      submissionCount: 0,
      passRate: 0
    }
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

      await this.getUserInfo();
      await this.loadStudentList();
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
    try {
      const app = getApp();
      if (app.globalData.userInfo) {
        this.setData({ userInfo: app.globalData.userInfo });
        return;
      }

      // 获取用户信息
      const setting = await wx.getSetting();
      if (setting.authSetting['scope.userInfo']) {
        const res = await wx.getUserInfo();
        app.globalData.userInfo = res.userInfo;
        this.setData({ userInfo: res.userInfo });
      }
    } catch (error) {
      console.error('获取用户信息失败:', error);
      throw error;
    }
  },

  async loadStudentList() {
    try {
      const students = await parent.getStudentList();
      this.setData({ students });

      if (students.length > 0) {
        await this.selectStudent(students[0]);
      }
    } catch (error) {
      console.error('获取学生列表失败:', error);
      throw error;
    }
  },

  async selectStudent(student) {
    try {
      this.setData({ 
        currentStudent: student,
        loading: true 
      });

      await Promise.all([
        this.loadStudentStats(student.id),
        this.loadPendingHomework(student.id)
      ]);
    } catch (error) {
      console.error('切换学生失败:', error);
      wx.showToast({
        title: '加载学生数据失败',
        icon: 'none'
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  async loadStudentStats(studentId) {
    try {
      const stats = await parent.getStudentStats(studentId);
      this.setData({ stats });
    } catch (error) {
      console.error('获取学生统计数据失败:', error);
      throw error;
    }
  },

  async loadPendingHomework(studentId) {
    try {
      const pendingHomework = await parent.getPendingHomework({ studentId });
      this.setData({
        pendingHomework: pendingHomework.map(item => ({
          ...item,
          createTime: this.formatTime(item.createTime)
        }))
      });
    } catch (error) {
      console.error('获取待审核作业失败:', error);
      throw error;
    }
  },

  onStudentChange(e) {
    const index = e.detail.value;
    this.selectStudent(this.data.students[index]);
  },

  showAddStudentModal() {
    this.setData({
      showAddStudent: true,
      addStudentForm: {
        username: '',
        name: ''
      }
    });
  },

  hideAddStudentModal() {
    this.setData({
      showAddStudent: false,
      addStudentForm: {
        username: '',
        name: ''
      }
    });
  },

  onAddStudentInput(e) {
    const { field } = e.currentTarget.dataset;
    this.setData({
      [`addStudentForm.${field}`]: e.detail.value
    });
  },

  async handleAddStudent() {
    const { username, name } = this.data.addStudentForm;
    if (!username || !name) {
      return wx.showToast({
        title: '请填写完整信息',
        icon: 'none'
      });
    }

    try {
      this.setData({ loading: true });
      await parent.addStudent(this.data.addStudentForm);
      
      wx.showToast({
        title: '添加成功',
        icon: 'success'
      });

      this.setData({ 
        showAddStudent: false,
        addStudentForm: { username: '', name: '' }
      });

      await this.loadStudentList();
    } catch (error) {
      console.error('添加学生失败:', error);
      wx.showToast({
        title: error.message || '添加失败，请重试',
        icon: 'none'
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  async handleReviewHomework(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/homework-review/index?id=${id}`
    });
  },

  onTabChange(e) {
    const currentTab = e.currentTarget.dataset.index;
    this.setData({ currentTab });
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
  }
}); 