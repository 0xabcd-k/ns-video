import "./style.less"
import {useEffect, useRef, useState} from "react";
import {apiVideo} from "@/api";
import Aliplayer from "aliyun-aliplayer";
import {useMediaQuery} from "react-responsive";
import {useHashQueryParams} from "@/utils";
import {useNavigate} from "react-router-dom";
import {Toast} from "react-vant";

export default function (){
    const params = useHashQueryParams()
    const [player,setPlayer] = useState(null);
    const isMobile = useMediaQuery({ maxWidth: 767 });
    const [name,setName] = useState("");
    const navigate = useNavigate();
    async function init() {
        if(isMobile){
            const resp = await apiVideo.video({
                drama_idx: params.drama,
                video_no: params.no,
            })
            if (resp.success) {
                if (player) {
                    player.dispose();
                }
                setName(resp.data.name);
                const playerInstance = new Aliplayer({
                    id: 'J_prismPlayer',
                    height: "100%",
                    width: "100%",
                    vid : resp.data.id,// 必选参数，可以通过点播控制台（路径：媒资库>音/视频）查询。示例：1e067a2831b641db90d570b6480f****。
                    playauth : resp.data.auth,// 必选参数，参数值可通过调用GetVideoPlayAuth接口获取。
                    encryptType: 1, // 必选参数，当播放私有加密流时需要设置本参数值为1。其它情况无需设置。
                    license: {
                        domain: "netshort.online",
                        key: "OPUqr2Q0b4B5gDa4796f243470179497ea766f3363ce753d6"
                    },
                    autoplay: true,
                    playsinline: true,
                    useH5Prism:true,
                    useFlashPrism: false,
                    isLive: false,
                    playConfig:{EncryptType:'AliyunVoDEncryption'}, // 当您输出的M3U8流中，含有其他非私有加密流时，需要指定此参数。
                },function(player){
                    console.log('The player is created.')
                });
                setPlayer(playerInstance)
            }else{
                if(resp.err_code === 31002){
                    Toast.info("Drama Finish...")
                }
            }
        }
    }

    useEffect(() => {
        init()
    }, []);
    return <>
        {isMobile ? <>
            <div className='show'>
                <div className='s-box'>
                    <div id='J_prismPlayer'></div>
                </div>
                <div className='s-name' onClick={()=>{
                    navigate(`/?drama=${params.drama}`);
                }}>{name}</div>
                <div className='s-back-btn' onClick={()=>{
                    navigate(`/?drama=${params.drama}`);
                }}>
                    <span>Back</span>
                    <svg t="1748941943578" viewBox="0 0 1024 1024" version="1.1"
                         xmlns="http://www.w3.org/2000/svg" p-id="1070" width="200" height="200">
                        <path
                            d="M143 462h800c27.6 0 50 22.4 50 50s-22.4 50-50 50H143c-27.6 0-50-22.4-50-50s22.4-50 50-50z"
                            p-id="1071" fill="#dbdbdb"></path>
                        <path
                            d="M116.4 483.3l212.1 212.1c19.5 19.5 19.5 51.2 0 70.7s-51.2 19.5-70.7 0L45.6 554c-19.5-19.5-19.5-51.2 0-70.7 19.6-19.6 51.2-19.6 70.8 0z"
                            p-id="1072" fill="#dbdbdb"></path>
                        <path
                            d="M328.5 328.6L116.4 540.7c-19.5 19.5-51.2 19.5-70.7 0s-19.5-51.2 0-70.7l212.1-212.1c19.5-19.5 51.2-19.5 70.7 0s19.5 51.2 0 70.7z"
                            p-id="1073" fill="#dbdbdb"></path>
                    </svg>
                </div>
                <div className='s-next-btn' onClick={()=>{
                    navigate(`/show?drama=${params.drama}&no=${params.no+1}`);
                }}>
                    <svg t="1748941152591" viewBox="0 0 1024 1024" version="1.1"
                         xmlns="http://www.w3.org/2000/svg" p-id="1450" width="200" height="200">
                        <path
                            d="M881 562H81c-27.6 0-50-22.4-50-50s22.4-50 50-50h800c27.6 0 50 22.4 50 50s-22.4 50-50 50z"
                            p-id="1451" fill="#bfbfbf"></path>
                        <path
                            d="M907.6 540.7L695.5 328.6c-19.5-19.5-19.5-51.2 0-70.7s51.2-19.5 70.7 0L978.4 470c19.5 19.5 19.5 51.2 0 70.7-19.6 19.6-51.2 19.6-70.8 0z"
                            p-id="1452" fill="#bfbfbf"></path>
                        <path
                            d="M695.5 695.4l212.1-212.1c19.5-19.5 51.2-19.5 70.7 0s19.5 51.2 0 70.7L766.2 766.1c-19.5 19.5-51.2 19.5-70.7 0s-19.5-51.2 0-70.7z"
                            p-id="1453" fill="#bfbfbf"></path>
                    </svg>
                    <span>Next</span>
                </div>
            </div>
        </>: <>
            404 NOT FOUND
        </>}
    </>
}