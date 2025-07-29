# **Docker基础**

> Docker 已成为现代开发和运维的基石，通过容器化技术实现 **“一次构建，随处运行”**。
---

#### **一、Docker 核心概念**
1. **镜像（Image）**  
   - 只读模板，包含运行环境和应用程序（如 Ubuntu + Nginx）。
   - 类比：软件安装包的 `.iso` 文件。
2. **容器（Container）**  
   - 镜像的**运行实例**，拥有独立进程和文件系统。
   - 类比：一台轻量级虚拟机。
3. **仓库（Registry）**  
   - 存储镜像的平台（如 Docker Hub、阿里云镜像仓库）。
---

#### **二、必须掌握的 12 个 Docker 命令**
##### ▶ 镜像管理
```bash
# 拉取镜像（默认从 Docker Hub） nginx 拉去的镜像 latest是版本号
docker pull nginx:latest

# 查看本地镜像
docker images

# 删除镜像  image_id 是镜像的唯一标识
docker rmi <image_id>
```

##### ▶ 容器生命周期
```bash
# 启动新容器（-d: 后台运行，-p: 端口映射，--name 容器名称）
docker run -d -p 80:80 --name my-nginx nginx

# 停止/启动容器
docker stop my-nginx
docker start my-nginx

# 删除容器（需先停止）
docker rm my-nginx
```

##### ▶ 容器运维与调试
```bash
# 查看运行中的容器
docker ps
# 查看所有容器（包含已停止）
docker ps -a

# 查看容器日志
docker logs my-nginx

# 进入容器内部终端（调试必备） -it 表示交互模式
docker exec -it my-nginx /bin/bash

# 拷贝文件（宿主机 ↔ 容器）
docker cp file.txt my-nginx:/path/
```

##### ▶ 构建自定义镜像 构建一个 Node 服务镜像
1. 创建 `Dockerfile`:
```dockerfile
From node:14-alpine

# 设置工作目录
WORKDIR /app

# 复制项目文件
COPY . .

# 安装依赖
RUN npm install

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["npm", "start"]
```
2. 构建镜像：（-t 镜像名称 .表示当前目录）
```bash
docker build -t my-node-app .
```

---

#### **三、进阶关键技能**
1. **持久化数据**  
   使用卷（Volume）避免容器删除后数据丢失：
   ```bash
   docker run -v /宿主机路径:/容器路径 nginx
   ```
2. **容器网络**  
   自定义网络实现容器间通信：
   ```bash
   docker network create my-net
   docker run --network=my-net --name app1 my-app
   ```
3. **Docker Compose**  
   通过 YAML 管理多容器应用：
   ```yaml
   # docker-compose.yml
   services:
     web:
       image: nginx
       ports: ["80:80"]
     db:
       image: mysql
       environment:
         MYSQL_ROOT_PASSWORD: secret
   ```
   启动服务栈：`docker compose up -d`

---

#### **四、避坑指南**
1. **权限问题**  
   在 Linux 下避免 `Permission denied`：
   ```bash
   # 添加当前用户到 docker 用户组
   sudo usermod -aG docker $USER
   ```
2. **清理无用资源**  
   定期释放磁盘空间：
   ```bash
   docker system prune -a  # 删除所有停止的容器和未使用的镜像
   ```
3. **安全实践**  
   - 不使用 `docker run --privileged`（除非必要）
   - 定期更新镜像修复漏洞

---

#### **五、学习路径建议**
1. 阶段①：掌握单容器操作（run/exec/logs）  
2. 阶段②：学习 Dockerfile 构建镜像  
3. 阶段③：多容器编排（Docker Compose）  
4. 阶段④：集群管理（Swarm/Kubernetes）

> 💡 **快速实践建议**：尝试将你的本地 Python/Node.js 项目容器化，并通过 `docker run` 部署。

---

#### **结语**  
Docker 的学习重在动手实践，掌握基础命令后，可进一步探索：
- 容器网络模型（Bridge/Host/Overlay）  
- 镜像分层原理（`docker history` 查看层结构）  
- 生产环境最佳实践（资源限制、健康检查）

立即体验：运行 `docker run hello-world`，开启你的容器化之旅！

---

**延伸工具**：
- 可视化管理：Portainer
- 镜像扫描：Trivy（安全审计）
- 开发调试：Docker Desktop（Win/Mac）

> 本文示例均可在 Docker 20.10+ 环境中直接运行，建议搭配 Linux 或 WSL2 使用。