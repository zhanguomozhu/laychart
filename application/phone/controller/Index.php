<?php

namespace app\phone\controller;

use think\Controller;

class Index extends Base
{
    public function index()
    {
        //聊天用户
        $userInfo = [
            'id' => cookie('phone_user_id'),
            'username' => cookie('phone_user_name'),
            'avatar' => cookie('phone_user_avatar'),
            'sign' => cookie('phone_user_sign')
        ];

        // 查询自己的信息
        $uid = cookie('phone_user_id');
        $mine = db('chatuser')->where('id', $uid)->find();

        $online = 0;
        $group = [];  //记录分组信息
        $userGroup = config('user_group');
        $list = [];  //群组成员信息
        $i = 0;
        $j = 0;
        //查询该用户的好友
        $friends = db('friends')->alias('f')->field('c.user_name,c.id,c.avatar,c.sign,c.status,f.group_id')
            ->join('v3_chatuser c', 'c.id = f.friend_id')
            ->where('f.user_id', $uid)->select();

        foreach( $userGroup as $key=>$vo ){
            $group[$i] = [
                'groupname' => $vo,
                'id' => $key,
                'online' => 0,
                'list' => []
            ];
            $i++;
        }
        unset( $userGroup );

        foreach( $group as $key=>$vo ){

            foreach( $friends as $k=>$v ) {

                if ($vo['id'] == $v['group_id']) {

                    $list[$j]['username'] = $v['user_name'];
                    $list[$j]['id'] = $v['id'];
                    $list[$j]['avatar'] = $v['avatar'];
                    $list[$j]['sign'] = $v['sign'];
                    $list[$j]['status'] = empty($v['status']) ? 'offline' : 'online';

                    if (1 == $v['status']) {
                        $online++;
                    }

                    $group[$key]['online'] = $online;
                    $group[$key]['list'] = $list;

                    $j++;
                }
            }
            $j = 0;
            $online = 0;
            unset($list);
        }
        //print_r($group);die;
        unset( $friends );

        $return = [
            'mine' => [
                    'username' => $mine['user_name'],
                    'id' => $mine['id'],
                    'status' => 'online',
                    'sign' => $mine['sign'],
                    'avatar' => $mine['avatar']
            ],
            'friend' => $group

        ];

        // echo json_encode($return);die;

        $this->assign([
            'userlist' => json_encode($return),
            'uinfo' => $userInfo
        ]);

        return $this->fetch();
    }
}