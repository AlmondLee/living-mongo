# LivingMongo
LivingMongo是一个mongodb数据库的GUI操作系统，支持对数据`字段的修改`、`数据搜索`、`集合的分类`、`索引管理`、`空间统计`、`慢查询`等

demo地址 : [http://living-mongo.kupposhadow.com](http://living-mongo.kupposhadow.com "http://living-mongo.kupposhadow.com")

# 数据管理
<img src="screenshots/1.png">

# 图片预览
<img src="screenshots/2.png">

# 数据搜索
<img src="screenshots/3.png">

# 空间统计
<img src="screenshots/4.png">

# 慢查询统计
<img src="screenshots/5.png">


## Quickstart
```
docker run -dt --rm -p 8110:80 swimmingwhale/living-mongo:v1.0
```
容器内包含了nginx,php,mongodb等所有运行所需的软件.
等待容器启动后,访问http://localhost:8110, or http://host-ip:8110

构建镜像的Dockerfile在[这里](https://github.com/swimmingwhale/living-mongo-Dockerfile)

## window环境
1. [下载](https://www.apachefriends.org/zh_cn/index.html)安装xampp
2. [下载](https://www.mongodb.com/download-center#community)安装mongodb
3. [下载](https://pecl.php.net/package/mongodb)php的mongodb扩展php_mongodb.dll放到xampp/php/ext目录.修改xampp/php/php.ini，添加extension=php_mongodb.dll
4. 下载项目到xampp的htdocs目录
5. 启动apache和mongodb,访问http://localhost

## linux环境
安装nginx+php+mongodb,及php的mongodb扩展.然后将项目clone到web根目录即可.读者可自行搜索web环境的搭建方法.环境需求如下
```php
PHP >= 7.0
MongoDB >= 3.4.2
```

## 配置
默认系统无用户名和密码,MongoDB默认连接127.0.0.1,如须修改可以更改.env文件下的相关配置
```
MONGODB_HOST=mongodb://127.0.0.1:27017

USERNAME=
PASSWORD=
```
MONGODB_HOST为数据库连接地址

USERNAME和PASSWORD为登录的用户名和密码
