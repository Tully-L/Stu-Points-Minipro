const regeneratorRuntime = require('./runtime.js');
const app = getApp();

// 获取学生列表
async function getStudentList() {
  try {
    const token = wx.getStorageSync('token');
    const res = await wx.request({
      url: `${app.globalData.baseUrl}/parent/students`,
      method: 'GET',
      header: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!res.data.success) {
      throw new Error(res.data.message || '获取学生列表失败');
    }
    return res.data.data;
  } catch (error) {
    console.error('获取学生列表失败:', error);
    throw error;
  }
}

// 添加学生
async function addStudent(data) {
  try {
    const token = wx.getStorageSync('token');
    const res = await wx.request({
      url: `${app.globalData.baseUrl}/parent/students`,
      method: 'POST',
      header: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      data
    });
    
    if (!res.data.success) {
      throw new Error(res.data.message || '添加学生失败');
    }
    return res.data.data;
  } catch (error) {
    console.error('添加学生失败:', error);
    throw error;
  }
}

// 更新学生信息
async function updateStudent(studentId, data) {
  try {
    const token = wx.getStorageSync('token');
    const res = await wx.request({
      url: `${app.globalData.baseUrl}/parent/students/${studentId}`,
      method: 'PUT',
      header: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      data
    });
    
    if (!res.data.success) {
      throw new Error(res.data.message || '更新学生信息失败');
    }
    return res.data.data;
  } catch (error) {
    console.error('更新学生信息失败:', error);
    throw error;
  }
}

// 获取待审核作业列表
async function getPendingHomework(params = {}) {
  try {
    const token = wx.getStorageSync('token');
    const res = await wx.request({
      url: `${app.globalData.baseUrl}/parent/homework/pending`,
      method: 'GET',
      header: {
        'Authorization': `Bearer ${token}`
      },
      data: params
    });
    
    if (!res.data.success) {
      throw new Error(res.data.message || '获取待审核作业失败');
    }
    return res.data.data;
  } catch (error) {
    console.error('获取待审核作业失败:', error);
    throw error;
  }
}

// 获取作业详情
async function getHomeworkDetail(homeworkId) {
  try {
    const token = wx.getStorageSync('token');
    const res = await wx.request({
      url: `${app.globalData.baseUrl}/parent/homework/${homeworkId}`,
      method: 'GET',
      header: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!res.data.success) {
      throw new Error(res.data.message || '获取作业详情失败');
    }
    return res.data.data;
  } catch (error) {
    console.error('获取作业详情失败:', error);
    throw error;
  }
}

// 审核作业
async function reviewHomework(homeworkId, data) {
  try {
    const token = wx.getStorageSync('token');
    const res = await wx.request({
      url: `${app.globalData.baseUrl}/parent/homework/${homeworkId}/review`,
      method: 'POST',
      header: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      data
    });
    
    if (!res.data.success) {
      throw new Error(res.data.message || '审核作业失败');
    }
    return res.data.data;
  } catch (error) {
    console.error('审核作业失败:', error);
    throw error;
  }
}

// 获取审核锁定状态
async function getReviewLockStatus(homeworkId) {
  try {
    const token = wx.getStorageSync('token');
    const res = await wx.request({
      url: `${app.globalData.baseUrl}/parent/homework/${homeworkId}/lock`,
      method: 'GET',
      header: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!res.data.success) {
      throw new Error(res.data.message || '获取审核锁定状态失败');
    }
    return res.data.data;
  } catch (error) {
    console.error('获取审核锁定状态失败:', error);
    throw error;
  }
}

// 锁定作业审核
async function lockHomeworkReview(homeworkId) {
  try {
    const token = wx.getStorageSync('token');
    const res = await wx.request({
      url: `${app.globalData.baseUrl}/parent/homework/${homeworkId}/lock`,
      method: 'POST',
      header: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!res.data.success) {
      throw new Error(res.data.message || '锁定作业审核失败');
    }
    return res.data.data;
  } catch (error) {
    console.error('锁定作业审核失败:', error);
    throw error;
  }
}

// 解锁作业审核
async function unlockHomeworkReview(homeworkId) {
  try {
    const token = wx.getStorageSync('token');
    const res = await wx.request({
      url: `${app.globalData.baseUrl}/parent/homework/${homeworkId}/lock`,
      method: 'DELETE',
      header: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!res.data.success) {
      throw new Error(res.data.message || '解锁作业审核失败');
    }
    return res.data.data;
  } catch (error) {
    console.error('解锁作业审核失败:', error);
    throw error;
  }
}

// 接管作业审核
async function takeoverHomeworkReview(homeworkId) {
  try {
    const token = wx.getStorageSync('token');
    const res = await wx.request({
      url: `${app.globalData.baseUrl}/parent/homework/${homeworkId}/takeover`,
      method: 'POST',
      header: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!res.data.success) {
      throw new Error(res.data.message || '接管作业审核失败');
    }
    return res.data.data;
  } catch (error) {
    console.error('接管作业审核失败:', error);
    throw error;
  }
}

// 获取学生统计数据
async function getStudentStats(studentId) {
  try {
    const token = wx.getStorageSync('token');
    const res = await wx.request({
      url: `${app.globalData.baseUrl}/parent/students/${studentId}/stats`,
      method: 'GET',
      header: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!res.data.success) {
      throw new Error(res.data.message || '获取学生统计数据失败');
    }
    return res.data.data;
  } catch (error) {
    console.error('获取学生统计数据失败:', error);
    throw error;
  }
}

module.exports = {
  getStudentList,
  addStudent,
  updateStudent,
  getPendingHomework,
  getHomeworkDetail,
  reviewHomework,
  getReviewLockStatus,
  lockHomeworkReview,
  unlockHomeworkReview,
  takeoverHomeworkReview,
  getStudentStats
}; 