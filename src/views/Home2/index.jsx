import "./style.less"
import {getText,Text} from "@/utils/i18";
import {useEffect, useState} from "react";
import {delay, getCurrencySignal, useHashQueryParams} from "@/utils";
import {apiAuth, apiFinance, apiVideo} from "@/api";
import {Toast} from "react-vant";
import Uid from "@/views/Common/Uid";
import ReactLoading from "react-loading";
import {useMediaQuery} from "react-responsive";
import {useNavigate} from "react-router-dom";

let watchRecordTimeout;
let playNo;
let logined;
export default function (){
    const params = useHashQueryParams()
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
            <div className='h-header' style={{maxWidth: '500px'}}>
                <div className='h-h-icon'>
                    <img src={require("@/assets/logo.png")} alt='logo'/>
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
                <div className='h-h-login'>
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
            <div className='h-h-show'>
                <div id='J_prismPlayer' />
            </div>
            <div className='h-h-no'>
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
                    <img className='h-h-d-poster' src={drama.poster} alt='poster'/>
                    <div className='h-h-d-desc'>
                        <div className='h-h-d-desc-title'>
                            {drama?.name}
                        </div>
                        <div className='h-h-d-desc-desc'>
                            {drama?.desc}
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
                <svg t="1754272200874" onClick={()=>{
                    navigate("/activity")
                }} className="h-btn-bar-icon gift" viewBox="0 0 1024 1024" version="1.1"
                     xmlns="http://www.w3.org/2000/svg" p-id="7196" width="200" height="200">
                    <path
                        d="M541.582222 473.315556v-195.697778c-9.102222 0-20.48-2.275556-27.306666-2.275556h-2.275556c-11.377778 2.275556-22.755556 2.275556-38.684444 4.551111v193.422223H72.817778V318.577778c0-25.031111 20.48-43.235556 43.235555-43.235556h182.044445C250.311111 263.964444 213.902222 243.484444 211.626667 204.8c-2.275556-45.511111 50.062222-120.604444 125.155555-102.4 77.368889 18.204444 131.982222 77.368889 172.942222 129.706667 40.96-52.337778 102.4-120.604444 182.044445-131.982223C762.311111 91.022222 816.924444 159.288889 810.097778 204.8c-6.826667 38.684444-43.235556 61.44-91.022222 70.542222h179.768888c25.031111 0 43.235556 20.48 43.235556 43.235556v154.737778H541.582222zM345.884444 143.36c-36.408889-13.653333-59.164444 2.275556-75.093333 27.306667-9.102222 13.653333-18.204444 34.133333-4.551111 47.786666 36.408889 36.408889 134.257778 34.133333 202.524444 27.306667-31.857778-38.684444-70.542222-81.92-122.88-102.4z m409.6 75.093333c25.031111-34.133333-25.031111-102.4-79.644444-77.368889-52.337778 25.031111-88.746667 63.715556-122.88 104.675556 27.306667 2.275556 56.888889 2.275556 84.195556 2.275556 36.408889-2.275556 100.124444-4.551111 118.328888-29.582223zM475.591111 939.804444H150.186667c-22.755556 0-40.96-18.204444-40.96-40.96V505.173333h366.364444v434.631111z m430.08-40.96c0 22.755556-18.204444 40.96-40.96 40.96H539.306667v-432.355555h366.364444v391.395555z m0 0"
                        fill="#cdcdcd" p-id="7197"></path>
                </svg>
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
        </div>
    </>
}