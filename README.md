# TuerApp

使用Tabris.js快速搭建兔耳日记客户端，已经可以完美build出iOS和android两个版本的APP DEMO。

### 预览 

<img width="200"  src="https://gitee.com/terj/tuerAPP/raw/master/imgs/login.jpeg">
<img width="200"  src="https://gitee.com/terj/tuerAPP/raw/master/imgs/list.jpeg">
<img width="200"  src="https://gitee.com/terj/tuerAPP/raw/master/imgs/detail.jpeg">
<img width="200"  src="https://gitee.com/terj/tuerAPP/raw/master/imgs/write.jpeg">

### 介绍

Tabris.js 官网： https://tabrisjs.com

本APP全部使用javascript进行开发编写，安装调试无需任何SDK依赖，但是需要在手机上安装对应的tabris developer app才可以运行：

android地址：https://play.google.com/store/apps/details?id=com.eclipsesource.tabrisjs2

iOS地址：https://itunes.apple.com/us/app/tabris.js-2/id1166468326?mt=8

安装完毕后，本地项目进行依赖安装：

1，首先安装`npm install -g tabris-cli`.

2，然后安装项目依赖，打开工程根目录，执行 `npm install`.

3，然后执行启动命令`npm run start`

4，在developer app中输入本地局域网地址，进行调试开发.

修改config文件里面的debug选项，可以选择连接本地的API项目进行调试,修改`config.js`中debug配置，连接本地API URL，如192.168.x.x。

本地开发依赖mongodb，需要创建本地数据库才可以测试，详情请见：https://gitee.com/terj/tuerAPI 项目启动方式。

### 更多

更多文档补充中。
