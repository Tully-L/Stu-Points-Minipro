const regeneratorRuntime = require('./runtime.js');
const app = getApp();

// 文件类型限制
const ALLOWED_TYPES = {
  image: ['jpg', 'jpeg', 'png', 'gif'],
  video: ['mp4']
};

// 文件大小限制（单位：MB）
const SIZE_LIMITS = {
  image: 10,
  video: 50
};

// 获取文件扩展名
const getFileExtension = (path) => {
  return path.substring(path.lastIndexOf('.') + 1).toLowerCase();
};

// 获取文件名（不含路径）
const getFileName = (path) => {
  const name = path.substring(path.lastIndexOf('/') + 1);
  if (name.length > 20) {
    return name.substring(0, 17) + '...';
  }
  return name;
};

// 检查文件类型是否允许
const isFileTypeAllowed = (path) => {
  const ext = getFileExtension(path);
  return ALLOWED_TYPES.image.includes(ext) || ALLOWED_TYPES.video.includes(ext);
};

// 检查文件大小是否在限制内
const checkFileSize = async (path) => {
  try {
    const fileInfo = await wx.getFileInfo({ filePath: path });
    const sizeInMB = fileInfo.size / (1024 * 1024);
    const ext = getFileExtension(path);
    const limit = ALLOWED_TYPES.image.includes(ext) ? SIZE_LIMITS.image : SIZE_LIMITS.video;
    return sizeInMB <= limit;
  } catch (error) {
    console.error('检查文件大小失败:', error);
    return false;
  }
};

// 上传单个文件
const uploadFile = async (filePath, onProgress) => {
  try {
    if (!isFileTypeAllowed(filePath)) {
      throw new Error('不支持的文件类型');
    }

    if (!await checkFileSize(filePath)) {
      throw new Error('文件大小超出限制');
    }

    const token = await app.getToken();
    if (!token) {
      throw new Error('未登录');
    }

    return new Promise((resolve, reject) => {
      const uploadTask = wx.uploadFile({
        url: `${app.globalData.baseUrl}/upload`,
        filePath: filePath,
        name: 'file',
        header: {
          'Authorization': `Bearer ${token}`
        },
        success: (res) => {
          try {
            const data = JSON.parse(res.data);
            if (data.success) {
              resolve({
                url: data.url,
                filename: getFileName(filePath)
              });
            } else {
              reject(new Error(data.message || '上传失败'));
            }
          } catch (error) {
            reject(new Error('解析响应失败'));
          }
        },
        fail: (error) => {
          reject(new Error('上传失败: ' + error.errMsg));
        }
      });

      // 监听上传进度
      if (onProgress) {
        uploadTask.onProgressUpdate((res) => {
          onProgress(res.progress);
        });
      }
    });
  } catch (error) {
    console.error('上传文件失败:', error);
    throw error;
  }
};

// 批量上传文件
const uploadFiles = async (filePaths, onProgress) => {
  if (filePaths.length > 10) {
    throw new Error('最多可上传10个文件');
  }

  const results = [];
  const total = filePaths.length;

  for (let i = 0; i < filePaths.length; i++) {
    try {
      const result = await uploadFile(filePaths[i], (progress) => {
        if (onProgress) {
          // 计算总体进度
          const totalProgress = ((i / total) * 100) + (progress / total);
          onProgress(Math.round(totalProgress));
        }
      });
      results.push(result);
    } catch (error) {
      console.error(`文件 ${getFileName(filePaths[i])} 上传失败:`, error);
      throw error;
    }
  }

  return results;
};

// 选择文件
const chooseFiles = async (count = 10) => {
  try {
    // 先选择图片
    const imageRes = await wx.chooseImage({
      count: count,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera']
    });

    // 如果图片数量未达到上限，继续选择视频
    const remainingCount = count - imageRes.tempFilePaths.length;
    if (remainingCount > 0) {
      try {
        const videoRes = await wx.chooseVideo({
          sourceType: ['album', 'camera'],
          compressed: true,
          maxDuration: 60
        });
        return [...imageRes.tempFilePaths, videoRes.tempFilePath];
      } catch (error) {
        // 用户取消选择视频不报错
        if (error.errMsg.indexOf('cancel') === -1) {
          throw error;
        }
        return imageRes.tempFilePaths;
      }
    }

    return imageRes.tempFilePaths;
  } catch (error) {
    // 用户取消选择不报错
    if (error.errMsg.indexOf('cancel') === -1) {
      console.error('选择文件失败:', error);
      throw error;
    }
    return [];
  }
};

module.exports = {
  uploadFile,
  uploadFiles,
  chooseFiles,
  getFileName,
  ALLOWED_TYPES,
  SIZE_LIMITS
}; 