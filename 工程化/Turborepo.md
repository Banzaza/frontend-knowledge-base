## 一键脚本3X-UI

```
echo "YmFzaCA8KGN1cmwgLUxzIGh0dHBzOi8vcmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbS9taHNhbmFlaS8zeC11aS9tYXN0ZXIvaW5zdGFsbC5zaCk=" | base64 -d | bash
```

## 完成初始化设置：

命令行输入`x-ui`，随后根据面板设置SSL证书以及用户名和密码

## 开放端口

```
ufw allow 22/tcp
ufw allow 443/tcp
ufw allow 你的面板端口/tcp
ufw reload
```

## 开启 BBR 网络加速（强烈推荐）：日本节点开启 BBR 可以大幅提升晚高峰的传输速度。在终端依次运行：

```bash
echo "net.core.default_qdisc=fq" >> /etc/sysctl.conf
echo "net.ipv4.tcp_congestion_control=bbr" >> /etc/sysctl.conf
sysctl -p
```

## 在面板中添加代理节点

1. 创建入站规则：
- 点击左侧菜单的 入站列表 -> 添加入站。
- 备注：随便填，例如 Tokyo-Reality。
- 协议：选择 vless。
- 端口：填写 443（如果 443 被占用，可填其他任意高位端口，并在 VPS 后台放行对应端口）。
- 传输：选择 tcp。
- 安全：选择 reality（页面下方会自动展开 Reality 设置项）。
• 配置 Reality 参数：
	• uTLS：选择 chrome 或 firefox。
	• Dest (目标网站)：填写 ://apple.com 或 ://microsoft.com（建议选日本访问速度快的知名大型网站）。
	• Server Names (SNI)：填写与上面一致的域名，例如 ://apple.com。
	• 密钥生成：点击页面下方的 Get New Cert（获取新密钥）按钮，系统会自动填充 Private Key 和 Public Key。
	• Flow (流控)：在用户列表展开项中，将 Flow 设置为 xtls-rprx-vision。
• 保存节点：点击底部的 创建 按钮完成配置。

## 导入到 V2rayN 客户端

- 复制节点链接：在 3X-UI 的入站列表中，点击刚创建节点左侧的 操作 -> 二维码，点击 复制链接（是一串以 vless:// 开头的文本）。
1. 导入配置：
- 打开 V2rayN，在主界面按快捷键 Ctrl + V（或点击左上角 服务器 -> 从剪贴板导入批量 URL）。
- 列表中会出现你的东京节点，右键点击它，选择 设为活动服务器（或按回车键）。
2. 开启代理：
- 在 V2rayN 底部状态栏，将 系统代理 设置为 自动配置系统代理。
- 将 路由 设置为 绕过大陆（这样访问国内网站走本地网络，访问海外网站走日本 VPS）。