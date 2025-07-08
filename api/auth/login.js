const jwt = require("jsonwebtoken");
const fetch = require("node-fetch");

// 微信小程序配置
const WECHAT_APP_ID = process.env.WECHAT_APP_ID;
const WECHAT_APP_SECRET = process.env.WECHAT_APP_SECRET;
const JWT_SECRET = process.env.JWT_SECRET;

// 修改为 Express 路由处理函数
const router = async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, message: "缺少code参数" });
    }

    // 获取微信session
    const response = await fetch(
      `https://api.weixin.qq.com/sns/jscode2session?appid=${WECHAT_APP_ID}&secret=${WECHAT_APP_SECRET}&js_code=${code}&grant_type=authorization_code`
    );
    const data = await response.json();

    if (data.errcode) {
      throw new Error(data.errmsg || "微信接口调用失败");
    }

    // 生成token
    const token = jwt.sign(
      {
        openid: data.openid,
        session_key: data.session_key
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      data: {
        token,
        openid: data.openid
      }
    });
  } catch (error) {
    console.error("登录失败:", error);
    res.status(500).json({
      success: false,
      message: error.message || "登录失败"
    });
  }
};

module.exports = router;