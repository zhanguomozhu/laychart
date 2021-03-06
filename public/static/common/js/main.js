//建立WebSocket通讯
var socket;

layui.use(['layim', 'laytpl'], function(layim){
    var laytpl = layui.laytpl;

    //基础配置
    layim.config({

        //初始化接口
        init: {
            url: user_list_url
            ,data: {}
        }
        //查看群员接口
        ,members: {
            url: member_list_url
            ,data: {}
        }

        ,uploadImage: {
            url: upload_img_url
        }
        ,uploadFile: {
            url: upload_file_url
        }

        //扩展工具栏
        ,tool: [
            {
                alias: 'voice'
                ,title: '语音'
                ,icon: '&#xe62c;'
            },
            {
                alias: 'map'
                ,title: '地理位置'
                ,icon: '&#xe634;'
            },
        ]
        ,initSkin: '3.jpg' //1-5 设置初始背景
        ,msgbox: msg_box_url//消息盒子页面地址，若不开启，剔除该项即可
        ,find: find_url //发现页面地址，若不开启，剔除该项即可
        ,chatLog: chatlog_url //聊天记录页面地址，若不开启，剔除该项即可

    });

    socket = new WebSocket('ws://127.0.0.1:8282');
    //连接成功时触发
    socket.onopen = function(){
        // 登录
        var login_data = '{"type":"init","id":"' + uid + '", "username":"' + uname + '", "avatar":"' + avatar + '", "sign":"' + sign + '"}';
        socket.send( login_data );
        console.log("websocket握手成功!");
    };

    //监听收到的消息
    socket.onmessage = function(res){
        console.log(res.data);
        var data = eval("("+res.data+")");
        switch(data['message_type']){
            // 服务端ping客户端
            case 'ping':
                //console.log(data);
                socket.send('{"type":"ping"}');
                break;
            // 在线
            case 'online':
                layim.setFriendStatus(data.id, 'online');
                break;
            // 下线
            case 'offline':
                layim.setFriendStatus(data.id, 'offline');
                break;
            // 检测聊天数据
            case 'chatMessage':
                //console.log(data.data);
                layim.getMessage(data.data);
                break;
            // 离线消息推送
            case 'logMessage':
                setTimeout(function(){layim.getMessage(data.data)}, 1000);
                break;
            // 用户退出 更新用户列表
            case 'logout':
                layim.setFriendStatus(data.id, 'offline');
                break;
            // 添加好友
            case 'addFriend':
                //console.log(data.data);
                layim.addList(data.data);
                break;
            //加入黑名单
            case 'black':
                //console.log(data.data);
                layim.removeList({
                    type: 'friend'
                    , id: data.data.id //好友或者群组ID
                });
                break;
            //删除好友
            case 'delFriend':
                //console.log(data.data);
                layim.removeList({
                    type: 'friend'
                    , id: data.data.id //好友或者群组ID
                });
                break;
            // 添加 分组信息
            case 'addGroup':
                //console.log(data.data);
                layim.addList(data.data);
                break;
            // 申请加入群组
            case 'applyGroup':
                //console.log(data.data);
                //询问框
                var index = layer.confirm(
                    data.data.joinname + ' 申请加入 ' + data.data.groupname + "<br/> 附加信息： " + data.data.remark , {
                    btn: ['同意', '拒绝'], //按钮
                    title: '加群申请',
                    closeBtn: 0,
                    icon: 3
                }, function(){
                        $.post(join_group_url,
                            {
                                'user_id': data.data.joinid,
                                'user_name': data.data.joinname,
                                'user_avatar': data.data.joinavatar,
                                'user_sign': data.data.joinsign,
                                'group_id': data.data.groupid
                            },
                            function(res){
                                if(1 == res.code){

                                    var join_data = '{"type":"joinGroup", "join_id":"' + data.data.joinid + '"' +
                                        ', "group_id": "' + data.data.groupid + '", "group_avatar": "' + data.data.groupavatar + '"' +
                                        ', "group_name": "' + data.data.groupname + '"}';
                                    socket.send(join_data);
                                }else{
                                    layer.msg(res.msg, {time:2000});
                                }
                        }, 'json');
                        layer.close(index);
                }, function(){

                });
                break;
            // 删除面板的群组
            case 'delGroup':
                //console.log(data.data);
                layim.removeList({
                    type: 'group'
                    ,id: data.data.id //群组ID
                });
                break;
        }
    };

    //外部自定义我的事件
    my_events = {
        //进入好友的空间
        enterZone: function (othis, e) {
            var friend_id = othis.parent().attr('data-id');
            layer.alert('<a href="/index/Userzone/uZone/fid/' + friend_id + '"  target="_blank">点击，进入他的空间</a>', {
                title: false
                , icon: 6
                , btn: ''
            });
        }

        //将用户加入黑名单
        , joinBlack: function(othis, e){
            var friend_id = othis.parent().attr('data-id');
            //询问框
            layer.confirm('确定要将他加入黑名单？', {
                btn: ['是的', '算了'],
                title: '友情提示',
                icon: 3,
                closeBtn: 0
            }, function(){
                $.getJSON("/index/Tools/joinBlack/fid/" + friend_id, function(res){
                    if(1 == res.code){
                        layer.msg(res.msg, {time:1500});
                        layim.removeList({
                            type: 'friend'
                            ,id: res.data.to_id
                        });

                        //通知被加入黑名单的用户，删除我
                        var black_data = '{"type":"black","to_id":"' + res.data.to_id + '", "del_id":"' + res.data.del_id + '"}';
                        socket.send(black_data);
                    }else{
                        layer.msg(res.msg, {time:1500});
                    }
                });
            }, function(){

            });
        }

        //改变用户的群组
        , changeGroup: function(othis, e){
            //改变群组模板
            var elemAddTpl = ['<div class="layim-add-box">'
                , '<div class="layim-add-img"><img class="layui-circle" src="{{ d.data.avatar }}"><p>' +
                '{{ d.data.name||"" }}</p></div>'
                , '<div class="layim-add-remark">'
                , '{{# if(d.data.type === "friend" && d.type === "setGroup"){ }}'
                , '<p>选择分组</p>'
                , '{{# } if(d.data.type === "friend"){ }}'
                , '<select class="layui-select" id="LAY_layimGroup">'
                , '{{# layui.each(d.data.group, function(index, item){ }}'
                , '<option value="{{ item.id }}">{{ item.groupname }}</option>'
                , '{{# }); }}'
                , '</select>'
                , '{{# } }}'
                , '{{# if(d.data.type === "group"){ }}'
                , '<p>请输入验证信息</p>'
                , '{{# } if(d.type !== "setGroup"){ }}'
                , '<textarea id="LAY_layimRemark" placeholder="验证信息" class="layui-textarea"></textarea>'
                , '{{# } }}'
                , '</div>'
                , '</div>'].join('');

            var friend_id = othis.parent().attr('data-id');
            $.getJSON('/index/Tools/getNowUser/fid/' + friend_id, function(res){
                if(1 == res.code){
                    var index = layer.open({
                        type: 1,
                        skin: 'layui-layer-rim', //加上边框
                        area: ['430px', '260px'], //宽高
                        btn:   ['确认', '取消'],
                        title: '移动分组',
                        content: laytpl(elemAddTpl).render({
                            data: {
                                name: res.data.user_name
                                , avatar: res.data.avatar
                                , group: parent.layui.layim.cache().friend
                                , type: 'friend'
                            }
                            , type: 'setGroup'
                        })
                        , yes: function (index, layero) {
                            var groupElem = layero.find('#LAY_layimGroup');
                            var group_id = groupElem.val(); //群组id
                            $.post('/index/Tools/changeGroup', {'group_id' : group_id, 'user_id' : res.data.id},
                                function(data) {
                                    if (1 == data.code) {
                                        layer.msg(data.msg, {time: 1500});
                                        //先从旧组移除，然后加入新组
                                        layim.removeList({
                                            type: 'friend'
                                            ,id: res.data.id
                                        });
                                        //加入新组
                                        layim.addList({
                                            type: 'friend'
                                            ,avatar: res.data.avatar
                                            ,username: res.data.user_name
                                            ,groupid: group_id
                                            ,id: res.data.id
                                            ,sign: res.data.sign
                                        });
                                        layer.close(index);
                                    } else {
                                        layer.msg(data.msg, {time: 2000});
                                    }
                            }, 'json');
                        }
                    });
                }else{
                    layer.msg(res.msg, {time: 2000});
                }
            });
        }

        //删除好友
        , removeFriend: function(othis, e){
            var friend_id = othis.parent().attr('data-id');
            //询问框
            layer.confirm('确定删除该好友？', {
                btn: ['确定', '取消'],
                title: '友情提示',
                closeBtn: 0,
                icon: 3
            }, function(){
                $.post('/index/Tools/removeFriend', {'user_id' : friend_id}, function(res){
                    if(1 == res.code){
                        layer.msg(res.msg, {time: 1500});
                        layim.removeList({
                            type: 'friend'
                            , id: res.data.to_id
                        });
                        //通知被删除的用户，删除我
                        var black_data = '{"type":"delFriend","to_id":"' + res.data.to_id + '", "del_id":"' + res.data.del_id + '"}';
                        socket.send(black_data);
                    }else{
                        layer.msg(res.msg, {time: 1500});
                    }
                }, 'json');
            }, function(){

            });
        }

        //举报好友
        , reportFriend: function(othis, e){
            var friend_id = othis.parent().attr('data-id');

            layer.open({
                type: 2,
                title: '举报好友',
                shadeClose: true,
                skin: 'layui-layer-molv', //加上边框
                shade: 0.3,
                area: ['400px', '400px'],
                content: '/index/Tools/reportFriend/user_id/' + friend_id
            });
        }

        //退出群组
        , leaveOut: function(othis, e){
            var group_id = othis.parent().attr('data-id');
            var index = layer.confirm('确定退出该群组？', {
                btn: ['确定', '取消'],
                title: '友情提示',
                closeBtn: 0,
                icon: 3
            }, function(){
                $.post('/index/Tools/leaveGroup', {'group_id' : group_id}, function(res){
                    if(1 == res.code){
                        layer.msg(res.msg, {time: 1500});
                        layim.removeList({
                            type: 'group'
                            , id: res.data.group_id
                        });

                        // 退出讨论组
                        var leave_data = '{"type": "leaveGroup", "leave_id":"' + res.data.uid + '", "group_id":"' + res.data.group_id + '"}';
                        socket.send(leave_data);
                    }else{
                        layer.msg(res.msg, {time: 1500});
                    }
                    layer.close(index);
                }, 'json');
            }, function(){

            });
        }
    }

    //监听签名修改
    layim.on('sign', function(value){
        $.post(change_sign_url, {'sign' : value}, function(res){
            if(1 == res.code){
                layer.msg(res.msg, {time:1500});
            }else{
                layer.msg(res.msg, {time:1500});
            }
        }, 'json');
    });

    //监听自定义工具栏点击
    layim.on('tool(map)', function(insert){
        layer.msg('暂无', {time:1000});
    });

    //监听自定义工具栏点击录音
    layim.on('tool(voice)', function(insert, send){

        layui.use(['layer'], function(){
            var layer = layui.layer;

            var box = layer.open({
                type: 1,
                title: '发送语音',
                maxmin: false, //开启最大化最小化按钮
                skin: 'layui-layer-molv',
                anim: 3,
                area: ['200px', '250px'],
                content: $("#audio_box"),
                cancel: function(index){
                    $("#tips").text('');
                    $("#a_pic").attr('src', '/static/common/images/audio.png');
                    layer.close(index);
                    return false;
                }
            });

            //点击开始录音
            $("#say").bind('click', function(){
                $("#tips").text('说话中......');
                $("#a_pic").attr('src', '/static/common/images/audio.gif');
                $("#over—say").removeClass('layui-btn-disabled');
                $(this).addClass('layui-btn-disabled');
            });
            var isSend = false;
            //结束录音
            $("#over—say").bind('click', function(){
                if(!isSend){
                    $("#tips").text('');
                    $("#a_pic").attr('src', '/static/common/images/audio.png');
                    $("#say").removeClass('layui-btn-disabled');
                    $(this).addClass('layui-btn-disabled');
                    layer.close(box);

                    var index = layer.load(1, {
                        shade: [0.1,'#fff'] //0.1透明度的白色背景
                    });
                    setTimeout(function(){
                        var audioSrc = $("#audio_src").val();
                        if('' == audioSrc){
                            layer.msg('您没有发送语音', {time:1000});
                        }else{
                            insert('audio[' + audioSrc + ']');
                            send(); //自动发送
                        }
                        layer.close(index);
                    }, 1500);
                    isSend = true;
                }
            });
        });

    });

    //layim建立就绪
    layim.on('ready', function(res){
        //点击头像操作
        $(".layui-layim-user").click(function(){
            layui.use(['layer'], function(){
                var layer = layui.layer;
                layer.open({
                    type: 2,
                    title: '修改个人资料',
                    maxmin: false, //开启最大化最小化按钮
                    area: ['800px', '600px'],
                    content: chat_user_url
                });
            });
        });
        //发送消息
        layim.on('sendMessage', function(res){
            //console.log(res);
            // if(res.to.type === 'friend'){
            //     layim.setChatStatus('<span style="color:#FF5722;">对方正在输入。。。</span>');
            // }
            // 发送消息
            var mine = JSON.stringify(res.mine);
            var to = JSON.stringify(res.to);
            var login_data = '{"type":"chatMessage","data":{"mine":'+mine+', "to":'+to+'}}';
            socket.send( login_data );
        });

        //在线状态切换
        layim.on('online', function(status){
            var change_data = '{"type":"online", "status":"' + status + '", "uid":"' + uid + '"}';
            socket.send(change_data);
        });
    });

    //获取未读的消息 120s读取一次
    setInterval(function(){
        $.getJSON(get_noread_url, function(res){
            if(res.data > 0){
                layim.msgbox(res.data);
            }
        });
    }, parseInt(10) * 1000);
});
