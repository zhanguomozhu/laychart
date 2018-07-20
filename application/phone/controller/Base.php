<?php

namespace app\phone\controller;

use think\Controller;

class Base extends Controller
{
    public function _initialize()
    {
        if(empty(cookie('phone_user_name'))){

            $this->redirect(url('login/index'));
        }
    }
}