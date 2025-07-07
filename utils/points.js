const regeneratorRuntime = require('./runtime.js');
const app = getApp();

// 积分管理相关API
const PointsAPI = {
  // 获取学生积分列表
  async getStudentPoints() {
    try {
      const res = await app.request({
        url: '/student/points',
        method: 'GET'
      });
      return res.data;
    } catch (error) {
      console.error('获取积分列表失败:', error);
      throw error;
    }
  },

  // 获取家长管理的学生列表
  async getParentStudents() {
    try {
      const res = await app.request({
        url: '/points/parent/students',
        method: 'GET'
      });
      return res.data;
    } catch (error) {
      console.error('获取学生列表失败:', error);
      throw error;
    }
  },

  // 获取学生积分详情
  async getStudentPointsDetail(studentId) {
    try {
      const res = await app.request({
        url: `/points/student/${studentId}/detail`,
        method: 'GET'
      });
      return res.data;
    } catch (error) {
      console.error('获取积分详情失败:', error);
      throw error;
    }
  },

  // 添加积分记录
  async addPoints(data) {
    try {
      const res = await app.request({
        url: '/points/add',
        method: 'POST',
        data
      });
      return res.data;
    } catch (error) {
      console.error('添加积分失败:', error);
      throw error;
    }
  },

  // 扣除积分
  async deductPoints(data) {
    try {
      const res = await app.request({
        url: '/points/deduct',
        method: 'POST',
        data
      });
      return res.data;
    } catch (error) {
      console.error('扣除积分失败:', error);
      throw error;
    }
  },

  // 获取积分历史记录
  async getPointsHistory(params = {}) {
    try {
      const res = await app.request({
        url: '/student/points/history',
        method: 'GET',
        data: params
      });
      return res.data;
    } catch (error) {
      console.error('获取积分历史失败:', error);
      throw error;
    }
  },

  // 获取积分规则
  async getPointsRules() {
    try {
      const res = await app.request({
        url: '/points/rules',
        method: 'GET'
      });
      return res.data;
    } catch (error) {
      console.error('获取积分规则失败:', error);
      throw error;
    }
  }
};

module.exports = PointsAPI; 