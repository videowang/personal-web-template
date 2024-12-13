# Personal Website Template

一个包含AI对话功能的个人网站模板。

## 功能特点

- 响应式设计
- AI对话功能
- 照片轮播展示
- 暗色/亮色主题切换

## 技术栈

- Frontend: HTML5, CSS3, JavaScript
- Backend: Node.js, Express
- AI: OpenAI API

## 安装使用

1. 克隆仓库
bash
git clone https://github.com/videowang/personal-web-template.git

2. 安装依赖
bash
cd personal-web-template
npm install

3. 配置环境变量
bash
创建 .env 文件并添加：
OPENAI_API_KEY=你的OpenAI_API密钥

4. 启动服务器
bash
npm start

5. 访问网站
打开浏览器访问 `http://localhost:3000`

## 项目结构
| 文件/文件夹 | 描述 |
|---|---|
| AI-CODING/ | 项目根目录 |
| ├── public/ | 公共资源目录 |
| │ ├── pictures/ | 图片资源目录 |
| │ │ ├── slide1.jpg | 第一张幻灯片 |
| │ │ ├── slide2.jpg | 第二张幻灯片 |
| │ │ └── slide3.jpg | 第三张幻灯片 |
| │ ├── index.html | 主页 |
| │ ├── script.js | JavaScript 文件 |
| │ └── styles.css | CSS 文件 |
| ├── server.js | 服务器端 JavaScript 文件 |
| ├── package.json | npm 包管理配置文件 |
| └──.env | 环境变量配置文件 |

## 主要功能

### 1. 个人介绍
- 响应式设计的个人主页
- 照片轮播展示
- 技能标签展示

### 2. AI对话
- 集成OpenAI API
- 实时对话功能
- 支持对话历史记录
- 导出对话记录
- 主题切换功能

## 注意事项

- 需要配置有效的OpenAI API密钥
- 确保Node.js版本 >= 14.0.0
- 所有敏感信息请保存在 .env 文件中
- 图片文件请放在 public/pictures 目录下

## 许可证

MIT License



