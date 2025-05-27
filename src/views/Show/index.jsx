import "./style.less"
import {useEffect, useRef, useState} from "react";
import {apiVideo} from "@/api";
import Aliplayer from "aliyun-aliplayer";

export default function (){
    const [player,setPlayer] = useState(null);
    async function init() {
        const resp = await apiVideo.video()
        if (resp.success) {
            if (player) {
                player.dispose();
            }
            const playerInstance = new Aliplayer({
                id: 'J_prismPlayer',
                height: "30%",
                vid : resp.data.id,// 必选参数，可以通过点播控制台（路径：媒资库>音/视频）查询。示例：1e067a2831b641db90d570b6480f****。
                playauth : resp.data.auth,// 必选参数，参数值可通过调用GetVideoPlayAuth接口获取。
                encryptType: 1, // 必选参数，当播放私有加密流时需要设置本参数值为1。其它情况无需设置。
                license: {
                    domain: "netshort.online",
                    key: "OPUqr2Q0b4B5gDa4796f243470179497ea766f3363ce753d6"
                },
                playConfig:{EncryptType:'AliyunVoDEncryption'}, // 当您输出的M3U8流中，含有其他非私有加密流时，需要指定此参数。
                // authTimeout: 7200, // 可选参数，播放地址的有效时长，单位：秒。该时长会覆盖在视频点播控制台设置的URL鉴权的有效时长。如果不传，则取默认值7200。如需设置此参数，请确保该时间大于视频的实际时长，防止播放地址在播放完成前过期。
            },function(player){
                console.log('The player is created.')
            });
            setPlayer(playerInstance)
        }
    }

    useEffect(() => {
        init()
    }, []);
    return <>
        <div className='show'>
            <div className='s-content'>
                <div id='J_prismPlayer'></div>
            </div>
        </div>
    </>
}