<?php
// +----------------------------------------------------------------------
// | ThinkPHP [ WE CAN DO IT JUST THINK ]
// +----------------------------------------------------------------------
// | Copyright (c) 2006-2016 http://thinkphp.cn All rights reserved.
// +----------------------------------------------------------------------
// | Licensed ( http://www.apache.org/licenses/LICENSE-2.0 )
// +----------------------------------------------------------------------
// | Author: 流年 <liu21st@gmail.com>
// +----------------------------------------------------------------------

// 应用公共文件

/**
 * 写基础配置文件
 * @param $data
 */
function writeConfig($data)
{
    $path = APP_ROOT . '/config/group.conf';
    @file_put_contents($path, serialize($data));
    return true;
}

//读配置文件
function readConfig()
{
    $path = APP_ROOT . '/config/group.conf';
    $conf = file_get_contents($path);
    if(empty($conf))
        return [];

    return unserialize($conf);
}

//写聊天配置
function writeCtConfig($data)
{
    $path = APP_ROOT . '/config/chat.conf';
    @file_put_contents($path, serialize($data));
    return true;
}

//读聊天配置文件
function readCtConfig()
{
    $path = APP_ROOT . '/config/chat.conf';
    $conf = file_get_contents($path);
    if(empty($conf))
        return [];

    return unserialize($conf);
}

//对象转数组
function objToArr($res){
    return json_decode(json_encode($res),true);
}

//获取评论
function getComment($blogId)
{
    $list = db('comment')->where('blog_id', $blogId)->select();
    if(empty($list)){

        echo "";
    }else{

        $html = '';
        foreach($list as $key=>$vo){
            $html .= '<a href="javascript:;" class="pull-left"><img alt="image" src="' . $vo['com_avatar'] . '"></a>';
            $html .= '<div class="media-body"><a href="javascript:;" style="color:#337AB7">' . $vo['com_user'];
            $html .= '&nbsp;&nbsp;&nbsp;&nbsp;</a>' . $vo['content'] . '<br/>';
            $html .= '<small class="text-muted">' . date('Y-m-d H:i', $vo['com_time']) . '</small></div>';
        }

        echo $html;
    }

}