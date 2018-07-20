<?php

namespace app\phone\controller;

use think\Controller;

class Login extends Controller
{
    //展示登录页面
    public function index()
    {
        return $this->fetch();
    }

    //处理登录
    public function doLogin()
    {
        if(request()->isAjax()){

            $userName = input('post.user_name');
            if(empty($userName)){
                return json(['code' => -3, 'data' => '', 'msg' => '用户名不能为空']);
            }

            $pwd = input('post.pwd');
            if(empty($pwd)){
                return json(['code' => -4, 'data' => '', 'msg' => '密码不能为空']);
            }

            $user = db('chatuser')->field('id,user_name,pwd,sign,avatar')
                ->where('user_name = "' . $userName . '"')->find();
            if(empty($user)){
                return json(['code' => -1, 'data' => '', 'msg' => '用户不存在']);
            }

            if( md5($pwd) != $user['pwd'] ){
                return json(['code' => -2, 'data' => '', 'msg' => '密码错误']);
            }

            //设置用户登录
            db('chatuser')->where('id', $user['id'])->setField('status', 1);

            //设置session标识状态
            cookie('phone_user_name', $user['user_name']);
            cookie('phone_user_id', $user['id']);
            cookie('phone_user_sign', $user['sign']);
            cookie('phone_user_avatar', $user['avatar']);

            return json(['code' => 1, 'data' => url('index/index'), 'msg' => '登录成功']);
        }

        $this->error('非法访问');
    }
}