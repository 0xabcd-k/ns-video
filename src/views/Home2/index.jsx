import "./style.less"
import {getText,Text} from "@/utils/i18";
import {useEffect, useState} from "react";
import {delay, getCurrencySignal, getSafeTop, useHashQueryParams, useTelegramStartParams} from "@/utils";
import {apiAuth, apiFinance, apiVideo} from "@/api";
import {Toast,Swiper,Image } from "react-vant";
import Uid from "@/views/Common/Uid";
import ReactLoading from "react-loading";
import {useMediaQuery} from "react-responsive";
import {useNavigate} from "react-router-dom";
let watchRecordTimeout;
let playNo;
let logined;
export default function (){
    const params = {...useHashQueryParams(),...useTelegramStartParams()};
    const isMobile = useMediaQuery({ maxWidth: 767 });
    const [loading,setLoading] = useState(false)
    const [drama,setDrama] = useState(null);

    const [uid,setUid] = useState(null)
    const [isReadAll,setIsReadAll] = useState(null)

    const [player,setPlayer] = useState(null);
    const [playingVideoNo,setPlayingVideoNo] = useState(null);
    const navigate = useNavigate();
    const [email,setEmail] = useState("");
    const [purchase,setPurchaseState] = useState(null);
    const [gift,setGift] = useState(null)
    const [giftCode,setGiftCode] = useState(null)
    const [recommendsList,setRecommendsList] = useState([])
    const [shareModel,setShareModel] = useState(null)
    const [liveAgentModel,setLiveAgentModel] = useState(null)
    const [liveAgentComment,setLiveAgentComment] = useState("")
    const [descExpand,setDescExpand] = useState(null)

    const [videoFocus,setVideoFocus] = useState(false)

    function setPurchase(state){
        if(state){
            if(logined){
                setPurchaseState(state)
            }else{
                Toast.info(getText(Text.LoginEmailToast))
                if(isMobile){
                    navigate(`/login?redirect=${encodeURIComponent(`https://player.netshort.online/#/?drama=${params.drama}`)}`)
                }else{
                    setLogin(true)
                }
            }
        }else{
            setPurchaseState(state)
        }
    }
    async function init(){
        setLoading(true)
        if(params.from==="order"){
            Toast.info(getText(Text.OrderWaitToast))
            await delay(3000)
            window.location.href = window.location.origin+`/#/?drama=${params.drama}`;
        }
        if(params.drama){
            const infoResp = await apiAuth.userInfo({})
            if(infoResp?.data?.email){
                logined = true
                setEmail(infoResp?.data?.email)
            }
            if(infoResp?.data?.user_idx){
                setUid(infoResp?.data?.user_idx)
            }
            if(infoResp?.data?.is_read_all){
                setIsReadAll(true)
            }
            const dramaResp = await apiVideo.drama({
                idx: params.drama
            })
            if(dramaResp.success){
                setDrama(dramaResp.data)
                setPlayingVideoNo(dramaResp.data.watch_no)
            }else{
                if(dramaResp.err_code){
                    Toast.info(getText(Text.DramaExpire))
                    navigate("/series")
                }
                return
            }
            apiVideo.dramaList({
                series: Number((dramaResp.data.series_id!==0)?dramaResp.data.series_id:1),
                lan: navigator.language,
            }).then((recommendsResp)=>{
                if(recommendsResp.success){
                    setRecommendsList(recommendsResp.data.list)
                }
            })
            setTimeout(async ()=>{
                if(dramaResp.data.watch_no){
                    await play(dramaResp.data.watch_no)
                }else{
                    await play(1)
                }
            },1000)
        }
        setLoading(false)
    }
    async function playNext(playerInstance){
        playerInstance.dispose();
        await play(playNo+1)
    }
    async function play(no){
        playNo = no
        if(!no){
            return
        }
        setLoading(true)
        const timeout = setTimeout(()=>{
            setLoading(false)
        },4000)
        const resp = await apiVideo.video({
            drama_idx: params.drama,
            video_no: no
        })
        if (resp.success) {
            setPlayingVideoNo(no)
            clearTimeout(watchRecordTimeout)
            watchRecordTimeout = setTimeout(()=>{
                apiVideo.setHistory({
                    drama_idx: params.drama,
                    no: no,
                })
            },3000)
            if (player) {
                player.replayByVidAndPlayAuth(resp.data.id,resp.data.auth)
                apiVideo.listComment({
                    drama_idx: params.drama,
                    no: no,
                }).then((resp)=>{
                    if(resp.success){
                        const component = player.getComponent("AliplayerDanmuComponent")
                        component.CM.clear()
                        component.CM.load(resp.data.list)
                    }
                })
            }else{
                const playerInstance = new Aliplayer({
                    id: 'J_prismPlayer',
                    height: "100%",
                    width: "100%",
                    vid: resp.data.id,// 必选参数，可以通过点播控制台（路径：媒资库>音/视频）查询。示例：1e067a2831b641db90d570b6480f****。
                    playauth: resp.data.auth,// 必选参数，参数值可通过调用GetVideoPlayAuth接口获取。
                    encryptType: 1, // 必选参数，当播放私有加密流时需要设置本参数值为1。其它情况无需设置。
                    license: {
                        domain: "netshort.online",
                        key: "zPKRdofDrJuVP2scGf4d9fbc25a7f4f02887aad84c71e799b"
                    },
                    autoplay: true,
                    playsinline: true,
                    useH5Prism: true,
                    useFlashPrism: false,
                    isLive: false,
                    playConfig: {EncryptType: 'AliyunVoDEncryption'}, // 当您输出的M3U8流中，含有其他非私有加密流时，需要指定此参数。
                    components: [{
                        name: 'RateComponent',
                        type: AliPlayerComponent.RateComponent
                    },{
                        name: 'AliplayerDanmuComponent',
                        type: AliPlayerComponent.AliplayerDanmuComponent,
                        args: [[],(msg)=>{
                            const resp = playerInstance.getCurrentTime()
                            apiVideo.addComment({
                                drama_idx: params.drama,
                                no: playNo,
                                ...msg,
                                stime: Math.floor(resp*1000)
                            })
                        }]
                    }]
                }, function (player) {
                    console.log('The player is created.')
                });
                const component = playerInstance.getComponent("AliplayerDanmuComponent")
                playerInstance.on("ended",()=>{
                    playNext(playerInstance)
                })
                playerInstance.on("showBar",()=>{
                    setVideoFocus(true)
                    console.log("showBar")
                })
                playerInstance.on("hideBar",()=>{
                    setVideoFocus(false)
                    console.log("hideBar")
                })
                setPlayer(playerInstance)
                apiVideo.listComment({
                    drama_idx: params.drama,
                    no: no,
                }).then((resp)=>{
                    if(resp.success){
                        component.CM.clear()
                        component.CM.load(resp.data.list)
                    }
                })
            }
        }else{
            if (resp.err_code===31004){
                setPurchase(true)
            }
        }
        clearTimeout(timeout)
        setLoading(false)
    }
    function getPayments(currency){
        const payments = {
            CARD: (<svg t="1749267876715" onClick={() => {
                buyDrama("CARD")
            }} className="h-recharge-modal-icon" viewBox="0 0 1378 1024" version="1.1"
                        xmlns="http://www.w3.org/2000/svg" p-id="1898" width="200" height="200">
                <path
                    d="M1307.175385 0H71.286154C32.059077 0 0 32.098462 0 71.286154v186.131692h1378.461538V71.246769C1378.461538 32.098462 1346.363077 0 1307.175385 0zM0 921.206154c0 39.187692 32.098462 71.286154 71.286154 71.286154h1235.889231c39.187692 0 71.286154-32.098462 71.286153-71.286154V384.787692H0V921.206154z m895.409231-101.021539l45.174154-173.410461a16.935385 16.935385 0 0 1 16.265846-12.603077h272.029538c11.027692 0.157538 19.180308 10.594462 16.265846 21.346461l-45.016615 173.252924a16.935385 16.935385 0 0 1-16.265846 12.603076h-272.147692a16.817231 16.817231 0 0 1-16.305231-21.188923z m-507.588923-300.110769a23.630769 23.630769 0 0 1 23.630769-23.670154h44.544a23.630769 23.630769 0 0 1 23.630769 23.63077V582.892308a23.630769 23.630769 0 0 1-23.630769 23.670154h-44.504615a23.630769 23.630769 0 0 1-23.670154-23.63077v-62.857846z m-147.140923 0a23.630769 23.630769 0 0 1 23.630769-23.670154h44.544a23.630769 23.630769 0 0 1 23.630769 23.63077V582.892308a23.630769 23.630769 0 0 1-23.630769 23.670154h-44.504616a23.630769 23.630769 0 0 1-23.670153-23.63077v-62.857846z m-146.983385 0a23.630769 23.630769 0 0 1 23.630769-23.670154H161.870769a23.630769 23.630769 0 0 1 23.630769 23.63077V582.892308a23.630769 23.630769 0 0 1-23.630769 23.670154H117.366154a23.630769 23.630769 0 0 1-23.670154-23.63077v-62.857846z"
                    p-id="1899" fill="#ffffff"></path>
            </svg>),
            GOOGLE: (<svg t="1749267908906" onClick={() => {
                buyDrama("GOOGLEPAY")
            }} className="h-recharge-modal-icon" viewBox="0 0 1024 1024" version="1.1"
                          xmlns="http://www.w3.org/2000/svg" p-id="2774" width="200" height="200">
                <path
                    d="M652.8 550.4c-8 6.4-11.2 12.8-11.2 20.8s3.2 14.4 9.6 19.2c6.4 4.8 14.4 8 22.4 8 12.8 0 24-4.8 32-14.4 9.6-9.6 14.4-20.8 14.4-32-9.6-8-22.4-11.2-38.4-11.2-9.6 1.6-20.8 4.8-28.8 9.6zM542.4 417.6h-49.6v80h49.6c11.2 0 20.8-4.8 28.8-11.2 16-16 14.4-41.6-1.6-57.6-6.4-6.4-17.6-11.2-27.2-11.2z"
                    p-id="2775" fill="#ffffff"></path>
                <path
                    d="M1024 265.6V256c0-6.4 0-12.8-1.6-19.2-1.6-6.4-3.2-12.8-6.4-17.6-3.2-6.4-6.4-11.2-11.2-16-4.8-4.8-9.6-8-16-11.2-6.4-3.2-11.2-4.8-17.6-6.4-6.4-1.6-12.8-1.6-19.2-1.6H70.4c-6.4 0-12.8 0-19.2 1.6-6.4 1.6-12.8 3.2-17.6 6.4-6.4 3.2-11.2 6.4-16 11.2-4.8 4.8-8 9.6-11.2 16-3.2 6.4-4.8 11.2-6.4 17.6V769.6c0 6.4 0 12.8 1.6 19.2 1.6 6.4 3.2 12.8 6.4 17.6 3.2 6.4 6.4 11.2 11.2 16 4.8 4.8 9.6 8 16 11.2 6.4 3.2 11.2 4.8 17.6 6.4 6.4 1.6 12.8 1.6 19.2 1.6h881.6c6.4 0 12.8 0 19.2-1.6 6.4-1.6 12.8-3.2 17.6-6.4 6.4-3.2 11.2-6.4 16-11.2 4.8-4.8 8-9.6 11.2-16 3.2-6.4 4.8-11.2 6.4-17.6V768v-9.6V276.8v-11.2zM336 604.8c-20.8 20.8-51.2 32-86.4 32-49.6 0-94.4-28.8-116.8-72-19.2-36.8-19.2-81.6 0-118.4 22.4-44.8 67.2-73.6 116.8-73.6 32 0 64 11.2 88 33.6l-36.8 38.4c-12.8-12.8-32-20.8-49.6-19.2-33.6 0-62.4 24-73.6 54.4-4.8 16-4.8 33.6 0 51.2 9.6 32 38.4 54.4 73.6 54.4 17.6 0 32-4.8 44.8-12.8 14.4-9.6 22.4-24 25.6-40h-70.4V480h123.2c1.6 9.6 1.6 17.6 1.6 27.2-1.6 40-14.4 73.6-40 97.6z m256-97.6c-12.8 12.8-30.4 19.2-49.6 19.2h-48v92.8H464V390.4h76.8c19.2 0 36.8 6.4 49.6 20.8 27.2 25.6 28.8 67.2 3.2 94.4 0 0-1.6 0-1.6 1.6z m156.8 113.6h-27.2v-22.4H720c-12.8 17.6-28.8 27.2-48 27.2-17.6 0-32-4.8-43.2-16-11.2-9.6-17.6-24-17.6-38.4 0-16 6.4-28.8 17.6-38.4 12.8-9.6 28.8-14.4 48-14.4 17.6 0 32 3.2 43.2 9.6v-6.4c0-9.6-4.8-19.2-11.2-25.6-8-6.4-17.6-11.2-28.8-11.2-16 0-28.8 6.4-38.4 20.8l-25.6-16c14.4-20.8 35.2-30.4 62.4-30.4 20.8 0 38.4 6.4 51.2 17.6 12.8 11.2 19.2 27.2 19.2 48v96z m62.4 68.8h-30.4l36.8-80-64-147.2h32L832 576l44.8-113.6h32l-97.6 227.2z"
                    p-id="2776" fill="#ffffff"></path>
            </svg>),
            APPLEPAY: (<svg t="1749267950666" onClick={() => {
                buyDrama("APPLEPAY")
            }} className="h-recharge-modal-icon" viewBox="0 0 1152 1024" version="1.1"
                            xmlns="http://www.w3.org/2000/svg" p-id="3666" width="200" height="200">
                <path
                    d="M604.4 436.8c0 34.4-21 54.2-58 54.2h-48.6v-108.4h48.8c36.8 0 57.8 19.6 57.8 54.2z m95 125.2c0 16.6 14.4 27.4 37 27.4 28.8 0 50.4-18.2 50.4-43.8v-15.4l-47 3c-26.6 1.8-40.4 11.6-40.4 28.8zM1152 158v704c0 53-43 96-96 96H96c-53 0-96-43-96-96V158c0-53 43-96 96-96h960c53 0 96 43 96 96zM255.6 394.4c16.8 1.4 33.6-8.4 44.2-20.8 10.4-12.8 17.2-30 15.4-47.4-14.8 0.6-33.2 9.8-43.8 22.6-9.6 11-17.8 28.8-15.8 45.6z m121.2 149c-0.4-0.4-39.2-15.2-39.6-60-0.4-37.4 30.6-55.4 32-56.4-17.6-26-44.8-28.8-54.2-29.4-24.4-1.4-45.2 13.8-56.8 13.8-11.8 0-29.4-13.2-48.6-12.8-25 0.4-48.4 14.6-61 37.2-26.2 45.2-6.8 112 18.6 148.8 12.4 18.2 27.4 38.2 47 37.4 18.6-0.8 26-12 48.4-12 22.6 0 29 12 48.6 11.8 20.4-0.4 33-18.2 45.6-36.4 13.8-20.8 19.6-40.8 20-42z m270.8-106.8c0-53.2-37-89.6-89.8-89.6h-102.4v272.8h42.4v-93.2h58.6c53.6 0 91.2-36.8 91.2-90z m180 47.4c0-39.4-31.6-64.8-80-64.8-45 0-78.2 25.8-79.4 61h38.2c3.2-16.8 18.8-27.8 40-27.8 26 0 40.4 12 40.4 34.4v15l-52.8 3.2c-49.2 3-75.8 23.2-75.8 58.2 0 35.4 27.4 58.8 66.8 58.8 26.6 0 51.2-13.4 62.4-34.8h0.8V620h39.2v-136zM1032 421.8h-43l-49.8 161.2h-0.8l-49.8-161.2H844l71.8 198.6-3.8 12c-6.4 20.4-17 28.4-35.8 28.4-3.4 0-9.8-0.4-12.4-0.6v32.8c2.4 0.8 13 1 16.2 1 41.4 0 60.8-15.8 77.8-63.6L1032 421.8z"
                    p-id="3667" fill="#ffffff"></path>
            </svg>),
            JKOPAY: (<svg t="1749267972362" onClick={() => {
                buyDrama("JKOPAY")
            }} className="h-recharge-modal-icon" viewBox="0 0 1024 1024" version="1.1"
                          xmlns="http://www.w3.org/2000/svg" p-id="2693" width="200" height="200">
                <path
                    d="M832 0a192 192 0 0 1 192 192v640a192 192 0 0 1-192 192H192a192 192 0 0 1-192-192V192a192 192 0 0 1 192-192h640zM354.496 388.352c-11.52-12.992-28.8-16.384-38.848-7.552 0 0-53.568 72.576-83.2 98.56-29.696 26.112-97.664 70.464-97.664 70.464-9.984 8.832-8.832 26.496 2.624 39.488l13.824 15.68c11.456 12.992 21.76 14.848 38.848 7.552 9.024-3.84 25.024-12.16 44.544-24.704v267.456c0 16 12.032 28.928 26.88 28.928h23.424c14.848 0 26.88-12.928 26.88-28.928V524.8c32.704-33.984 53.12-68.032 59.136-81.408 7.04-15.808 8.832-26.432-2.624-39.424z m174.976-191.488h-19.264l-5.248 0.448a28.992 28.992 0 0 0-23.68 28.544v62.656l-0.512 3.968a17.472 17.472 0 0 1-17.024 13.44h-55.168l-5.248 0.448a28.928 28.928 0 0 0-23.808 28.48v19.2l0.448 5.248c2.496 13.44 14.336 23.68 28.608 23.68h55.168l4.032 0.448c7.68 1.792 13.44 8.704 13.44 16.96v36.608l-0.448 4.032a17.472 17.472 0 0 1-17.024 13.44h-55.168l-5.248 0.448a28.928 28.928 0 0 0-23.808 28.416v19.264l0.448 5.184c2.496 13.44 14.336 23.68 28.608 23.68h55.168l4.032 0.512c7.68 1.792 13.44 8.704 13.44 16.96v33.024l-0.448 3.968a17.472 17.472 0 0 1-17.024 13.44h-55.168l-5.248 0.512a28.928 28.928 0 0 0-23.808 28.416v19.2l0.448 5.248c2.496 13.44 14.336 23.68 28.608 23.68h55.168l4.032 0.448c7.68 1.792 13.44 8.704 13.44 16.96v64.256l-0.448 4.032a17.472 17.472 0 0 1-13.44 13.056c-48.32 10.24-96.768 19.84-96.768 19.84a30.464 30.464 0 0 0-21.568 37.312l5.12 19.968 1.536 5.12c4.928 12.672 14.976 17.28 35.2 17.472 22.656 0.128 54.4-3.584 126.848-22.08a409.28 409.28 0 0 0 133.888-60.8l6.08-4.352c13.12-9.792 19.2-18.56 15.488-33.024l-5.12-19.968-1.792-5.248a30.336 30.336 0 0 0-34.88-17.28s-21.12 10.432-48.256 22.656a17.472 17.472 0 0 1-24.704-15.936v-24.96l0.448-4.032a17.472 17.472 0 0 1 17.024-13.44h52.864l5.184-0.448a28.928 28.928 0 0 0 23.808-28.416v-19.264l-0.448-5.184a28.992 28.992 0 0 0-28.544-23.68h-52.864l-3.968-0.512a17.472 17.472 0 0 1-13.504-16.96v-33.024l0.448-3.968a17.472 17.472 0 0 1 17.024-13.44h52.864l0.384-0.064 1.152-0.256 0.704 0.128a3.008 3.008 0 0 0 0.832 0.192h65.28l4.096 0.448a17.792 17.792 0 0 1 13.76 17.28v306.048l0.448 5.184a27.52 27.52 0 0 0 26.368 23.744h23.488l4.8-0.448a28.48 28.48 0 0 0 22.016-28.48V549.248l0.512-4.032a17.792 17.792 0 0 1 17.28-13.696h84.416l5.184-0.512a28.928 28.928 0 0 0 23.808-28.416v-19.2l-0.448-5.248a28.992 28.992 0 0 0-28.544-23.68H631.36l-0.768 0.256c-0.64 0-0.832 0-1.472-0.192h-53.248l-3.968-0.512a17.472 17.472 0 0 1-13.504-17.024v-36.608l0.448-3.968a17.472 17.472 0 0 1 17.024-13.44h52.864l5.184-0.512a28.928 28.928 0 0 0 23.808-28.416v-19.2l-0.448-5.248a28.992 28.992 0 0 0-28.544-23.68h-52.864l-3.968-0.448a17.472 17.472 0 0 1-13.504-16.96v-62.656l-0.448-5.184a28.928 28.928 0 0 0-28.48-23.808z m-174.272 7.552c-11.264-12.8-28.352-16.256-38.08-7.68 0 0-51.904 70.848-80.832 96.128-28.864 25.344-95.04 68.48-95.04 68.48-9.728 8.512-8.512 25.856 2.752 38.656l13.632 15.424c11.328 12.8 21.44 14.72 38.08 7.68 16.64-7.04 56.576-28.16 100.352-66.88 43.328-38.4 68.8-82.24 75.52-97.728 6.848-15.424 8.512-25.856-2.752-38.656z m395.456-11.776h-1.152c-43.392 2.368-71.744 42.944-64.512 87.872 7.168 44.16 59.328 135.872 59.328 135.872a9.856 9.856 0 0 0 9.28 5.76 9.856 9.856 0 0 0 9.344-5.76s52.16-91.776 59.328-135.872c7.232-44.928-21.12-85.504-64.512-87.872-0.768 0-1.536 0-2.304 0.128l-1.856 0.064-1.792-0.064c-0.768-0.128-1.536-0.192-2.368-0.128z m2.944 39.616a33.088 33.088 0 1 1 0.064 66.112 33.088 33.088 0 0 1 0-66.112z"
                    fill="#ffffff" p-id="2694"></path>
            </svg>),
            MORE: (<svg t="1749461822218" onClick={() => {
                buyDrama("")
            }} className="h-recharge-modal-icon" viewBox="0 0 1024 1024" version="1.1"
                        xmlns="http://www.w3.org/2000/svg" p-id="3836" width="200" height="200">
                <path
                    d="M512 1024C229.230592 1024 0 794.769408 0 512S229.230592 0 512 0s512 229.230592 512 512-229.230592 512-512 512zM255.234048 574.787584c34.95936 0 63.29856-28.3392 63.29856-63.29856 0-34.958336-28.340224-63.297536-63.29856-63.297536-34.958336 0-63.297536 28.3392-63.297536 63.297536 0 34.95936 28.3392 63.29856 63.297536 63.29856z m256.256 0c34.958336 0 63.297536-28.3392 63.297536-63.29856 0-34.958336-28.3392-63.297536-63.29856-63.297536-34.958336 0-63.297536 28.3392-63.297536 63.297536 0 34.95936 28.3392 63.29856 63.297536 63.29856z m257.275904 0c34.958336 0 63.297536-28.3392 63.297536-63.29856 0-34.958336-28.3392-63.297536-63.297536-63.297536-34.95936 0-63.29856 28.3392-63.29856 63.297536 0 34.95936 28.340224 63.29856 63.29856 63.29856z"
                    fill="#ffffff" p-id="3837"></path>
            </svg>)
        }
        switch (currency){
            case "TWD":
                return [payments.CARD,payments.GOOGLE,payments.APPLEPAY,payments.JKOPAY,payments.MORE]
            default:
                return [payments.CARD,payments.GOOGLE,payments.APPLEPAY,payments.MORE]
        }
    }
    async function buyDrama(payment){
        if(drama?.purchase){
            Toast.info(getText(Text.Purchased))
        }else{
            setLoading(true)
            let os = "ANDROID"
            if(/iPhone|iPad|iPod/i.test(navigator.userAgent)){
                os = "IOS"
            }
            let p = "PaymentTypeAntSessionPay"
            if (payment === "JKOPAY"){
                p = "PaymentTypeAntPay"
            }
            const rechargeResp = await apiFinance.recharge({
                os: os,
                redirect: `https://player.netshort.online/#/?drama=${params.drama}&from=order`,
                payment: p,
                method_type: payment,
                terminal_type: isMobile?"WAP":"WEB",
                sku: "SkuTypeDrama",
                meta: {
                    "drama_idx": params.drama,
                }
            })
            if(rechargeResp.success){
                window.location.href = rechargeResp.data.url
            }
            setTimeout(()=>{
                setLoading(false)
            },1000)
        }
    }
    async function goAgent(){
        window.open("https://us.sobot.com/chat/h5/v6/index.html?sysnum=e23643ffc415478faf86f32bd31e2480&channelid=21","_blank")
    }

    const [expandDoc,setExpandDoc] = useState(false)
    const [expandContact,setExpandContact] = useState(false)
    useEffect(() => {
        init()
    }, []);
    return <>
        <Uid uid={uid}/>
        {loading && <>
            <div className='mask'>
                <div className='loading'>
                    <ReactLoading type="bars" color="#fff"/>
                </div>
            </div>
        </>}
        <div className='h-main' style={{maxWidth: '500px'}}>
            {purchase && <>
                <div className='h-modal-mask' />
                <div className='h-recharge-modal' style={{maxWidth: '450px'}}>
                    <svg t="1754281707178" onClick={()=>{
                        setPurchase(null)
                    }} className="h-modal-bottom-close" viewBox="0 0 1024 1024" version="1.1"
                         xmlns="http://www.w3.org/2000/svg" p-id="10963" width="200" height="200">
                        <path
                            d="M512 1024A512 512 0 1 1 512 0a512 512 0 0 1 0 1024zM305.956571 370.395429L447.488 512 305.956571 653.604571a45.568 45.568 0 1 0 64.438858 64.438858L512 576.512l141.604571 141.531429a45.568 45.568 0 0 0 64.438858-64.438858L576.512 512l141.531429-141.604571a45.568 45.568 0 1 0-64.438858-64.438858L512 447.488 370.395429 305.956571a45.568 45.568 0 0 0-64.438858 64.438858z"
                            fill="#cdcdcd" p-id="10964"></path>
                    </svg>
                    <div className='h-recharge-modal-title'>
                        {getText(Text.PaymentChoice)}
                    </div>
                    <div className='h-recharge-modal-desc'>
                        {getText(Text.PriceDesc)} {drama?.amount} {getCurrencySignal(drama?.currency)}
                        <br/>
                        {getText(Text.RechargeTip)}
                    </div>
                    <div className='h-recharge-modal-icon-box'>
                        {getPayments(drama?.currency).map((payment) => {
                            return payment
                        })}
                    </div>
                    <div className='h-recharge-modal-icon-gift'>
                        {gift ? <>
                            <div className='h-recharge-modal-icon-gift-input-box'>
                                <input onChange={(e) => {
                                    setGiftCode(e.target.value)
                                }} value={giftCode} placeholder={getText(Text.RedeemTip)}/>
                                <div className='h-recharge-modal-icon-gift-input-btn' onClick={async () => {
                                    setLoading(true)
                                    const resp = await apiVideo.dramaRedeem({
                                        cdk: giftCode,
                                        drama_idx: params.drama
                                    })
                                    if (resp.success) {
                                        Toast.info(getText(Text.RedeemSuccess))
                                        setGift(null)
                                        setGiftCode('')
                                        setPurchase(null)
                                    } else {
                                        switch (resp.err_code) {
                                            case 51001:
                                                Toast.info(getText(Text.RedeemInsufficient))
                                                break
                                            case 51002:
                                                Toast.info(getText(Text.RedeemDuplicate))
                                                break
                                            default:
                                                Toast.info(getText(Text.RedeemFailed))
                                        }
                                    }
                                    setLoading(false)
                                }}>
                                    {getText(Text.Redeem)}
                                </div>
                            </div>
                        </> : <>
                            {drama?.no_redeem ? <>
                                {getText(Text.NoRedeem)}
                            </> : <>
                                <div className='h-recharge-modal-icon-gift-box' onClick={() => {
                                    setGift(true)
                                }}>
                                    <div className='h-recharge-modal-icon-gift-tip-box'>
                                        <div className='h-recharge-modal-icon-gift-tip'>
                                            {getText(Text.RechargeReportTip)}
                                        </div>
                                        <div className='h-recharge-modal-icon-gift-tip-btn'>
                                            {getText(Text.Redeem)}
                                        </div>
                                    </div>
                                    <svg t="1754279216115" className="icon" onClick={() => {
                                        setGift(true)
                                    }} viewBox="0 0 1024 1024" version="1.1"
                                         xmlns="http://www.w3.org/2000/svg" p-id="9925" width="200" height="200">
                                        <path
                                            d="M163.637 204.221c0 0 105.635-76.058 207.044-4.225 99.297 73.945 135.213 90.846 154.227 92.959 0 0-4.225-19.014-4.225-23.239 0 0-73.945-27.466-105.635-120.423 0 0-160.565-63.381-251.411 54.93v0z"
                                            opacity="0.8" p-id="9926" fill="#ffd890"></path>
                                        <path
                                            d="M805.898 626.761c0 0 25.353-128.875-80.283-192.256-105.635-61.268-137.326-88.734-145.776-103.522 0 0 19.014-4.225 23.239-6.338 0 0 54.93 57.043 152.114 48.592 2.113 0 122.537 120.423 50.705 253.524z"
                                            opacity="0.8" p-id="9927" fill="#ffd890"></path>
                                        <path
                                            d="M358.006 134.502c0 0-27.466-67.606 4.225-82.396 33.804-12.676 63.381 88.734 65.493 95.072 4.225 6.338 35.916 78.17 92.959 111.973 0 0 4.225-27.466 27.466-40.141 0 0-4.225-80.283-2.113-90.846 2.113-10.563 16.901-114.086-71.831-124.65 0 0-118.311 19.014-133.1 35.916-14.789 14.789-21.127 50.705 0 90.846l16.901 4.225z"
                                            opacity="0.8" p-id="9928" fill="#ffd890"></path>
                                        <path
                                            d="M793.036 418.185c0 0 73.945-2.113 71.831-38.029s-105.635-21.127-114.086-23.239c-6.338 2.113-86.621 0-139.438-40.141 0 0 23.239-14.789 25.353-42.254 0 0 73.945-29.578 84.508-35.916 8.451-6.338 97.184-61.268 143.664 14.789 0 0 29.578 116.198 21.127 137.326-8.451 21.127-38.029 42.254-82.396 40.141l-10.563-12.676z"
                                            opacity="0.8" p-id="9929" fill="#ffd890"></path>
                                        <path
                                            d="M605.192 229.574c23.239 14.789 29.578 46.479 14.789 69.719-14.789 21.127-46.479 27.466-67.606 12.676-23.239-14.789-29.578-46.479-14.789-69.719 14.789-21.127 44.367-29.578 67.606-12.676z"
                                            opacity="0.8" p-id="9930" fill="#ffd890"></path>
                                        <path
                                            d="M710.826 597.183l-190.143-124.65 52.817-80.283 190.143 124.65-52.817 80.283zM427.724 409.153l-198.594-130.988 52.817-80.283 198.594 130.988-52.817 80.283zM780.545 487.323l-481.696-314.793c-14.789-10.563-33.804-6.338-44.367 8.451l-52.817 80.283c-10.563 14.789-6.338 35.916 8.451 44.367l14.789 10.563 27.466 16.901 158.452 103.522 92.959 61.268 150.002 99.297 27.466 16.901 12.676 8.451c14.789 10.563 33.804 6.338 44.367-8.451l52.817-80.283c8.451-16.901 4.225-35.916-10.563-46.479v0z"
                                            opacity="0.8" p-id="9931" fill="#ffd890"></path>
                                        <path
                                            d="M689.699 983.808h-179.58v-382.399h-111.973v384.512h-188.031v-384.512h-31.691v384.512c0 16.901 14.789 31.691 31.691 31.691h479.583c16.901 0 31.691-14.789 31.691-31.691v-384.512h-31.691v382.399z"
                                            opacity="0.8" p-id="9932" fill="#ffd890"></path>
                                        <path d="M178.426 633.099h542.964v-33.804h-542.964z" opacity="0.8" p-id="9933"
                                              fill="#ffd890"></path>
                                    </svg>
                                </div>
                            </>}
                        </>}
                    </div>
                </div>
            </>}
            {shareModel && <>
                <div className='h-modal-mask' onClick={()=>{
                    setShareModel(null)
                }}/>
                <div className='h-share' style={{maxWidth: '500px'}}>
                    <div className='h-share-title'>{getText(Text.ShareTitle)}</div>
                    <div className='h-share-box' style={{maxWidth: '500px'}}>
                        <div className='h-share-item'>
                            <svg onClick={()=>{
                                window.open(`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(window.location.href)}`,"_blank")
                            }} t="1751620092025" className="icon" viewBox="0 0 1107 1024" version="1.1"
                                 xmlns="http://www.w3.org/2000/svg" p-id="3800" width="200" height="200">
                                <path
                                    d="M553.967 0C248.01 0 0 195.231 0 436.04c0 223.685 214.083 407.92 489.757 433.017a33.708 33.708 0 0 1 22.512 14.705c12.237 20.145 3.542 63.069-5.96 111.197s42.169 23.149 53.6 17.576c9.1-4.415 243.31-136.444 382.742-265.921 101.963-79.1 165.25-189.02 165.25-310.558C1107.934 195.231 859.908 0 553.967 0zM369.311 550.157a29.545 29.545 0 0 1-29.78 29.276H238.257c-17.878 0-41.698-6.178-41.698-35.135v-216.55a29.528 29.528 0 0 1 29.78-29.277h5.959a29.528 29.528 0 0 1 29.78 29.276v187.275h77.438a29.545 29.545 0 0 1 29.796 29.276v5.859z m83.482-5.825a29.746 29.746 0 0 1-59.493 0V333.958a29.746 29.746 0 0 1 59.493 0v210.374z m262.01 0a32.92 32.92 0 0 1-29.78 29.276 33.708 33.708 0 0 1-35.102-16.787l-95.954-134.58v122.057a29.78 29.78 0 0 1-59.543 0V333.589a29.511 29.511 0 0 1 29.763-29.26 37.67 37.67 0 0 1 33.759 21.437c9.232 13.631 97.364 136.511 97.364 136.511V333.59a29.797 29.797 0 0 1 59.576 0v210.709z m178.696-134.614a29.276 29.276 0 1 1 0 58.552H816.06v46.819h77.438a29.276 29.276 0 1 1 0 58.536H777.35a26.557 26.557 0 0 1-26.859-26.322V330.702a26.557 26.557 0 0 1 26.86-26.339h116.148a29.276 29.276 0 1 1 0 58.536H816.06v46.835h77.438z"
                                    fill="#00C300" p-id="3801"></path>
                            </svg>
                            <div className='text'>
                                Line
                            </div>
                        </div>
                        <div className='h-share-item'>
                            <svg onClick={()=>{
                                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`,"_blank")
                            }} t="1751620265748" className="icon" viewBox="0 0 1024 1024" version="1.1"
                                 xmlns="http://www.w3.org/2000/svg" p-id="2730" width="200" height="200">
                                <path
                                    d="M512 0C229.05 0 0 229.05 0 512s229.05 512 512 512 512-229 512-512S795 0 512 0z m137.4 509.31h-88.89V830h-132V509.31h-67.42V398.85h67.38v-67.38c0-88.89 37.73-142.8 142.8-142.8h88.89v110.47h-53.91c-40.4 0-43.09 16.18-43.09 43.09v53.91h99.68l-13.47 113.18z"
                                    p-id="2731" fill="#405c9c"></path>
                            </svg>
                            <div className='text'>
                                Facebook
                            </div>
                        </div>
                        <div className='h-share-item'>
                            <svg onClick={()=>{
                                window.open(`https://t.me/share/url?url=${encodeURIComponent(window.location.href)}`,"_blank")
                            }} t="1751618514941" className="icon" viewBox="0 0 1024 1024" version="1.1"
                                 xmlns="http://www.w3.org/2000/svg" p-id="2321" width="200" height="200">
                                <path
                                    d="M679.424 746.862l84.005-395.996c7.424-34.852-12.581-48.567-35.438-40.009L234.277 501.138c-33.72 13.13-33.134 32-5.706 40.558l126.282 39.424 293.156-184.576c13.714-9.143 26.295-3.986 16.018 5.157L426.898 615.973l-9.143 130.304c13.13 0 18.871-5.706 25.71-12.581l61.696-59.429 128 94.282c23.442 13.129 40.01 6.29 46.3-21.724zM1024 512c0 282.843-229.157 512-512 512S0 794.843 0 512 229.157 0 512 0s512 229.157 512 512z"
                                    fill="#1296DB" p-id="2322"></path>
                            </svg>
                            <div className='text'>
                                Telegram
                            </div>
                        </div>
                        <div className='h-share-item'>
                            <svg onClick={async ()=>{
                                if(await navigator.clipboard.writeText(window.location.href)) {
                                    Toast.info("success")
                                }else {
                                    Toast.info("failed")
                                }
                            }} t="1751618588737" className="icon" viewBox="0 0 1024 1024" version="1.1"
                                 xmlns="http://www.w3.org/2000/svg" p-id="4883" width="200" height="200">
                                <path
                                    d="M512 0C229.376 0 0 229.376 0 512s229.376 512 512 512 512-229.376 512-512S794.624 0 512 0z m-67.584 766.464c-51.712 51.712-135.168 51.712-186.88 0-51.712-51.712-51.712-135.68 0-186.88l132.608-132.608c51.712-51.712 135.168-51.712 186.88 0 1.536 1.536 2.56 3.072 4.096 4.096 3.072 2.56 5.632 5.632 7.68 8.704v1.024c8.192 15.36 2.048 34.816-13.312 43.008a30.626 30.626 0 0 1-29.696 0c-1.024 1.024-9.216-7.168-13.312-11.776-27.136-27.136-70.144-27.136-97.28 0L302.08 624.128c-27.136 27.136-27.136 70.656 0 97.28 27.136 27.136 70.656 27.136 97.28 0l79.872-79.872c27.648 13.824 60.416 13.824 88.064 1.024l-122.88 123.904z m322.048-322.048L633.856 577.024c-51.712 51.712-135.168 51.712-186.88 0-1.536-1.536-2.56-3.072-4.096-4.096-3.072-2.56-5.632-5.632-7.68-8.704V563.2c-8.192-15.36-2.048-34.816 13.312-43.008a30.626 30.626 0 0 1 29.696 0c1.024-1.024 9.216 7.168 13.312 11.776 27.136 27.136 70.144 27.136 97.28 0l133.12-132.096c27.136-27.136 27.136-70.656 0-97.28-27.136-27.136-70.656-27.136-97.28 0l-80.384 79.36c-27.648-13.824-60.416-13.824-88.064-1.024l123.392-123.392c51.712-51.712 135.168-51.712 186.88 0 51.712 51.712 51.712 135.168 0 186.88z"
                                    fill="#EA5947" p-id="4884"></path>
                            </svg>
                            <div className='text'>
                                Copy Link
                            </div>
                        </div>
                    </div>
                    <div className='h-share-close' onClick={()=>{
                        setShareModel(null)
                    }}>{getText(Text.LineClose)}</div>
                </div>
            </>}
            {liveAgentModel && <>
                <div className='h-modal-mask' onClick={()=>{
                    setLiveAgentModel(null)
                }}/>
                <div className='h-comment' style={{maxWidth: '500px'}}>
                    <svg t="1754281707178" onClick={()=>{
                        setLiveAgentModel(null)
                    }} className="h-modal-top-close" viewBox="0 0 1024 1024" version="1.1"
                         xmlns="http://www.w3.org/2000/svg" p-id="10963" width="200" height="200">
                        <path
                            d="M512 1024A512 512 0 1 1 512 0a512 512 0 0 1 0 1024zM305.956571 370.395429L447.488 512 305.956571 653.604571a45.568 45.568 0 1 0 64.438858 64.438858L512 576.512l141.604571 141.531429a45.568 45.568 0 0 0 64.438858-64.438858L576.512 512l141.531429-141.604571a45.568 45.568 0 1 0-64.438858-64.438858L512 447.488 370.395429 305.956571a45.568 45.568 0 0 0-64.438858 64.438858z"
                            fill="#cdcdcd" p-id="10964"></path>
                    </svg>
                    <div className='h-comment-title'>{getText(Text.ReviewTitle)}</div>
                    <textarea onChange={(e)=>{
                        setLiveAgentComment(e.target.value)
                    }} value={liveAgentComment} placeholder={getText(Text.ReviewTip)}/>
                    <div className='h-comment-btn-box'>
                        <div className='h-comment-btn h-comment-btn-live-agent' onClick={async ()=>{
                            await goAgent()
                        }}>{getText(Text.LiveAgent)}</div>
                        <div className='h-comment-btn h-comment-btn-submit' onClick={async ()=>{
                            const resp = await apiVideo.review({
                                drama_idx: params.drama,
                                no: playNo,
                                comment: liveAgentComment
                            })
                            if (resp.success) {
                                Toast.info("success")
                                setLiveAgentModel(null)
                            }else {
                                Toast.info("failed")
                            }
                        }}>{getText(Text.Submit)}</div>
                    </div>
                </div>
            </>}
            <div className='h-header' style={{maxWidth: '500px',top:getSafeTop()}}>
                <div className='h-h-icon'>
                    <img src={require("@/assets/main/logo.png")} alt='logo'/>
                </div>
                <div className='h-h-search' onClick={()=>{
                    navigate("/search")
                }}>
                    <svg className='icon' xmlns="http://www.w3.org/2000/svg" width="33" height="33" viewBox="0 0 33 33"
                         fill="none">
                        <path
                            d="M15.9434 31.4494C12.8072 31.4631 9.73674 30.5509 7.11714 28.8272C4.49754 27.1035 2.44538 24.645 1.21801 21.7602C0.00964754 18.8874 -0.308822 15.7184 0.30378 12.6628C0.916381 9.60718 2.43188 6.80552 4.65435 4.62001C6.8949 2.41383 9.73381 0.913282 12.8193 0.304296C15.9048 -0.304691 19.1012 0.00465676 22.0125 1.194C25.4096 2.56205 28.2214 5.07419 29.9612 8.29568C31.701 11.5172 32.2593 15.2453 31.5396 18.8348C30.8199 22.4243 28.8673 25.6494 26.0199 27.9519C23.1725 30.2543 19.6094 31.4893 15.9472 31.4431L15.9434 31.4494ZM15.9434 2.34108C13.2667 2.3281 10.6458 3.10597 8.40985 4.57698C6.17394 6.04799 4.42269 8.14657 3.37604 10.6092C2.34589 13.0609 2.07539 15.7653 2.59952 18.3724C3.12366 20.9795 4.41831 23.3695 6.31603 25.2331C8.23023 27.1129 10.6542 28.3899 13.2876 28.9058C15.9209 29.4216 18.6478 29.1536 21.1303 28.1351C24.0247 26.9652 26.4192 24.8213 27.8999 22.0738C29.3806 19.3263 29.8543 16.148 29.2392 13.0884C28.6241 10.0288 26.9589 7.2802 24.5313 5.31776C22.1037 3.35533 19.0665 2.30242 15.9446 2.34108H15.9434ZM31.8214 33C31.5134 32.9954 31.2193 32.8712 31.0013 32.6536L25.3346 27.0578C25.2254 26.9509 25.1386 26.8232 25.0794 26.6824C25.0202 26.5415 24.9897 26.3902 24.9897 26.2375C24.9897 26.0847 25.0202 25.9334 25.0794 25.7925C25.1386 25.6517 25.2254 25.524 25.3346 25.4171C25.5563 25.1994 25.8547 25.0775 26.1654 25.0775C26.4762 25.0775 26.7746 25.1994 26.9963 25.4171L32.6643 31.0129C32.8248 31.173 32.9341 31.3772 32.9782 31.5995C33.0223 31.8219 32.9992 32.0523 32.9118 32.2615C32.8229 32.4717 32.6745 32.6514 32.4848 32.7785C32.2952 32.9057 32.0725 32.9747 31.8442 32.9772L31.8214 33Z"
                            fill="white" fill-opacity="0.8"/>
                    </svg>
                    <span>{getText(Text.Search)}</span>
                </div>
                <div className='h-h-login' onClick={()=>{
                    navigate("/login")
                }}>
                    {email?<>
                        <span className='h-h-l-account'>{email}</span>
                    </>:<>
                        <svg t="1749537708692" className="icon" viewBox="0 0 1024 1024" version="1.1"
                             xmlns="http://www.w3.org/2000/svg" p-id="2439" id="mx_n_1749537708693" width="200"
                             height="200">
                            <path
                                d="M512 64C264.8 64 64 264.8 64 512s200.8 448 448 448 448-200.8 448-448S759.2 64 512 64z m32 704h-64v-64h64v64z m-64-128V256h64v384h-64z"
                                p-id="2440" fill="#ffffff"></path>
                        </svg>
                        <span className='h-h-l-login'>{getText(Text.Login)}</span>
                    </>}
                </div>
            </div>
            <div style={{marginTop: getSafeTop()}}/>
            <div className='h-h-show'>
                <div id='J_prismPlayer'/>
            </div>
            <div className='h-h-no' style={videoFocus?{marginTop: "8vh"}:{}}>
                <div className='h-h-n-left'>
                    <span>{getText(Text.VideoNo)} {playingVideoNo}</span>
                </div>
            </div>
            <div className='h-h-next'>
                <div className='h-h-n-right'>
                    <div className='h-h-n-btn' onClick={async ()=>{
                        await play(playingVideoNo + 1)
                    }}>
                        {getText(Text.Next)}
                    </div>
                </div>
            </div>
            <div className='h-h-episode-box'>
                {Array.from({length: (drama?.pay_num??0)}).map((item, index) => {
                    if (index + 1 === playingVideoNo) {
                        return <div className='h-h-episode-box-item playing' onClick={async () => {
                            await play(index+1)
                        }}>
                            {index + 1}
                        </div>
                    } else {
                        return <div className='h-h-episode-box-item free' onClick={async () => {
                            await play(index+1)
                        }}>
                            {index + 1}
                        </div>
                    }
                })}
                {Array.from({length: (drama?.video_num??0) - (drama?.pay_num??0)}).map((item, index) => {
                    if (index + (drama?.pay_num??0) + 1 === playingVideoNo) {
                        return <div className='h-h-episode-box-item playing' onClick={async () => {
                            await play(index + (drama?.pay_num??0) + 1)
                        }}>
                            {index + (drama?.pay_num??0) + 1}
                        </div>
                    } else {
                        return <div className='h-h-episode-box-item pay' onClick={async () => {
                            await play(index + (drama?.pay_num??0) + 1)
                        }}>
                            {index + (drama?.pay_num??0) + 1}
                        </div>
                    }
                })}
            </div>
            {descExpand?<>
                <div className='h-h-desc-expand'>
                    <div className='h-h-d-desc'>
                        <div className='h-h-d-desc-title'>
                            {drama?.name}
                        </div>
                        <div className='h-h-d-desc-desc'>
                            <div className='h-h-d-poster'>
                                <Image src={drama.poster} width={'100%'}/>
                            </div>
                            <p>{drama?.desc}</p>
                        </div>
                    </div>
                    <div className='h-h-d-desc-btn' onClick={()=>{
                        setDescExpand(null)
                    }}>
                        <svg t="1754213942985" className="icon" viewBox="0 0 1024 1024" version="1.1"
                             xmlns="http://www.w3.org/2000/svg" p-id="2325" width="200" height="200">
                            <path
                                d="M838.116 732.779 877.7 693.195 511.979 327.549 146.3 693.195 185.883 732.779 512.003 406.652Z"
                                p-id="2326" fill="#ffffff"></path>
                        </svg>
                    </div>
                </div>
            </> : <>
                <div className='h-h-desc'>
                    <div className='h-h-d-title'>
                        {drama?.name}
                    </div>
                    <div className='h-h-d-icon' onClick={()=>{
                        setDescExpand(true)
                    }}>
                        <svg t="1754212931478" className="icon" viewBox="0 0 1024 1024" version="1.1"
                             xmlns="http://www.w3.org/2000/svg" p-id="2485" width="200" height="200">
                            <path
                                d="M185.884 327.55 146.3 367.133 512.021 732.779 877.7 367.133 838.117 327.55 511.997 653.676Z"
                                p-id="2486" fill="#ffffff"></path>
                        </svg>
                    </div>
                </div>
            </>}
            <div className='h-btn-bar'>
                <svg t="1754272034181" onClick={()=>{
                    navigate("/history")
                }} className="h-btn-bar-icon" viewBox="0 0 1024 1024" version="1.1"
                     xmlns="http://www.w3.org/2000/svg" p-id="2340" width="200" height="200">
                    <path
                        d="M511.215 62.066c-247.841 0-448.76 200.919-448.76 448.766 0 247.841 200.919 448.76 448.76 448.76 247.847 0 448.766-200.919 448.766-448.76 0-247.847-200.919-448.766-448.766-448.766zM734.022 733.632c-5.145 5.145-11.888 7.718-18.625 7.718-6.743 0-13.486-2.573-18.63-7.718l-211.887-211.893v-267.967c0-14.558 11.803-26.348 26.342-26.348 14.545 0 26.348 11.791 26.348 26.348v246.152l196.452 196.452c10.289 10.278 10.289 26.971 0 37.256z"
                        p-id="2341" fill="#cdcdcd"></path>
                </svg>
                <svg t="1754272077181" onClick={()=>{
                    setLiveAgentModel(true)
                }} className="h-btn-bar-icon" viewBox="0 0 1024 1024" version="1.1"
                     xmlns="http://www.w3.org/2000/svg" p-id="3491" width="200" height="200">
                    <path
                        d="M894.1 355.6h-1.7C853 177.6 687.6 51.4 498.1 54.9S148.2 190.5 115.9 369.7c-35.2 5.6-61.1 36-61.1 71.7v143.4c0.9 40.4 34.3 72.5 74.7 71.7 21.7-0.3 42.2-10 56-26.7 33.6 84.5 99.9 152 183.8 187 1.1-2 2.3-3.9 3.7-5.7 0.9-1.5 2.4-2.6 4.1-3 1.3 0 2.5 0.5 3.6 1.2a318.46 318.46 0 0 1-105.3-187.1c-5.1-44.4 24.1-85.4 67.6-95.2 64.3-11.7 128.1-24.7 192.4-35.9 37.9-5.3 70.4-29.8 85.7-64.9 6.8-15.9 11-32.8 12.5-50 0.5-3.1 2.9-5.6 5.9-6.2 3.1-0.7 6.4 0.5 8.2 3l1.7-1.1c25.4 35.9 74.7 114.4 82.7 197.2 8.2 94.8 3.7 160-71.4 226.5-1.1 1.1-1.7 2.6-1.7 4.1 0.1 2 1.1 3.8 2.8 4.8h4.8l3.2-1.8c75.6-40.4 132.8-108.2 159.9-189.5 11.4 16.1 28.5 27.1 47.8 30.8C846 783.9 716.9 871.6 557.2 884.9c-12-28.6-42.5-44.8-72.9-38.6-33.6 5.4-56.6 37-51.2 70.6 4.4 27.6 26.8 48.8 54.5 51.6 30.6 4.6 60.3-13 70.8-42.2 184.9-14.5 333.2-120.8 364.2-286.9 27.8-10.8 46.3-37.4 46.6-67.2V428.7c-0.1-19.5-8.1-38.2-22.3-51.6-14.5-13.8-33.8-21.4-53.8-21.3l1-0.2zM825.9 397c-71.1-176.9-272.1-262.7-449-191.7-86.8 34.9-155.7 103.4-191 190-2.5-2.8-5.2-5.4-8-7.9 25.3-154.6 163.8-268.6 326.8-269.2s302.3 112.6 328.7 267c-2.9 3.8-5.4 7.7-7.5 11.8z"
                        fill="#cdcdcd" p-id="3492"></path>
                </svg>
                <svg t="1754272136586" onClick={()=>{
                    setShareModel(true)
                }} className="h-btn-bar-icon" viewBox="0 0 1024 1024" version="1.1"
                     xmlns="http://www.w3.org/2000/svg" p-id="4736" width="200" height="200">
                    <path
                        d="M816 416a174.816 174.816 0 0 1-133.6-62.624l-219.616 104.672a222.944 222.944 0 0 1-1.216 174.656l173.696 89.984A179.84 179.84 0 1 1 611.2 784l-185.056-96a224 224 0 1 1 2.912-284.8l221.44-105.6A175.552 175.552 0 1 1 816 416z"
                        fill="#cdcdcd" p-id="4737"></path>
                </svg>
                <div className={'h-btn-bar-icon'+' '+ (!isReadAll&&'notify')} onClick={()=>{
                    navigate("/message")
                }}>
                    <svg t="1754272171195" className="icon" viewBox="0 0 1024 1024" version="1.1"
                         xmlns="http://www.w3.org/2000/svg" p-id="5870" width="200" height="200">
                        <path
                            d="M981.333333 362.666667v384a21.333333 21.333333 0 0 1-21.333333 21.333333H597.333333v192a21.333333 21.333333 0 0 1-21.333333 21.333333H405.333333a21.333333 21.333333 0 0 1-21.333333-21.333333v-192H170.666667v5.333333a37.373333 37.373333 0 0 1-37.333334 37.333334h-53.333333a37.373333 37.373333 0 0 1-37.333333-37.333334V208a37.373333 37.373333 0 0 1 37.333333-37.333333h53.333333a37.373333 37.373333 0 0 1 37.333334 37.333333v5.333333h128v192a21.333333 21.333333 0 0 0 21.333333 21.333334h85.333333a21.333333 21.333333 0 0 0 0-42.666667h-64V213.333333h490.666667a149.333333 149.333333 0 0 1 149.333333 149.333334zM341.333333 170.666667h85.333334a85.333333 85.333333 0 0 0 0-170.666667H320a21.333333 21.333333 0 0 0-21.333333 21.333333v192h42.666666z"
                            fill="#cdcdcd" p-id="5871"></path>
                    </svg>
                    <div className='dot'/>
                </div>
            </div>
            <div className='h-activity-swiper'>
                <Swiper autoplay={5000}>
                    <Swiper.Item key={1} onClick={()=>{
                        window.open("https://t.me/netshort001bot/app")
                    }}>
                        <Image src={require("@/assets/poster/fission-poster.png")} />
                    </Swiper.Item>
                    <Swiper.Item key={2} onClick={()=>{
                        navigate("/activity/line")
                    }}>
                        <Image src={require("@/assets/poster/line-poster.jpg")} />
                    </Swiper.Item>
                </Swiper>
            </div>
            <div className='h-more'>
                <div className='h-more-title'>
                    {getText(Text.Recommend)}
                </div>
                <div className='h-more-content'>
                    {recommendsList?.map((item,index)=>{
                        return <div className='h-more-item' onClick={()=>{
                            navigate(`/?drama=${item.idx}`)
                            window.location.reload()
                        }}>
                            <div className='h-more-item-tip'>
                                {getText(Text.CompleteSeries)}
                            </div>
                            <img className='h-more-item-poster' src={item.poster} alt='poster'/>
                            <div className='h-more-item-name'>{item.name}</div>
                        </div>
                    })}
                </div>
            </div>
            <div className='h-about'>
                {expandDoc?<div className='h-about-item'>
                    <div className='h-about-item-title'>
                        <div className='h-about-item-title-text'>About</div>
                        <svg t="1754212931478" onClick={()=>{
                            setExpandDoc(false)
                        }} className="h-about-item-title-icon" viewBox="0 0 1024 1024" version="1.1"
                             xmlns="http://www.w3.org/2000/svg" p-id="2485" width="200" height="200">
                            <path
                                d="M185.884 327.55 146.3 367.133 512.021 732.779 877.7 367.133 838.117 327.55 511.997 653.676Z"
                                p-id="2486" fill="#ffffff"></path>
                        </svg>
                    </div>
                    <div className='h-about-item-content'>
                        <div className='h-about-item-content-item' onClick={()=>{
                            window.open("https://www.netshort.com/agreement/4")
                        }}>
                            Terms of Service
                        </div>
                        <div className='h-about-item-content-item' onClick={()=>{
                            window.open("https://www.netshort.com/agreement/2")
                        }}>
                            Privacy Policy
                        </div>
                        <div className='h-about-item-content-item' onClick={()=>{
                            window.open("https://www.netshort.com/faq")
                        }}>
                            FAQ
                        </div>
                    </div>
                </div>:<div className='h-about-item'>
                    <div className='h-about-item-title'>
                        <div className='h-about-item-title-text'>About</div>
                        <svg t="1754213942985" onClick={()=>{
                            setExpandDoc(true)
                        }} className="h-about-item-title-icon" viewBox="0 0 1024 1024" version="1.1"
                             xmlns="http://www.w3.org/2000/svg" p-id="2325" width="200" height="200">
                            <path
                                d="M838.116 732.779 877.7 693.195 511.979 327.549 146.3 693.195 185.883 732.779 512.003 406.652Z"
                                p-id="2326" fill="#ffffff"></path>
                        </svg>
                    </div>
                </div>}
                {expandContact?<div className='h-about-item'>
                    <div className='h-about-item-title'>
                        <div className='h-about-item-title-text'>Contact Us</div>
                        <svg t="1754212931478" onClick={()=>{
                            setExpandContact(false)
                        }} className="h-about-item-title-icon" viewBox="0 0 1024 1024" version="1.1"
                             xmlns="http://www.w3.org/2000/svg" p-id="2485" width="200" height="200">
                            <path
                                d="M185.884 327.55 146.3 367.133 512.021 732.779 877.7 367.133 838.117 327.55 511.997 653.676Z"
                                p-id="2486" fill="#ffffff"></path>
                        </svg>
                    </div>
                    <div className='h-about-item-content'>
                        <div className='h-about-item-content-item' onClick={() => {
                            window.location.href = "mailto:support@netshort.com";
                        }}>
                            support@netshort.com
                        </div>
                        <div className='h-about-item-content-item' onClick={() => {
                            window.location.href = "mailto:business@netshort.com";
                        }}>
                            business@netshort.com
                        </div>
                    </div>
                </div>:<div className='h-about-item'>
                    <div className='h-about-item-title'>
                        <div className='h-about-item-title-text'>Contact Us</div>
                        <svg t="1754213942985" onClick={()=>{
                            setExpandContact(true)
                        }} className="h-about-item-title-icon" viewBox="0 0 1024 1024" version="1.1"
                             xmlns="http://www.w3.org/2000/svg" p-id="2325" width="200" height="200">
                            <path
                                d="M838.116 732.779 877.7 693.195 511.979 327.549 146.3 693.195 185.883 732.779 512.003 406.652Z"
                                p-id="2326" fill="#ffffff"></path>
                        </svg>
                    </div>
                </div>}

                <div className='h-about-item'>
                    <div className='h-about-item-title'>
                        <div className='h-about-item-title-text'>Download App</div>
                    </div>
                    <div className='h-about-item-btn-box'>
                        <img onClick={()=>{
                            window.open("https://play.google.com/store/apps/details?id=com.netshort.abroad","_blank")
                        }} src={require("@/assets/android-download.png")} alt='android-download'/>
                        <img onClick={()=>{
                            window.open("https://apps.apple.com/us/app/netshort-popular-dramas-tv/id6504849169?mt=8","_blank")
                        }} src={require("@/assets/ios-donwload.png")} alt='ios-download'/>
                    </div>
                </div>
                <div className='h-about-me'>
                    <div className='h-about-share-btn-box'>
                        <img className='h-about-share-btn' onClick={()=>{
                            window.open("https://www.facebook.com/profile.php?id=61564956644828","_blank")
                        }} alt='facebook' src="data:image/png;base64,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"/>
                        <img className='h-about-share-btn' onClick={()=>{
                            window.open("https://www.youtube.com/@NetShort-app","_blank")
                        }} alt='youtube' src="data:image/png;base64,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"/>
                        <img className='h-about-share-btn' onClick={()=>{
                            window.open("https://www.instagram.com/netshortdrama","_blank")
                        }} alt='instagram' src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEgAAABICAYAAABV7bNHAAAAAXNSR0IArs4c6QAAHBlJREFUeF7VXAmYFNW1/k9V9UwP6ygEBxhlkSAmTwVREJVlIgY0GNcYjQu4fRLUJ0SIGyIqqHHnueGOCxoVE3dRIUBEkaeIiQv42GVHYBiYYXpmuuo8zl2q6/YMKooxqe+rqaWrqu/9+z//We6tIfwLl7GYEfRKHdydEHb1EXbxibsEzKUBc4lPaBwwp31ECJhrfHB5inmLR7zEZ14eIFqYiujDT7B8XhnKsv+qZtMP/UUvpKvbeZw5wWfu73PUPyCkA4B9MHxElIqYfYKAIscIAPgIyWdGoK5hBJy7PmBs8xHNDZinFiI1hdBxxQ/Zhx8EIGHK/unuZ3iIhvjM/WxnbYdTDJZ9dcwRPEQkIMTn7GcGRPuZvpYpQAQfADGYgXcJ9PBKrHm2A8oyuxus3QrQYygvLkgHl/ocDQ/AxfrXNyzQ7BDmUKBYw5RiZgEnJecVY6TjTJY1GkDLLNZAKtDAYAMFgQjEzNF6gjdxK7ZP2APdtuwuoHYLQI9hWbqgoMWlRHyFDxRLR23nFCuEHaQ7q48taLlOm/MKQGFKbIb2HuhrvRwuCiQmjvsgQIFZwLnuS6x9YHcw6nsD9FS68iifw4keuJPWD202sTkZvYlBMeAolgibmJUe2es1Y5L6o1ilTEoMioiEPoY1uWPNKYZ8CorAHC3xgfMJB876Pmz6zgAJa9KFe97pg4faDgSstSEAKz2R8x6LWSgRdoAQwDzKaU8+MJZtwhpfTAhskEkAJOcUKBATAxCpXX1FqD8jnvhltG3Ed2XTdwLoucINnTwUvOKBuyS9jQLHAKE7BiidIcUU45EEPMBDGAuzF3srDZqIuALXsEY2JNwQc1L0IUFEKCVsUQeECEwRiRoxInVeDE6uiRB+ESAaRDhiya6yaZcBerGwYgAhnOIxN4mZY0RWH1tdscIrLFLnRWC1SBsQBUDtwTTjtIfS96nOCzDGpJIdU9QQQDgCkTBHkAgVOPo+AUh2I4FHwQniqoj5lBT6vLkrIO0SQG+kygeDooeJOdCiC/FGAoDqPDFTqghocnCAdLuAC9t7FLTwEDQn+E0IXoqYCkFeWlmCmIZe5Y9zrHig2kbCA7NwdUSoYSATAhkGKiPGulrwqhqiT6s5+rSSKBPGIGlw5Mmh2gKcZYQXBOj/+LcF6VsDNC214VIC3Sm01ywRcxCPwwh84j1PLaQ9Tk2j6VGFUAD8GEsmAs/cCvx5I/Oz68E1WW1y1tyMOQLRCB8DJ3ybJn6rnsxObRgcgScFROypYA3KbIIA2PPsNJVc1xSpEuVn/n0WYdb45eCJqxhZJeDGFCNFSmYeEmDQNzLpGwGaG6wfAOAVoiilPQ1Y2FPY1kfbx4upcd/Cfx9QGmgJz94CnPUP5uVVBiAJEZiJoiwxjiOc8LWa9LUAzcPKTn7gf0RAE+tuCREVtgu4dFpLSrUXf/QfsCzfDi6bw7y8UkuRxJci8uAqD35Xwok79W47BWgGlqVbBan5PrCfgCIm5YE4VepRycy9sDNwRAZ5ejVjdjWwrBZYH4I3ZokyYIhGVEWEOhHonPiqFpvgT+8bz6M6IQIr7ikkFCtnz0gDaEKgYh/YKwD/tJDoiGbAkcWgdMOmzsu3A73/zli1XcdIylMqoBauQObgDjinwTxupwAt8b+8HyoI1AG9FeYW01ujsK+00F14S4ho3GaOHqmAVxHpeM36atdH6+/MZVP5TzKuW4Mj2kEcsXRKxzgaMCA0jxdtkf0IKPYIQ9qALu8IKmmgje9vAvf+GyNrgkj1HGlI9ICPs3/fkC00CNDaYGXfMApnKOaAlOYIg9JDm1GT+1rWe040czv4rHWMVXUqbrGMsCDkAjt7q8R6nuqumzoYMTVgxB2XWIdDh02WVRosK8IKLEJJAdOT3Yj6t6r/Qw6fB56wQEffJgww0fjRhCHT82+oB9AyLEs39qJPPNC+ErpLmE8ckVdEaLykHbwSV3d4+naOBq3S8UmSFcoa4pxbR8Iq8jU7ZhsHgiYaVgGgAigyLMl1XrNHzicBsfuKFeazkJAmeK8ewTiqldvHLbXgvV9gVNYos1YM1VayZAVWH9ABYx1TqwdQhbfkUmK+U5uVRPcMFQwObkbBYyUOwLwuCz70S+bVdTEYNiUQWJOAxOdVxm0iRBUf6nRBRcEqKg5VBKyB0nGMTj6zxrRiQGKzohNaAW3TwLxy5qlrjGZFoJYpYMGxRC1dT8sXzAYe/sIElCby1tp3pY9hf3IVIXFUjvnFRdR4GYGb67KCuEStF94bpUQDGzsARcM3gCeUx5GufBjnTKqgJbG1zp+cL7Xpg5xXnwsIJqhzWGK0xWqMYo49FwHtC4hmHAZq3yj3+HsXM188LzZHDN8PdOchDhF46krgmDeMidn0RKU3WyqQ7bgHRsT1JOfGEF9cuyOEurZeZ9Igf3MnIG2rMQBnIkStFwEV0mAjuoJOTphJJ0TWqrRpaT2KT+bMRQFkzMcwRtM/ioWZYVikvFDE9PzBRKe0rq+JZdNAM9fp+4pTTGt/S0h6t2wEbvowI1OnPKYtk5jfcayPEdfZh8YAMWakI7ReysTyjeYX1zejeyH8Dzq55jV9G0dHL9aeMnbZyX37FPlYp1USf9utxlJMTJuMJJ064Yy0qXFD7MnqyoYBylvZn1BaVF+IR88Hxv8zB/4rRxMN2sdtf+8pwOw1ueQ2J9hbgKodwjVWDQzEAGXx6WAQJskvo2ivGqnpR0P2JO/R9q55jV8FjFmlqw66JmOqM0wee6ZIo24RhHQF2ZSzSPlESVo9pr5NQb2bgDsXEop9wZKxsQ68rJrwbgXztI3gTJ0SZwHQM1sF6gd9QYfsUZ9BQ98DHliogUfEdHU3YNyhrpmd/zbwyCcJHVJaZJLa6BzCVSoNiW+qw7x3iHBEXC5QMYiOOOnqUtAN+7hfcNYCjp5epyp7toWKruYrVJ1YuMMkvtxwUkyUwJ2KyLu8FDh5T1Dx10fjXJkFPb6W+Z4V4IVblQbp2k9I9NtSpmd6uO1avg3o9hJji0SmJmY6pT3R8wNdBo2fA4yeLSyz3i9XfAPP8nBNWQxQNea0T3m0TAdk4lG0Fqh9AenuzqBhbd2G/PID5umb4i/VkbClki5lafB0EVRYg8ADXb0v6I/7UFLP6lGgoROZEHzzYvCfFjEytTGjaHB7xsWdCO0bg+ZuZL74PfDyCiccoCNLgHdOdts/cT7w+6nKyFULdephyyJS+utAGL1C3RRi1mXwcGv9+EJuich75ADQ4FLXxHrOBOZt0eYozzZwazDUgQ4zTNELe6WByd2J+rX4Vnjs7CKevQl8+vugVVVicopNuXZr3YrF3Hq9ri1A889wAXrqE9BZL+lQRJtiHNeaNGAEYdwEdVPWf/NtMPeXoENiEC2YYp6h6idNPlTo7ALU9Q3QZxUqGo4X0wRrWuLipUBCJUXAtDKiLk2/FzixKS+vAvd6C7SuOhFM5ot6LvJGp2agRee6AL24EDjxWWtiSqu0DsTVzNcINx+3wwbGBpHXvRwUNda/RDIi1SMENOVIouP3dm240xTGikpTF9YxrPHiKrzUzh2QcVR6qT/wi5IG0xqetxF4ainjo83gJVuVZnFpEVGfEsZp7Ym6109tlFt4/yug7E3WAm6rhiLkNqBUeZwGsLQxaOXQvFhoEeiYJ7SUKNNKAqS+IQN82IwYU3pGPuYo8VNBrv4lNOVky8CrRxMNyGPQT58Cr9iqMnw3J83DYUwP0Oju9cFZXcU87B3g9ZUaXVOUV6KesFcc3w644zCi9vXZx7f/Exg517hQqyM2HdEhgQKoOAUqH+62YeYycNlDCeaY6F05LqsY0WEUes9cBC+8WzFH2KLcqAYoLoxPO56ob1vXxFrfB2yuTpxLBsvKrQNtmsBbcK5iUXLhLzYDA//KvLpK8yx5q9EtCTQ0WARu24i8545h9NzL7aQEfD97hnnxlngEw3phyyRCCFYA/SEPoKVA2YMKwByDdNVRL2r7ewr9R+8mii5iMu5TMcjWYMQFRqBpp4L6uCYWtbodqMiY0QP7QNMGEyDQbUeDLunhgrNqK7jPk6BVlSYlM+GAio3EoQhkWuCthimw92oEzD2dqNRlEj/+OXDO2+peZQCq7qxGPVTbDYOYykfmAbQEXDYxFvhcEuzo0ASKCu57hTkcBDJJot3qsSWtQW+dCeqTFyiWjAdtEQYZZ6WiHpV/aedVmIK3/Aqg2K3LRKc/C/xlgQHNMM0kJPoBAo/1gLZPKtgABnQEvXaK29HKWvA+D6q4R//wqr5jiy46mlYMGuXeN2spc797TTYvIyFJb6jTbAJNpajg9gXMURcFkM2mExcLRfHWeaA+HV0mlIwGV2zXQqz+aCky6S2orDPotaHuPf9YDe45QQcCelBU14MUojrP0zVDLwZKRZkKexN9zxrCOLzUFdyTXgBeXKS0SCmipC9xm5iouIBR/kf3npmLQWX32vKIycmUFSU01fuUwsIb14KzJZotyrxUuUEPyKn8CPTmMFAfNxeLWl8GbN0epxm2hKHDZwKuGgS6+lcuQNe8BL5tmnTWWLqngTIjZFqPGvpMXIGOyOmSXsDtA93Ojn8HPGamlXZFahP06RJt80Kg/Io8E1sMlN2jMnodnQuLEpUC1SZvI4WF11QTRWntvbLapMyFsUebOgLUp7Pb2TYXARV6pCBOWGxMJABNGgY6pad7z5E3APO/dEBRA8xadwyLDGgxqzRocT53UBuiDy5xn/vC58CpEtMk9VXjpWopzdOg8qtcgD5eDXS71VQKlFaZ8keSQUGGovQojRyJmhuApLwZi3YEmno5qPf+bqNKz1EA6TBda77SZqsuL18DlB3o3tP5EmBNuQHIdtqySLYmV1OgeYpp2uua83KuZRPQmrHuc2ctBR31iP6llNGYoopJmam4EbD56noAcbdbjUlZ5iSLZ/IMjykqukSCK5A1L7tVoElGH4HeGAP0/rnTKOx9GlAhgaKFx/0Yf7ke6N/d7ch+FwBrNiumxFqjfJaqemsGsZo7ZkzNgCSfK0b5oBZNQWvG5QG0BNz/Icn2VJXb1HZVQKU8W3GaaPMYt4GKQbdpz2kGALT+JBeJfIrOrwaFaZCUPyRYVCF6bGYKpNfGAb1dNmCf44GtJpJ2+GN+qAevBE492v2+ASOBOZ/Fg9fatPTcDs0SyyI9rUGdS4AnQOJnpaCPrnYBem4+cObTxqHmHICuzoGpuAjYdG0DJnaH0SChmsR/2iT1w+VWqqGo8RlfAdmWYmJae8TMEnmNAug24MiubqP2HQDats08K2H+VpKuvBAYMcQF6Jr7gbufywNDs0aNusUMEsYYkBzwZEpUP9DdZ7ptuWUaaPSrZuTOhg6qg3qUubgItOm6enEQyiaakQY7zyg/saR1xE1O+oQR/hcJgxQwZmvdvhcBL90NHHGw26if9wNt3WrTLld/BK9+RwBP3JNH6wXAL8/VAEWJNQZBgyLgkEyRUCAZdhnAaOa1QI993bacMBF4/TMTCkjK7Rlz8/RMtOZFRJuud++ZuQRU9kDCpHSAaKoR2lSBhcTNBr4BRAMVMF6YWCPAl+MIeP4BoNch7hccfBiwbasJaaTqYbTXjuz4Pmjuu0CzZi5I5/8B/OYsUJgAKPSBSFY9d0TrkGxlUo05J8e/6gl69jL3eVJXbjsSqKxLCLoOC7SuEVHzIsbGcXlx0FLgFw+o2Nu64WTSYwB6lbhZvzvhh8MVOH4IFlD8CKSOIw3Q5EeBnnkpw+HdgG0VuYAs+fW2DjT2JuCk37odWrse/JvfAWs2KEAo9MFmq0ASsGQVkNRcNLPfphXw1k1AO3cwkB+aAVwy2dEvNZIHj4RHMr9NAzS+AYAkFxPZsbFYXMFSbY6Ae4lb9roQQThRg5MF+RHYC0FyLOB4EWjSU8Chh7kM6n8AsNVUFJPD7DFpCSjtAHpmOlCYNwy8dClw3hBg7QZw6IEMMJz19X7WAqXnuqLVT4DXbgU6u/kgMrXgw0YDX2wwumaB1YKvo28BqBHjqxvrAUS/eEiP7UoNXYmymKSOVMyY78XEpd17sp99XwHiZ7VZCXOseQlY9zwJ9FIl2njh33QF1n+ZqGrnZfM2vzrrMtAFV7kskqP1a4FbxoHfmgoISMKkMFBbYZACKwyAsj7A7SOBtj+p/4wbnwfG/cV4wTy9sl5RxoabCUA35+di4LKHtSCYa1kmGSvXp6sIAPeSvYA777cNfphGoM0sBseCdNPjoD7HugCduT+wwbwF4EzUMO0wuRa8FHDLy6CD+tTvoJz54nPw1FdAH/wveM0GUC2D23YE/fwA4PhBwEFugBo/5L3PgePGAjUSq+nZjznt0gIvHSeZdrFPS9CivODyzf8Djp0kzGPNNrnHU0NTJhWqJNTuqVO6Azu8wn44CDGD8kC69glQnxNdgC7qBqz4LKFBFpgkzUxovUcJcPPboNL9GgZpV88uXQ0eMBK0bpsGx0w71wAZs4wB84B9WoEWxWOB6tv4pc+Ak56WMWPROYKacWknGKooepqHPx6tATq09aXsh3cpgAJjXoo9sjLwh4dA/c92ARp1GLBkXm7kSMet+po430jc0qwlMOJJ0IFH7Soc7vXvfgScdz2wVoOjAdGrmmCcL+5yfGA70Ad5Zv7ER4xzX1BeUmYfkPacagKynoVJo3yMvF0DdHhxO07xcm1iokMizop5ej3vNtBx/+0CdMNA4FMzW0RPU02MEZpL45Fq81lqxwSD40aBjhsFyP6uLNksMPFR4NZHgAwBdSkglLc8BJSU7pRsLUAWLAHw8M6gv41y2//gXNCwl1UooN43sqGFed/IY7QnjNTDPrJEA9Iz4If9YlAUQGa0+OSrQKflUfS+wcB7TydEWntkU7lwt8mmSbDarDVw7CjQ4WcDjYq/HqbKCvCM14FHHwItXgOuSYFqCoCaIAdSJABpBhGnDJMMu8Qr/qYX6MkL3O+5aQZHY6ZpD8aBMTHLSG+2h8uUaMYA8a9TgxmYpDppmaO9H9D7d6Bh7oRQfvlG4K/X6s/V9aZalUjSVYs0R3ONs95NtkEa6HgE0KEH0Go/oElLfem2TcD6lcBnc4F57wNVIVCbAmoDIJMCMgWgmhRQXQDUFgDZAIgKjMlpgDRQItw7rrv8eNDYPA29cAro0Y/UFHYFrphZpCY1y5SUIQFGukPP3A8Btwi+gofiHECm8z/tCbpmtvsLfD4dPGGgBicJqgUsMTgRA2XLvRYze2xHm5JTf2RQQuIhAUXWugAQUGTNBKBMAThToECSfdQJQGJiObPTJhcAL1wGOiYvlzzyXqa5q02I4GjZuhVc2dFOpHKDp9OCa3cI+dh6AAUB6J5yVzfCLPjK1kDdlgTjzBwFyyIBIjdjxi0aKXASk8LsuyimqKnHDgDUeXkAWaAKQNWaTYpJ2ws1m0SXkAJHKc2i5s1BS+8H0nLeLJk6RG2uBW2LmJRppsQTkscpjiLvOh+j6k9/UT/qCSjmZv4y+OSySGAc9iLogLwS6lvXA3+7wQCkRV3HWnla5GiQOUgOHqiSjEnmHIAYUEzaUcIVFonuqK1hkgCTSYGqC3Mg1RSCs5ZJBcCwX4NuyasqTP8CfMyD6tUb7QlTJCB5HJQjQgfCFRW2yW50KSCd513OnndzbDrWZHqcDjrzCdfMqreA7+sKVK7SwCT1x7p9VUq2dccEONbM7FBU3sw6M/qkcuh4tSApgESPhD1GkwSk7YZJNYXa5Nq0BmbdAezlTpHh858CnvxIa5UCSRiUIkSp4X50hfOKQn2AhiDNRf4n8NHJMTUxs9HLgabuPEWsngv+8y+BbGXO1BwGmRkxJsOJC7P5DKo/B8GYmDE1YZEk7LV+QosEHGGQMbUqw6SqNEBNgck3Av26ue59XQXQZQy4Wop12ryI5aWtYIkX8gH0TZM41Q/73ziKPX9a7Lat++5xLuhEoWbesvZ94PUzwJXLNUhJgBxfmXefgCJLkkXJOQh6DNNlUR0BNRakQJuWeDYRa9mvKgCa7Q3cOg7o5YKj+jZiMnjiOyDWoq4AQgFTXaqMMKbe24n1GGS7wKP8+9nHUNVZ66VSAeisN4F2feuDVFcJfHgjsGgSkFlvCmlmAkPe6LK6OenR8s3MztWM9ciwRxgkJidbMTHl0QQc4/L9FqDjLgBOOxto2sBY/t8/Bwbdrj2iAqcAJIIepib64fhvP5FctX8I0mjrzWefusR6JEDt0Rb0u1lAM3ekNUYszAAb3gdvmgdULARtXw0OK0F1VeCspAcy7mYia9nWVQFRNjexLV+LgmJtalaLKA1wGvCaAF4xkG4D7NkJ1KkXsH8PwN/JjLUVG8DH3ACsqAAUe+yaWriidmO3Dpi0a68iKJBuwL7M3sfw0YQkGjfhAorbgU6aDjTdCUj1+fXjnlm5Dvj11eAlFUBYCLCsCqBKQror1dy66y+zxKY2HgM48F6lFAUcMNSLqBKgNisF9XsCaN2Auf24cLjfPu9j4OJxgMxdrCkC1xaZqLswS+wPopqJ3/11qBikO/zBCHhSzCCJd8SMRZD3uxB0wBigKM+7/dggbf4KePB/gClTgQoJC9IanJpGQF0aFKaGUOax7/9CXQzSRO9S9nGXsMeyyHo5ThWCSo8H9j4D+Ek/IGjyo8DDdRng87+D3nkZPO0N0LYAENdfKe4/DQhAmUZAbXo4bX12972SGYP0OAazRw+TT4HkgTo4NGURM1+c/QDU/CCgaRegqD0QNAcKWgJeAPgGOAFQvU2ftySrtvl5mwh5bZUW87oMuKYSkHXreqB8FbBmEbB0ASDTBVTAWACS9EPcfmUakNioriiL7YXn07qp38gc27KduvmdUYAnYwCnaAr51EQPfpp5Qfnxj3Ht6gsS5aKdgiLXWHdvh8gdd29cvcrP9Mq1spU0RNw+qSRWu/yUBkjAEZAEoMqCSlQXnEKL5/xwr4XHTPor9oVHr8KDDgHMaG/iH2u4daJ4aNo8YWeAJaPrpLtP5mcCiAFIgaSiawkeAWR8DdJ2ExcZgKiyYCEqg0E079Mf/h8LxCA9hjT28u6EzzqYNKt6WyPJT5tiJKuODdEzOfKoX+OKZ9DFmb2NhfJBEvYIUFJpVCwS5gTaxCpTE1HhjaCZy7/Tv87ZZROrJxtvoS8HeJhAnWKg4ovyJkvE5y2FEoxSu7lRqXiKYdLMYoCMaVkm1QIsIImpVQuLxMRSi6mqcCg9vr7eW4S74kG+N0AqoJyBNDxcuKN/YwEqzlFIzxnM4bUTYBpqhdUjycWsiSUBkn0xLWViRo+UDtEWyqRuxrrqCTQJ34k1SQB3C0Cx2X2I5qjBcBCGgqnEzlt0pvnm/3y2BdZMLZ6OUBuQbB5mgXJEGluiWtzlhdFddAXies6usKVBy/++D2jofsWoNGRQ/nwwjnSnHjdwR0MFNguQyu7zM/pE0lqLmcjyJKzCZBqrMrbduuxWBjUI1hy0B+FkRBgIhgzw56LIxFBarF/Jcq1TXYxByqCOp6EO01CDF+kM/Of9k7edxlAzECCN7mAcgghddrzAJ9muiLuM/Yh2pc0oiWiHzDRfhzqsQoSFCLEQtfgYczDvh2DKztr8/1RirO1+Y73qAAAAAElFTkSuQmCC"/>
                        <img className='h-about-share-btn' onClick={()=>{
                            window.open("https://www.tiktok.com/@netshortdramas","_blank")
                        }} alt='tiktok' src="data:image/png;base64,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"/>
                    </div>
                    <div className='h-about-share-me'>
                        NetShort | All Rights Reserved | 2024 NETSTORY PTE. LTD.
                    </div>
                </div>
            </div>
        </div>
    </>
}