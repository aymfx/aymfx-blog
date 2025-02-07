## git 的常用命令

### 基础配置

```bash
# 配置用户名和邮箱
git config --global user.name "你的名字"
git config --global user.email "你的邮箱"
```

### 仓库操作

```bash
# 初始化仓库
git init

# 克隆远程仓库
git clone <仓库地址>

# 添加远程仓库
git remote add origin <仓库地址>
```

### 日常操作

```bash
# 查看文件状态
git status

# 添加文件到暂存区
git add . # 添加所有文件
git add <文件名> # 添加指定文件

# 提交更改
git commit -m "提交说明"

# 拉取远程代码
git pull origin <分支名>

# 推送到远程
git push origin <分支名>
```

### 分支操作

```bash
# 查看所有分支
git branch

# 创建新分支
git branch <分支名>

# 切换分支
git checkout <分支名>
# 或使用新命令
git switch <分支名>

# 创建并切换分支
git checkout -b <分支名>

# 合并分支
git merge <要合并的分支名>

# 删除分支
git branch -d <分支名>
```

### 撤销操作

```bash
# 撤销工作区的修改
git checkout -- <文件名>
# 或使用新命令
git restore <文件名>

# 撤销暂存区的修改
git reset HEAD <文件名>
# 或使用新命令
git restore --staged <文件名>

# 回退到指定版本
git reset --hard <commit ID>
```

### 查看日志

```bash
# 查看提交历史
git log

# 查看精简日志
git log --oneline

# 查看分支合并图
git log --graph
```

### 标签管理

```bash
# 创建标签
git tag <标签名>

# 查看所有标签
git tag

# 给指定提交打标签
git tag <标签名> <commit ID>

# 删除标签
git tag -d <标签名>
```

### 常用技巧

```bash
# 暂存当前工作
git stash

# 恢复暂存的工作
git stash pop

# 查看远程仓库信息
git remote -v

# 清理无用文件和文件夹
git clean -fd
```
