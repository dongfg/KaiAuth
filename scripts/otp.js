/**
 * eg. otpauth://totp/Microsoft?secret=4B54N4QB2ORLEPSQK5WKVXUGC7ECQPGT&issuer=dongfg%40hotmail.com
 * 解析 { secret, issuer, account, digits, period }
 */
function parseTOTPURI(uri) {
  console.log("parseTOTPURI", uri);
  try {
    // 1. 基础校验
    if (!uri || uri.toLowerCase().indexOf('otpauth://totp/') !== 0) {
      throw new Error('不支持的协议格式或非 TOTP 类型');
    }

    var url = new URL(uri.replace("otpauth", "http"));

    // 2. 解析 Label (格式通常为 /Issuer:Account)
    // 使用 decodeURIComponent 处理 URL 编码的字符
    var rawPath = decodeURIComponent(url.pathname.substring(1));
    var labelParts = rawPath.split(':');

    var issuerFromPath = '';
    var account = '';

    if (labelParts.length > 1) {
      issuerFromPath = labelParts[0].trim();
      account = labelParts.slice(1).join(':').trim();
    } else {
      account = labelParts[0].trim();
    }

    // 3. 解析查询参数 (兼容 Gecko 48 的 searchParams)
    var sp = url.searchParams;

    const algorithm = (sp.get('algorithm') || 'SHA1').toUpperCase();
    if (algorithm && algorithm !== "SHA1") {
      throw new Error('只支持 SHA1 算法');
    }

    // 4. 构建返回对象
    var config = {
      secret: sp.get('secret'),
      issuer: sp.get('issuer') || issuerFromPath,
      account: account,
      digits: parseInt(sp.get('digits'), 10) || 6,
      period: parseInt(sp.get('period'), 10) || 30
    };

    // 5. 最终校验
    if (!config.secret) {
      throw new Error('URI 中缺失 secret 参数');
    }

    return config;

  } catch (e) {
    console.error('TOTP 解析失败:', e.message);
    return null;
  }
}

/**
 * { secret, issuer, account, digits, period }
 */
function generateTOTPCode(token) {
  var totp = new jsOTP.totp(token.period, token.digits);
  return totp.getOtp(token.secret)
}