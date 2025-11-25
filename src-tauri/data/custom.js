console.log(
    '%cbuild from PakePlus： https://github.com/Sjj1024/PakePlus',
    'color:orangered;font-weight:bolder'
)

// === MAC地址验证系统 ===
const MACAuthSystem = {
    // 已授权的MAC地址列表（在生产环境中应该从服务器获取）
    authorizedMACs: [
        "XX-XX-XX-XX-XX-XX"  // 替换为你的MAC地址
    ],
    
    // 获取设备标识（模拟MAC地址）
    getDeviceFingerprint: function() {
        return new Promise((resolve) => {
            // 使用多种方式生成设备指纹
            const fingerprint = {
                userAgent: navigator.userAgent,
                language: navigator.language,
                platform: navigator.platform,
                hardwareConcurrency: navigator.hardwareConcurrency || 'unknown',
                deviceMemory: navigator.deviceMemory || 'unknown',
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                screenResolution: `${screen.width}x${screen.height}`,
                colorDepth: screen.colorDepth,
                timestamp: Date.now()
            };
            
            // 生成唯一设备ID
            const deviceId = this.generateDeviceId(fingerprint);
            resolve(deviceId);
        });
    },
    
    // 生成设备ID
    generateDeviceId: function(fingerprint) {
        const data = JSON.stringify(fingerprint);
        let hash = 0;
        for (let i = 0; i < data.length; i++) {
            const char = data.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(16).toUpperCase().substring(0, 12);
    },
    
    // 验证设备是否授权
    validateDevice: async function() {
        try {
            const deviceId = await this.getDeviceFingerprint();
            const isAuthorized = this.authorizedMACs.some(mac => 
                mac === "XX-XX-XX-XX-XX-XX" || // 通配符，用于测试
                this.checkMACFormat(deviceId)
            );
            
            console.log('Device validation:', {
                deviceId: deviceId,
                isAuthorized: isAuthorized,
                authorizedMACs: this.authorizedMACs
            });
            
            return isAuthorized;
        } catch (error) {
            console.error('Device validation failed:', error);
            return false;
        }
    },
    
    // 检查MAC格式
    checkMACFormat: function(mac) {
        return /^[0-9A-F]{12}$/.test(mac);
    },
    
    // 显示授权界面
    showAuthInterface: function() {
        // 隐藏原有内容
        const originalContent = document.body.innerHTML;
        document.body.style.display = 'none';
        
        // 保存原始内容到本地存储
        localStorage.setItem('originalAppContent', originalContent);
        
        // 创建授权界面
        const authHTML = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                display: flex;
                justify-content: center;
                align-items: center;
                font-family: Arial, sans-serif;
                z-index: 9999;
            ">
                <div style="
                    background: white;
                    padding: 40px;
                    border-radius: 15px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                    text-align: center;
                    max-width: 500px;
                    width: 90%;
                ">
                    <h1 style="color: #333; margin-bottom: 20px;">🔐 软件授权验证</h1>
                    <p style="color: #666; margin-bottom: 30px; line-height: 1.6;">
                        此软件需要授权才能使用。请联系管理员获取访问权限。
                    </p>
                    
                    <div style="
                        background: #f8f9fa;
                        padding: 15px;
                        border-radius: 8px;
                        margin: 20px 0;
                        font-family: monospace;
                        word-break: break-all;
                    ">
                        <strong>设备ID:</strong><br>
                        <span id="deviceIdDisplay">正在获取...</span>
                    </div>
                    
                    <div style="margin: 20px 0;">
                        <input type="password" 
                               id="licenseKey" 
                               placeholder="请输入授权密钥" 
                               style="
                                   width: 100%;
                                   padding: 12px;
                                   border: 2px solid #ddd;
                                   border-radius: 6px;
                                   font-size: 16px;
                                   margin-bottom: 15px;
                               ">
                        <button onclick="MACAuthSystem.checkLicenseKey()" 
                                style="
                                    width: 100%;
                                    padding: 12px;
                                    background: #667eea;
                                    color: white;
                                    border: none;
                                    border-radius: 6px;
                                    font-size: 16px;
                                    cursor: pointer;
                                ">
                            验证授权
                        </button>
                    </div>
                    
                    <p style="color: #999; font-size: 12px; margin-top: 20px;">
                        如无法验证，请联系系统管理员提供您的设备ID
                    </p>
                </div>
            </div>
        `;
        
        document.body.innerHTML = authHTML;
        
        // 显示设备ID
        this.getDeviceFingerprint().then(deviceId => {
            document.getElementById('deviceIdDisplay').textContent = deviceId;
        });
    },
    
    // 检查授权密钥
    checkLicenseKey: function() {
        const licenseKey = document.getElementById('licenseKey').value;
        const deviceId = document.getElementById('deviceIdDisplay').textContent;
        
        // 简单的密钥验证逻辑（生产环境中应该从服务器验证）
        const isValid = this.validateLicenseKey(licenseKey, deviceId);
        
        if (isValid) {
            // 保存授权状态
            localStorage.setItem('deviceAuthorized', 'true');
            localStorage.setItem('authorizedDeviceId', deviceId);
            localStorage.setItem('authTimestamp', Date.now().toString());
            
            // 恢复应用界面
            this.restoreApplication();
        } else {
            alert('❌ 授权密钥无效！请检查后重试。');
        }
    },
    
    // 验证密钥（简单示例，生产环境需要更复杂的逻辑）
    validateLicenseKey: function(key, deviceId) {
        // 示例验证逻辑：密钥为设备ID的哈希值
        const expectedKey = this.generateLicenseKey(deviceId);
        return key === expectedKey;
    },
    
    // 生成授权密钥（示例）
    generateLicenseKey: function(deviceId) {
        // 简单的密钥生成算法（生产环境需要更安全的算法）
        let hash = 0;
        for (let i = 0; i < deviceId.length; i++) {
            hash = ((hash << 5) - hash) + deviceId.charCodeAt(i);
            hash = hash & hash;
        }
        return `LIC-${Math.abs(hash).toString(36).toUpperCase().substring(0, 8)}`;
    },
    
    // 恢复应用界面
    restoreApplication: function() {
        const originalContent = localStorage.getItem('originalAppContent');
        if (originalContent) {
            document.body.innerHTML = originalContent;
            document.body.style.display = 'block';
            
            // 重新应用布局修复
            if (window.applyLayoutFix) {
                applyLayoutFix();
            }
            
            // 重新绑定事件
            if (window.hookClick) {
                document.addEventListener('click', hookClick, { capture: true });
            }
        } else {
            location.reload();
        }
    },
    
    // 初始化验证系统
    init: async function() {
        // 检查是否已经授权
        const isAuthorized = localStorage.getItem('deviceAuthorized') === 'true';
        const authTimestamp = parseInt(localStorage.getItem('authTimestamp') || '0');
        const authorizedDeviceId = localStorage.getItem('authorizedDeviceId');
        
        // 验证授权时效性（1天）
        const isAuthValid = isAuthorized && 
                           (Date.now() - authTimestamp) < (1 * 24 * 60 * 60 * 1000);
        
        if (isAuthValid) {
            // 验证当前设备是否与授权设备一致
            const currentDeviceId = await this.getDeviceFingerprint();
            if (currentDeviceId === authorizedDeviceId) {
                console.log('Device authorization valid');
                return true;
            }
        }
        
        // 显示授权界面
        this.showAuthInterface();
        return false;
    }
};

// === 原有的链接处理逻辑 ===
const hookClick = (e) => {
    const origin = e.target.closest('a')
    const isBaseTargetBlank = document.querySelector('head base[target="_blank"]')
    
    if (origin && origin.href) {
        const currentHost = window.location.hostname;
        const targetHost = origin.hostname;
        const isExternal = targetHost && targetHost !== currentHost;
        const isBlankTarget = origin.target === '_blank';
        
        if ((isBlankTarget && isExternal) || (isExternal && isBaseTargetBlank)) {
            e.preventDefault()
            location.href = origin.href
        }
    }
}

// 修复window.open
const originalOpen = window.open;
window.open = function (url, target, features) {
    if (url && typeof url === 'string') {
        const currentHost = window.location.hostname;
        const targetHost = new URL(url, window.location.origin).hostname;
        const isExternal = targetHost && targetHost !== currentHost;
        
        if (isExternal) {
            location.href = url
            return null;
        }
    }
    
    return originalOpen.call(this, url, target, features);
}

// === 初始化 ===
document.addEventListener('DOMContentLoaded', async function() {
    console.log('PakePlus with MAC authentication loaded');
    
    // 初始化MAC地址验证
    const isAuthenticated = await MACAuthSystem.init();
    
    if (isAuthenticated) {
        // 只有验证通过才加载原有功能
        document.addEventListener('click', hookClick, { capture: true });
        
        // 应用布局修复（如果存在）
        if (window.applyLayoutFix) {
            setTimeout(applyLayoutFix, 100);
        }
    }
});

// 导出到全局作用域
window.MACAuthSystem = MACAuthSystem;
window.hookClick = hookClick;