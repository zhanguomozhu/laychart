<?php

namespace app\index\controller;

class Upload extends Base
{

    //上传图片
    public function uploadImg()
    {

        $dd = array(
            'img_size'=>5,
            'img_ext'=>'jpg|jpeg|png|gif',
            'file_size'=>200,
            'file_ext'=>'xlsx|rar|txt|pdf|xls|tar|zip|mp4|mp3|doc|avi|bak|sql|jpg|jpeg|png|gif',
        );
        writeCtConfig($dd);
        $config = readCtConfig(); //读取系统配置的上传文件配置
        $file = request()->file('file');

        $fileInfo = $file->getInfo();
        if($fileInfo['size'] > 1024*1024*$config['img_size']){
            // 上传失败获取错误信息
            return json( ['code' => -2, 'data' => '', 'msg' => '文件超过' . $config['img_size'] . 'M'] );
        }

        //检测图片格式
        $ext = explode('.', $fileInfo['name']);
        $ext = array_pop($ext);

        $extArr = explode('|', $config['img_ext']);
        if(!in_array($ext, $extArr)){
            return json(['code' => -3, 'data' => '', 'msg' => '只能上传' . $config['img_ext'] . '的文件']);
        }

        // 移动到框架应用根目录/public/uploads/ 目录下
        $info = $file->move(ROOT_PATH . 'public' . DS . 'uploads');
        if($info){
            $src =  '/uploads' . '/' . date('Ymd') . '/' . $info->getFilename();
            return json(['code' => 0, 'data' => ['src' => $src ], 'msg' => '']);
        }else{
            // 上传失败获取错误信息
            return json(['code' => -1, 'data' => '', 'msg' => $file->getError()]);
        }
    }

    //上传文件
    public function uploadFile()
    {
        $config = readCtConfig(); //读取系统配置的上传文件配置
        $file = request()->file('file');

        $fileInfo = $file->getInfo();
        if($fileInfo['size'] > 1024*1024*$config['file_size']){
            // 上传失败获取错误信息
            return json( ['code' => -2, 'data' => '', 'msg' => '文件超过' . $config['file_size'] . 'M'] );
        }

        //检测文件格式
        $ext = explode('.', $fileInfo['name']);
        $ext = array_pop($ext);

        $extArr = explode('|', $config['file_ext']);
        if(!in_array($ext, $extArr)){
            return json(['code' => -3, 'data' => '', 'msg' => '只能上传' . $config['file_ext'] . '的文件']);
        }

        // 移动到框架应用根目录/public/uploads/ 目录下
        $info = $file->move(ROOT_PATH . 'public' . DS . 'uploads');
        if($info){
            $src =  '/uploads' . '/' . date('Ymd') . '/' . $info->getFilename();
            return json(['code' => 0, 'data' => ['src' => $src ], 'msg' => '']);
        }else{
            // 上传失败获取错误信息
            return json(['code' => -1, 'data' => '', 'msg' => $file->getError()]);
        }
    }
}