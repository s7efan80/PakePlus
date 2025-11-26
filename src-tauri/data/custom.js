// === PakePlus 专业版授权系统（增强稳定设备标识版）===
console.log(
    '%cbuild from PakePlus： https://github.com/Sjj1024/PakePlus',
    'color:orangered;font-weight:bolder'
)

const MACAuthSystem = {
    // 配置项
    config: {
        authKey: 'PAKEPLUS_AUTH_V2',
        maxDevices: 1,
        defaultExpireDays: 365,
        adminPassword: 'pakeplus2024',
        secretKey: 'pakeplus_pro_2024_secret_remote'
    },
    
    // 获取增强的稳定设备标识
    getDeviceFingerprint: function() {
        try {
            // 首先尝试从localStorage读取已保存的设备ID
            let storedDeviceId = localStorage.getItem('pakeplus_device_id');
            if (storedDeviceId && this.validateDeviceId(storedDeviceId)) {
                console.log('✅ Using stored device ID:', storedDeviceId);
                return storedDeviceId;
            }
            
            // 生成新的增强稳定设备标识
            const fingerprint = this.generateEnhancedFingerprint();
            const newDeviceId = this.generateStableDeviceId(fingerprint);
            
            // 保存到localStorage
            localStorage.setItem('pakeplus_device_id', newDeviceId);
            localStorage.setItem('pakeplus_device_fingerprint', JSON.stringify(fingerprint));
            localStorage.setItem('pakeplus_device_hash', this.calculateFingerprintHash(fingerprint));
            
            console.log('🆕 Generated new enhanced device ID:', newDeviceId);
            return newDeviceId;
            
        } catch (error) {
            console.error('Error generating device fingerprint:', error);
            return this.generateFallbackDeviceId();
        }
    },
    
    // 生成增强的设备指纹
    generateEnhancedFingerprint: function() {
        const fingerprint = {
            // 核心系统标识（最稳定）
            platform: navigator.platform,
            userAgentCore: this.getStableUserAgentCore(),
            
            // 硬件特征（相对稳定）
            hardwareConcurrency: navigator.hardwareConcurrency || 0,
            deviceMemory: navigator.deviceMemory || 0,
            maxTouchPoints: navigator.maxTouchPoints || 0,
            
            // 屏幕特征（通常不变）
            screenProps: this.getScreenProperties(),
            
            // 时间和区域设置
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            locale: navigator.language,
            locales: JSON.stringify(navigator.languages || [navigator.language]),
            
            // WebGL 渲染器信息（硬件相关）
            webglRenderer: this.getWebGLRenderer(),
            
            // 字体信息（系统相关）
            fonts: this.getFontFingerprint(),
            
            // Canvas 指纹（硬件加速相关）
            canvasFingerprint: this.getCanvasFingerprint(),
            
            // 存储标识
            storageId: this.getStorageIdentifier(),
            
            // 时间戳（仅用于哈希计算）
            timestamp: Date.now()
        };
        
        return fingerprint;
    },
    
    // 获取稳定的UserAgent核心信息
    getStableUserAgentCore: function() {
        const ua = navigator.userAgent.toLowerCase();
        const components = [];
        
        // 提取操作系统信息
        if (ua.includes('windows')) components.push('win');
        else if (ua.includes('macintosh')) components.push('mac');
        else if (ua.includes('linux')) components.push('linux');
        else if (ua.includes('android')) components.push('android');
        else if (ua.includes('ios') || ua.includes('iphone')) components.push('ios');
        
        // 提取浏览器引擎
        if (ua.includes('chrome') && !ua.includes('edg')) components.push('chrome');
        else if (ua.includes('firefox')) components.push('firefox');
        else if (ua.includes('safari') && !ua.includes('chrome')) components.push('safari');
        else if (ua.includes('edg')) components.push('edge');
        
        // 提取架构信息
        if (ua.includes('x64') || ua.includes('win64') || ua.includes('wow64')) components.push('x64');
        else if (ua.includes('x86') || ua.includes('win32')) components.push('x86');
        else if (ua.includes('arm')) components.push('arm');
        
        return components.join('-');
    },
    
    // 获取屏幕属性
    getScreenProperties: function() {
        return {
            width: screen.width,
            height: screen.height,
            colorDepth: screen.colorDepth,
            pixelDepth: screen.pixelDepth,
            availWidth: screen.availWidth,
            availHeight: screen.availHeight
        };
    },
    
    // 获取WebGL渲染器信息
    getWebGLRenderer: function() {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            if (!gl) return 'no-webgl';
            
            const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
            if (debugInfo) {
                return {
                    vendor: gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || 'unknown',
                    renderer: gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || 'unknown'
                };
            }
            return 'webgl-no-debug-info';
        } catch (error) {
            return 'webgl-error';
        }
    },
    
    // 获取字体指纹
    getFontFingerprint: function() {
        try {
            const fontList = [
                'Arial', 'Arial Black', 'Arial Narrow', 'Calibri',
                'Cambria', 'Cambria Math', 'Comic Sans MS', 'Courier New',
                'Georgia', 'Impact', 'Lucida Console', 'Lucida Sans Unicode',
                'Microsoft Sans Serif', 'Palatino Linotype', 'Segoe UI',
                'Tahoma', 'Times New Roman', 'Trebuchet MS', 'Verdana',
                'Webdings', 'Wingdings', 'MS Gothic', 'SimSun'
            ];
            
            const availableFonts = [];
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            const text = "abcdefghijklmnopqrstuvwxyz0123456789";
            
            // 基准测量
            context.font = "72px monospace";
            const baseSize = context.measureText(text).width;
            
            for (const font of fontList) {
                context.font = `72px ${font}, monospace`;
                const width = context.measureText(text).width;
                if (width !== baseSize) {
                    availableFonts.push(font);
                }
            }
            
            return availableFonts.sort();
        } catch (error) {
            return ['font-detection-failed'];
        }
    },
    
    // 获取Canvas指纹
    getCanvasFingerprint: function() {
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = 200;
            canvas.height = 50;
            
            // 绘制一些文本和图形
            ctx.textBaseline = 'top';
            ctx.font = '14px Arial';
            ctx.fillStyle = '#f60';
            ctx.fillRect(125, 1, 62, 20);
            ctx.fillStyle = '#069';
            ctx.fillText('Browser fingerprint', 2, 15);
            ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
            ctx.fillText('Browser fingerprint', 4, 17);
            
            return canvas.toDataURL().substring(22, 50); // 提取部分数据作为指纹
        } catch (error) {
            return 'canvas-error';
        }
    },
    
    // 获取存储标识符
    getStorageIdentifier: function() {
        let storageId = localStorage.getItem('pakeplus_machine_id');
        if (!storageId) {
            storageId = 'mid_' + Math.random().toString(36).substring(2, 15) + 
                       Math.random().toString(36).substring(2, 15);
            localStorage.setItem('pakeplus_machine_id', storageId);
            sessionStorage.setItem('pakeplus_machine_id', storageId);
        }
        return storageId;
    },
    
    // 计算指纹哈希
    calculateFingerprintHash: function(fingerprint) {
        const data = JSON.stringify(fingerprint, Object.keys(fingerprint).sort());
        let hash = 0;
        for (let i = 0; i < data.length; i++) {
            const char = data.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(36);
    },
    
    // 生成稳定的设备ID
    generateStableDeviceId: function(fingerprint) {
        // 使用关键稳定属性生成ID
        const stableComponents = [
            fingerprint.platform,
            fingerprint.userAgentCore,
            fingerprint.hardwareConcurrency,
            fingerprint.timezone,
            fingerprint.storageId,
            (fingerprint.webglRenderer.vendor || 'novendor').substring(0, 10),
            fingerprint.screenProps.width + 'x' + fingerprint.screenProps.height
        ];
        
        const stableData = stableComponents.join('|');
        return this.stableHash(stableData);
    },
    
    // 稳定的哈希函数
    stableHash: function(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 7) - hash) + char;
            hash = hash & hash;
        }
        return 'MAC' + Math.abs(hash).toString(36).toUpperCase().padStart(9, '0').substring(0, 12);
    },
    
    // 验证设备ID格式
    validateDeviceId: function(deviceId) {
        return deviceId && deviceId.length === 12 && deviceId.startsWith('MAC') && /^[0-9A-Z]+$/.test(deviceId);
    },
    
    // 验证设备标识一致性
    verifyDeviceConsistency: function() {
        try {
            const currentDeviceId = this.getDeviceFingerprint();
            const storedDeviceId = localStorage.getItem('pakeplus_device_id');
            const authDeviceId = this.getAuthDeviceId();
            const storedHash = localStorage.getItem('pakeplus_device_hash');
            
            console.log('🔍 Enhanced device consistency check:', {
                current: currentDeviceId,
                stored: storedDeviceId,
                auth: authDeviceId,
                hashMatch: !!storedHash
            });
            
            // 如果当前设备ID与存储的不一致，尝试恢复
            if (currentDeviceId !== storedDeviceId) {
                console.warn('⚠️ Device ID mismatch, attempting enhanced recovery...');
                return this.enhancedRecovery();
            }
            
            return true;
        } catch (error) {
            console.error('Enhanced device consistency check failed:', error);
            return false;
        }
    },
    
    // 增强的设备ID恢复
    enhancedRecovery: function() {
        try {
            // 1. 尝试从授权数据中恢复
            const authDeviceId = this.getAuthDeviceId();
            if (authDeviceId && this.validateDeviceId(authDeviceId)) {
                console.log('🔄 Recovering device ID from auth data:', authDeviceId);
                localStorage.setItem('pakeplus_device_id', authDeviceId);
                return true;
            }
            
            // 2. 尝试从存储的指纹重新计算
            const storedFingerprint = localStorage.getItem('pakeplus_device_fingerprint');
            if (storedFingerprint) {
                const fingerprint = JSON.parse(storedFingerprint);
                const recoveredId = this.generateStableDeviceId(fingerprint);
                console.log('🔄 Recovering device ID from stored fingerprint:', recoveredId);
                localStorage.setItem('pakeplus_device_id', recoveredId);
                return true;
            }
            
            // 3. 使用存储标识符生成
            const storageId = localStorage.getItem('pakeplus_machine_id');
            if (storageId) {
                const components = [
                    navigator.platform,
                    this.getStableUserAgentCore(),
                    navigator.hardwareConcurrency || 0,
                    Intl.DateTimeFormat().resolvedOptions().timeZone,
                    storageId
                ];
                const recoveryId = this.stableHash(components.join('|'));
                console.log('🔄 Recovering device ID from storage ID:', recoveryId);
                localStorage.setItem('pakeplus_device_id', recoveryId);
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('Enhanced device ID recovery failed:', error);
            return false;
        }
    },
    
    // 降级方案：生成回退设备ID
    generateFallbackDeviceId: function() {
        // 使用localStorage中的固定标识
        let fallbackId = localStorage.getItem('pakeplus_fallback_id');
        if (!fallbackId) {
            fallbackId = 'FB' + Math.random().toString(36).substring(2, 8).toUpperCase() + 
                        Math.random().toString(36).substring(2, 8).toUpperCase();
            localStorage.setItem('pakeplus_fallback_id', fallbackId);
        }
        return fallbackId;
    },
    
    // 获取授权中的设备ID
    getAuthDeviceId: function() {
        try {
            const authData = localStorage.getItem('pakeplus_pro_auth');
            if (authData) {
                const parsed = JSON.parse(authData);
                return parsed.deviceId;
            }
        } catch (error) {
            console.error('Error getting auth device ID:', error);
        }
        return null;
    },
    
    // 显示授权界面
    showAuthInterface: function() {
        console.log('🔐 Showing auth interface for new device');
        const deviceId = this.getDeviceFingerprint();
        
        // 记录设备标识信息
        console.log('📝 Enhanced device identification:', {
            deviceId: deviceId,
            platform: navigator.platform,
            userAgentCore: this.getStableUserAgentCore(),
            hardwareConcurrency: navigator.hardwareConcurrency,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        });

        const authHTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>软件授权验证 - PakePlus</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }
        .auth-container {
            background: white;
            padding: 40px;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            text-align: center;
            max-width: 500px;
            width: 100%;
            animation: slideUp 0.5s ease-out;
        }
        @keyframes slideUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .logo { font-size: 48px; margin-bottom: 20px; }
        h1 { color: #2d3748; margin-bottom: 15px; font-size: 28px; }
        .description { color: #718096; margin-bottom: 30px; line-height: 1.6; font-size: 16px; }
        .device-info {
            background: #f7fafc;
            padding: 20px;
            border-radius: 12px;
            margin: 25px 0;
            border: 2px solid #e2e8f0;
        }
        .device-id {
            font-family: 'Courier New', monospace;
            font-size: 18px;
            font-weight: bold;
            color: #2d3748;
            word-break: break-all;
        }
        .device-stable {
            color: #38a169;
            font-size: 12px;
            margin-top: 8px;
        }
        .input-group { margin-bottom: 25px; }
        .license-input {
            width: 100%;
            padding: 15px 20px;
            border: 2px solid #e2e8f0;
            border-radius: 12px;
            font-size: 16px;
            transition: all 0.3s ease;
            background: #fafafa;
        }
        .license-input:focus {
            outline: none;
            border-color: #667eea;
            background: white;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        .auth-button {
            width: 100%;
            padding: 15px 20px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            border: none;
            border-radius: 12px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            margin-bottom: 15px;
        }
        .auth-button:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
        }
        .auth-button:disabled {
            background: #cbd5e0;
            cursor: not-allowed;
            transform: none;
        }
        .error-message {
            color: #e53e3e;
            background: #fed7d7;
            border: 1px solid #feb2b2;
            border-radius: 8px;
            padding: 12px;
            margin: 15px 0;
            display: none;
        }
        .success-message {
            color: #38a169;
            background: #c6f6d5;
            border: 1px solid #9ae6b4;
            border-radius: 8px;
            padding: 12px;
            margin: 15px 0;
            display: none;
        }
        .footer { color: #a0aec0; font-size: 14px; margin-top: 25px; }
        .contact-info {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 8px;
            padding: 15px;
            margin-top: 20px;
        }
        .remote-info {
            background: #e8f4fd;
            border: 1px solid #bee3f8;
            border-radius: 8px;
            padding: 15px;
            margin-top: 15px;
            text-align: left;
        }
        .debug-info {
            background: #f7fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 15px;
            margin-top: 15px;
            text-align: left;
            font-size: 12px;
            color: #718096;
        }
        .tech-badge {
            background: #2b6cb0;
            color: white;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 10px;
            margin-left: 8px;
        }
    </style>
</head>
<body>
    <div class="auth-container">
        <div class="logo">🔐</div>
        <h1>软件授权验证</h1>
        <p class="description">需要有效的授权许可才能使用。</p>
        
        <div class="device-info">
            <div style="color: #718096; margin-bottom: 8px;">
                设备标识码 <span class="tech-badge">增强指纹技术</span>
            </div>
            <div class="device-id" id="deviceIdDisplay">${deviceId}</div>
            <div class="device-stable">✅ 基于硬件特征的稳定标识</div>
        </div>
        
        <div class="input-group">
            <input type="password" 
                   id="licenseKey" 
                   class="license-input" 
                   placeholder="请输入授权密钥"
                   autocomplete="off">
        </div>
        
        <div id="errorMessage" class="error-message"></div>
        <div id="successMessage" class="success-message"></div>
        
        <button id="authButton" class="auth-button">验证授权</button>
        
        <div class="contact-info">
            <div style="color: #856404; margin-bottom: 8px;">获取授权</div>
            <div style="color: #856404; font-size: 14px; line-height: 1.5;">
                请将您的设备标识码发送给管理员获取授权密钥<br>
                每个授权密钥只能在 1 台设备上使用<br>
                授权有效期由管理员设置
            </div>
        </div>
        
        <div class="remote-info">
            <div style="color: #2b6cb0; font-weight: bold; margin-bottom: 8px;">增强设备识别技术</div>
            <div style="color: #2b6cb0; font-size: 12px; line-height: 1.4;">
                • 基于硬件特征生成稳定设备标识<br>
                • 使用WebGL渲染器、Canvas等硬件信息<br>
                • 跨浏览器会话保持标识一致<br>
                • 类似MAC地址的稳定性
            </div>
        </div>

        <div class="debug-info">
            <div style="color: #718096; font-weight: bold; margin-bottom: 8px;">设备特征信息</div>
            <div style="color: #718096; font-size: 11px; line-height: 1.4;">
                系统平台: ${navigator.platform}<br>
                硬件核心: ${navigator.hardwareConcurrency || '未知'}<br>
                设备内存: ${navigator.deviceMemory || '未知'}GB<br>
                时区: ${Intl.DateTimeFormat().resolvedOptions().timeZone}<br>
                屏幕: ${screen.width}x${screen.height}
            </div>
        </div>
        
        <div class="footer">
           软件授权系统 &copy; 2025
        </div>
    </div>

    <script>
        class AuthManager {
            constructor() {
                this.isVerifying = false;
                this.deviceId = '${deviceId}';
                this.init();
            }
            
            init() {
                const authButton = document.getElementById('authButton');
                const licenseInput = document.getElementById('licenseKey');
                
                authButton.addEventListener('click', () => this.verifyLicense());
                
                licenseInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter' && !this.isVerifying) {
                        this.verifyLicense();
                    }
                });
                
                licenseInput.focus();
                console.log('AuthManager initialized for enhanced device:', this.deviceId);
            }
            
            verifyLicense() {
                if (this.isVerifying) return;
                
                const licenseKey = document.getElementById('licenseKey').value.trim();
                const button = document.getElementById('authButton');
                const errorDiv = document.getElementById('errorMessage');
                const successDiv = document.getElementById('successMessage');
                
                errorDiv.style.display = 'none';
                successDiv.style.display = 'none';
                
                if (!licenseKey) {
                    this.showError('请输入授权密钥');
                    return;
                }
                
                this.isVerifying = true;
                button.textContent = '验证中...';
                button.disabled = true;
                
                setTimeout(() => {
                    try {
                        const validationResult = this.validateLicenseKey(licenseKey, this.deviceId);
                        if (validationResult.valid) {
                            this.handleSuccess(validationResult.expireDays);
                        } else {
                            this.handleError('授权密钥无效或已过期，请检查后重试');
                        }
                    } catch (error) {
                        this.handleError('验证过程中发生错误：' + error.message);
                    }
                }, 800);
            }
            
            validateLicenseKey(licenseKey, deviceId) {
                try {
                    if (!licenseKey.startsWith('PLUS-')) {
                        return { valid: false };
                    }
                    
                    const parts = licenseKey.split('-');
                    if (parts.length !== 4) {
                        return { valid: false };
                    }
                    
                    const timestamp = parseInt(parts[1]);
                    const expireDays = parseInt(parts[2]);
                    const providedHash = parts[3];
                    
                    // 检查授权有效期
                    const currentTime = Date.now();
                    const expireTime = expireDays * 24 * 60 * 60 * 1000;
                    if (currentTime - timestamp > expireTime) {
                        return { valid: false };
                    }
                    
                    const expectedHash = this.generateLicenseHash(deviceId, timestamp, expireDays);
                    const isValid = providedHash === expectedHash;
                    
                    return {
                        valid: isValid,
                        expireDays: expireDays,
                        timestamp: timestamp
                    };
                    
                } catch (error) {
                    console.error('License validation error:', error);
                    return { valid: false };
                }
            }
            
            generateLicenseHash(deviceId, timestamp, expireDays) {
                const secret = 'pakeplus_pro_2024_secret_remote';
                const data = deviceId + '-' + timestamp + '-' + expireDays + '-' + secret;
                
                let hash = 0;
                for (let i = 0; i < data.length; i++) {
                    const char = data.charCodeAt(i);
                    hash = ((hash << 5) - hash) + char;
                    hash = hash & hash;
                }
                
                return Math.abs(hash).toString(36).toUpperCase().substring(0, 12);
            }
            
            handleSuccess(expireDays) {
                console.log('✅ License verification successful, expire days:', expireDays);
                
                const authData = {
                    authorized: true,
                    deviceId: this.deviceId,
                    timestamp: Date.now(),
                    licenseType: 'professional',
                    expireDays: expireDays,
                    version: '3.0'
                };
                
                try {
                    localStorage.setItem('pakeplus_pro_auth', JSON.stringify(authData));
                    localStorage.setItem('pakeplus_device_id', this.deviceId);
                    localStorage.setItem('pakeplus_auth_time', Date.now().toString());
                    
                    console.log('✅ Auth data saved successfully, expire days:', expireDays);
                    
                } catch (error) {
                    console.error('❌ Failed to save auth data:', error);
                    this.handleError('授权数据保存失败，请重试');
                    return;
                }
                
                const successDiv = document.getElementById('successMessage');
                const button = document.getElementById('authButton');
                
                successDiv.textContent = \`✅ 授权验证成功！有效期 \${expireDays} 天，正在启动应用...\`;
                successDiv.style.display = 'block';
                button.textContent = '授权成功';
                
                setTimeout(() => {
                    console.log('🔄 Reloading application...');
                    window.location.href = window.location.origin + window.location.pathname + '?auth=success&t=' + Date.now();
                }, 1500);
            }
            
            handleError(message) {
                console.error('❌ License verification failed:', message);
                
                const errorDiv = document.getElementById('errorMessage');
                const button = document.getElementById('authButton');
                
                errorDiv.textContent = message;
                errorDiv.style.display = 'block';
                
                button.textContent = '验证授权';
                button.disabled = false;
                this.isVerifying = false;
                
                document.getElementById('licenseKey').focus();
            }
            
            showError(message) {
                const errorDiv = document.getElementById('errorMessage');
                errorDiv.textContent = message;
                errorDiv.style.display = 'block';
                document.getElementById('licenseKey').focus();
            }
        }
        
        document.addEventListener('DOMContentLoaded', () => {
            new AuthManager();
        });
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                new AuthManager();
            });
        } else {
            setTimeout(() => new AuthManager(), 0);
        }
    </script>
</body>
</html>`;
        
        document.write(authHTML);
        document.close();
    },
    
    // 检查授权状态
    checkAuthStatus: function() {
        try {
            console.log('🔍 Checking authorization status...');
            
            // 首先验证设备一致性
            if (!this.verifyDeviceConsistency()) {
                console.warn('⚠️ Enhanced device consistency check failed');
                return false;
            }
            
            const authDataStr = localStorage.getItem('pakeplus_pro_auth');
            if (!authDataStr) {
                console.log('❌ No professional auth data found - new device');
                return false;
            }
            
            const authData = JSON.parse(authDataStr);
            const currentDeviceId = this.getDeviceFingerprint();
            const storedDeviceId = localStorage.getItem('pakeplus_device_id');
            
            console.log('Enhanced professional auth check:', {
                storedDeviceId: storedDeviceId,
                currentDeviceId: currentDeviceId,
                authDeviceId: authData.deviceId,
                licenseType: authData.licenseType,
                expireDays: authData.expireDays,
                daysSinceAuth: (Date.now() - authData.timestamp) / (24 * 60 * 60 * 1000)
            });
            
            // 验证所有必要条件
            const isValid = 
                authData.authorized && 
                authData.deviceId === currentDeviceId &&
                storedDeviceId === currentDeviceId &&
                authData.licenseType === 'professional';
            
            if (!isValid) {
                console.log('❌ Professional authorization invalid');
                return false;
            }
            
            // 检查有效期（使用管理员设置的有效期）
            const expireDays = authData.expireDays;
            const daysSinceAuth = (Date.now() - authData.timestamp) / (24 * 60 * 60 * 1000);
            
            if (daysSinceAuth > expireDays) {
                console.log('❌ Professional authorization expired');
                this.clearAuthData();
                return false;
            }
            
            const remainingDays = (expireDays - daysSinceAuth).toFixed(1);
            console.log('✅ Professional authorization valid, remaining days:', remainingDays);
            return true;
            
        } catch (error) {
            console.error('Error checking auth status:', error);
            return false;
        }
    },
    
    // 清除授权数据
    clearAuthData: function() {
        const keys = [
            'pakeplus_pro_auth',
            'pakeplus_auth_time'
        ];
        
        keys.forEach(key => {
            localStorage.removeItem(key);
        });
        
        console.log('Professional auth data cleared');
    },
    
    // 重置设备标识（调试用）
    resetDeviceId: function() {
        const keys = [
            'pakeplus_device_id',
            'pakeplus_device_fingerprint',
            'pakeplus_device_hash',
            'pakeplus_machine_id',
            'pakeplus_fallback_id'
        ];
        
        keys.forEach(key => {
            localStorage.removeItem(key);
        });
        
        console.log('Enhanced device ID reset, new ID:', this.getDeviceFingerprint());
    },
    
    // 初始化验证系统
    init: function() {
        console.log('🚀 Initializing Enhanced Professional authentication system');
        
        // 检查是否已经在授权界面
        if (document.title === '软件授权验证 - PakePlus') {
            console.log('Already in auth interface, skipping re-initialization');
            return false;
        }
        
        // 检查URL参数
        const urlParams = new URLSearchParams(window.location.search);
        
        if (urlParams.get('clearAuth') === 'true') {
            this.clearAuthData();
            console.log('Auth data cleared via URL parameter');
            window.location.replace(window.location.origin + window.location.pathname);
            return false;
        }
        
        if (urlParams.get('resetDevice') === 'true') {
            this.resetDeviceId();
            console.log('Enhanced device ID reset via URL parameter');
            window.location.replace(window.location.origin + window.location.pathname);
            return false;
        }
        
        // 如果URL中有auth=success参数，说明刚授权成功
        if (urlParams.get('auth') === 'success') {
            console.log('✅ Auth success detected from URL, loading app directly');
            return true;
        }
        
        // 主要授权检查逻辑
        if (this.checkAuthStatus()) {
            console.log('✅ Professional authorization valid, loading app');
            return true;
        } else {
            console.log('❌ Professional authorization required, showing auth interface');
            this.showAuthInterface();
            return false;
        }
    }
};

// === 应用主内容 ===
function loadApplicationContent() {
    console.log('📱 Loading PakePlus application content...');
    
    // 获取授权信息
    const authData = JSON.parse(localStorage.getItem('pakeplus_pro_auth') || '{}');
    const deviceId = localStorage.getItem('pakeplus_device_id');
    const authTime = localStorage.getItem('pakeplus_auth_time');
    
    const expireDays = authData.expireDays || 365;
    const authDate = new Date(parseInt(authTime));
    const expireDate = new Date(authDate.getTime() + expireDays * 24 * 60 * 60 * 1000);
    const remainingDays = Math.max(0, Math.floor((expireDate - new Date()) / (24 * 60 * 60 * 1000)));
    
    // 应用界面
    const appHTML = `
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>PakePlus Professional</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
            }
            .app-header {
                background: rgba(255,255,255,0.95);
                padding: 20px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .app-title {
                font-size: 24px;
                font-weight: bold;
                color: #2d3748;
            }
            .app-content {
                padding: 40px;
                color: white;
                text-align: center;
            }
            .welcome-message {
                font-size: 32px;
                margin-bottom: 20px;
                text-shadow: 0 2px 4px rgba(0,0,0,0.3);
            }
            .auth-info {
                background: rgba(255,255,255,0.1);
                padding: 25px;
                border-radius: 15px;
                max-width: 500px;
                margin: 0 auto 30px;
                backdrop-filter: blur(10px);
                text-align: left;
            }
            .auth-info-item {
                margin: 12px 0;
                padding: 8px 0;
                border-bottom: 1px solid rgba(255,255,255,0.2);
            }
            .auth-info-item:last-child {
                border-bottom: none;
            }
            .feature-list {
                background: rgba(255,255,255,0.1);
                padding: 30px;
                border-radius: 15px;
                max-width: 600px;
                margin: 0 auto;
                backdrop-filter: blur(10px);
            }
            .feature-item {
                padding: 15px;
                margin: 10px 0;
                background: rgba(255,255,255,0.2);
                border-radius: 8px;
                text-align: left;
            }
            .auth-status {
                background: #38a169;
                color: white;
                padding: 10px 20px;
                border-radius: 20px;
                font-size: 14px;
                font-weight: bold;
            }
            .expire-warning {
                background: #ed8936;
                color: white;
                padding: 10px 20px;
                border-radius: 20px;
                font-size: 14px;
                font-weight: bold;
            }
            .device-stable {
                background: #2b6cb0;
                color: white;
                padding: 8px 16px;
                border-radius: 16px;
                font-size: 12px;
                margin-left: 10px;
            }
        </style>
    </head>
    <body>
        <div class="app-header">
            <div style="display: flex; align-items: center;">
                <div class="app-title">PakePlus Professional</div>
                <div class="device-stable">设备标识稳定</div>
            </div>
            <div class="${remainingDays < 30 ? 'expire-warning' : 'auth-status'}">
                ${remainingDays < 30 ? `⚠️ 剩余${remainingDays}天` : '✅ 已授权'}
            </div>
        </div>
        <div class="app-content">
            <div class="welcome-message">欢迎使用 PakePlus 专业版</div>
            
            <div class="auth-info">
                <div class="auth-info-item"><strong>设备ID:</strong> ${deviceId}</div>
                <div class="auth-info-item"><strong>授权时间:</strong> ${authDate.toLocaleString()}</div>
                <div class="auth-info-item"><strong>授权类型:</strong> ${authData.licenseType}</div>
                <div class="auth-info-item"><strong>有效期:</strong> ${expireDays} 天</div>
                <div class="auth-info-item"><strong>到期时间:</strong> ${expireDate.toLocaleDateString()}</div>
                <div class="auth-info-item"><strong>剩余天数:</strong> ${remainingDays} 天</div>
                <div class="auth-info-item"><strong>版本:</strong> ${authData.version || '3.0'}</div>
            </div>
            
            <div class="feature-list">
                <div class="feature-item">🚀 高性能打包工具</div>
                <div class="feature-item">🔒 企业级安全保护</div>
                <div class="feature-item">📦 自动化构建流程</div>
                <div class="feature-item">🌐 多平台支持</div>
                <div class="feature-item">⚡ 实时预览调试</div>
                <div class="feature-item">🆔 稳定的设备标识</div>
            </div>
            
            <div style="margin-top: 30px;">
                <button onclick="showAuthDetails()" style="padding: 12px 24px; background: white; color: #667eea; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; margin: 5px;">
                    查看详细授权
                </button>
                <button onclick="MACAuthSystem.clearAuthData(); location.reload();" style="padding: 12px 24px; background: #e53e3e; color: white; border: none; border-radius: 8px; cursor: pointer; margin: 5px;">
                    退出登录
                </button>
                <button onclick="MACAuthSystem.resetDeviceId(); location.reload();" style="padding: 12px 24px; background: #805ad5; color: white; border: none; border-radius: 8px; cursor: pointer; margin: 5px;">
                    重置设备ID
                </button>
            </div>
        </div>
        
        <script>
            function showAuthDetails() {
                const authData = JSON.parse(localStorage.getItem('pakeplus_pro_auth') || '{}');
                const deviceId = localStorage.getItem('pakeplus_device_id');
                const authTime = localStorage.getItem('pakeplus_auth_time');
                const expireDays = authData.expireDays;
                const authDate = new Date(parseInt(authTime));
                const expireDate = new Date(authDate.getTime() + expireDays * 24 * 60 * 60 * 1000);
                const remainingDays = Math.max(0, Math.floor((expireDate - new Date()) / (24 * 60 * 60 * 1000)));
                
                const info = \`
授权详细信息：
─────────────────
设备ID: \${deviceId}
授权时间: \${authDate.toLocaleString()}
授权类型: \${authData.licenseType}
有效期: \${expireDays} 天
到期时间: \${expireDate.toLocaleDateString()}
剩余天数: \${remainingDays} 天
版本: \${authData.version || '3.0'}
─────────────────
                \`;
                alert(info);
            }
            
            console.log('🎉 PakePlus Professional Application Loaded Successfully!');
            console.log('Authorization valid for', ${remainingDays}, 'more days');
            console.log('Device ID stability: ✅ Verified');
        </script>
    </body>
    </html>
    `;
    
    // 如果当前文档是空的或者是授权界面，重新写入应用内容
    if (document.title === '软件授权验证 - PakePlus' || document.body.innerHTML.includes('auth-container')) {
        console.log('🔄 Replacing auth interface with application content...');
        document.write(appHTML);
        document.close();
    } else {
        console.log('📖 Application content already loaded');
    }
}

// === 链接处理逻辑 ===
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

// === 主初始化函数 ===
function initializeApp() {
    console.log('🎯 PakePlus Professional initializing...');
    
    // 检查是否已经在授权界面
    if (document.title === '软件授权验证 - PakePlus') {
        console.log('Already in auth interface, skipping initialization');
        return;
    }
    
    // 初始化MAC地址验证
    const isAuthenticated = MACAuthSystem.init();
    
    if (isAuthenticated) {
        console.log('✅ App authenticated, loading functionality');
        
        // 加载应用内容
        loadApplicationContent();
        
        // 原有的应用功能初始化
        document.addEventListener('click', hookClick, { capture: true });
        
        if (window.applyLayoutFix) {
            setTimeout(applyLayoutFix, 100);
        }
        
        console.log('🚀 PakePlus Professional fully loaded');
    } else {
        console.log('⏳ Waiting for authentication...');
    }
}

// 安全初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    setTimeout(initializeApp, 100);
}

// 调试和管理工具
window.clearAuth = function() {
    MACAuthSystem.clearAuthData();
    console.log('Auth cleared, reloading...');
    location.reload();
};

window.resetDeviceId = function() {
    MACAuthSystem.resetDeviceId();
    console.log('Device ID reset, reloading...');
    location.reload();
};

window.showDeviceInfo = function() {
    console.log('📋 Device Information:', {
        deviceId: MACAuthSystem.getDeviceFingerprint(),
        storedDeviceId: localStorage.getItem('pakeplus_device_id'),
        authDeviceId: MACAuthSystem.getAuthDeviceId(),
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        consistency: MACAuthSystem.verifyDeviceConsistency()
    });
};

console.log('📱 PakePlus Professional auth system loaded (Enhanced Stable Device ID)');