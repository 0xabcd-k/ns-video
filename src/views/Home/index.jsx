import "./style.less"
import {delay, getCurrencySignal, useHashQueryParams} from "@/utils";
import {useEffect, useState} from "react";
import {apiAuth, apiFinance, apiVideo} from "@/api";
import { useMediaQuery } from 'react-responsive';
import ReactLoading from "react-loading";
import Aliplayer from "aliyun-aliplayer";
import {useNavigate} from "react-router-dom";
import {Toast} from "react-vant";
import ss from "good-storage";
import InfiniteScroll from "react-infinite-scroll-component";
import {getText,Text} from "@/utils/i18";
import Recommend from "@/views/Home/Recommend";
import Uid from "@/views/Common/Uid";

let watchRecordTimeout;
let playNo;
let logined;
export default function (){
    const params = useHashQueryParams();
    const isMobile = useMediaQuery({ maxWidth: 767 });
    const [loading,setLoading] = useState(false)
    const [drama,setDrama] = useState(null);

    const [uid,setUid] = useState(null)
    const [isReadAll,setIsReadAll] = useState(null)

    const [player,setPlayer] = useState(null);
    const [playingVideoNo,setPlayingVideoNo] = useState(null);
    const navigate = useNavigate();
    const [email,setEmail] = useState("");
    const [emailInput,setEmailInput] = useState("");
    const [codeInput,setCodeInput] = useState("");
    const [recording,setRecording] = useState(false);
    const [showHistory,setShowHistory] = useState(false);
    const [history,setHistory] = useState([]);
    const [nextId,setNextId] = useState("");
    const [hasMore,setHasMore] = useState(true);

    const [login,setLogin] = useState(null)
    const [purchase,setPurchaseState] = useState(null);
    const [gift,setGift] = useState(null)
    const [giftCode,setGiftCode] = useState(null)

    const [recommendModal,setRecommendModal] = useState(null);
    const [detailModel,setDetailModal] = useState(null)
    const [recommendsList,setRecommendsList] = useState([])
    const [shareModel,setShareModel] = useState(null)
    const [liveAgentModel,setLiveAgentModel] = useState(null)
    const [liveAgentComment,setLiveAgentComment] = useState("")

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
    async function updateHistory(){
        const resp = await apiVideo.listHistory({
            page_size:8,
            pre_idx: nextId
        })
        if(resp.success){
            setHistory([history,...resp.data.list]);
            if(resp.data.list.length>0){
                setHistory([...history,...resp.data.list]);
                setNextId(resp.data.next_idx)
                if(resp.data.list.length<8){
                    setHasMore(false);
                }
            }
        }else{
            if(resp.err_code===7){
                setHasMore(false);
            }
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
            await updateHistory()
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
            const recommendsResp = await apiVideo.dramaList({
                series: Number(dramaResp.data.series_id),
                lan: navigator.language,
            })
            if(recommendsResp.success){
                setRecommendsList(recommendsResp.data.list)
            }
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
        setPlayingVideoNo(no)
        const resp = await apiVideo.video({
            drama_idx: params.drama,
            video_no: no
        })
        if (resp.success) {
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
                setDetailModal(null)
                setPurchase(true)
            }
        }
        setLoading(false)
    }
    function getPayments(){
        const payments = {
            CARD: (<svg t="1749267876715" onClick={() => {
                buyDrama("CARD")
        }} className="icon" viewBox="0 0 1378 1024" version="1.1"
             xmlns="http://www.w3.org/2000/svg" p-id="1898" width="200" height="200">
            <path
                d="M1307.175385 0H71.286154C32.059077 0 0 32.098462 0 71.286154v186.131692h1378.461538V71.246769C1378.461538 32.098462 1346.363077 0 1307.175385 0zM0 921.206154c0 39.187692 32.098462 71.286154 71.286154 71.286154h1235.889231c39.187692 0 71.286154-32.098462 71.286153-71.286154V384.787692H0V921.206154z m895.409231-101.021539l45.174154-173.410461a16.935385 16.935385 0 0 1 16.265846-12.603077h272.029538c11.027692 0.157538 19.180308 10.594462 16.265846 21.346461l-45.016615 173.252924a16.935385 16.935385 0 0 1-16.265846 12.603076h-272.147692a16.817231 16.817231 0 0 1-16.305231-21.188923z m-507.588923-300.110769a23.630769 23.630769 0 0 1 23.630769-23.670154h44.544a23.630769 23.630769 0 0 1 23.630769 23.63077V582.892308a23.630769 23.630769 0 0 1-23.630769 23.670154h-44.504615a23.630769 23.630769 0 0 1-23.670154-23.63077v-62.857846z m-147.140923 0a23.630769 23.630769 0 0 1 23.630769-23.670154h44.544a23.630769 23.630769 0 0 1 23.630769 23.63077V582.892308a23.630769 23.630769 0 0 1-23.630769 23.670154h-44.504616a23.630769 23.630769 0 0 1-23.670153-23.63077v-62.857846z m-146.983385 0a23.630769 23.630769 0 0 1 23.630769-23.670154H161.870769a23.630769 23.630769 0 0 1 23.630769 23.63077V582.892308a23.630769 23.630769 0 0 1-23.630769 23.670154H117.366154a23.630769 23.630769 0 0 1-23.670154-23.63077v-62.857846z"
                p-id="1899" fill="#2c2c2c"></path>
        </svg>),
            GOOGLE: (<svg t="1749267908906" onClick={() => {
                buyDrama("GOOGLEPAY")
            }} className="icon" viewBox="0 0 1024 1024" version="1.1"
                 xmlns="http://www.w3.org/2000/svg" p-id="2774" width="200" height="200">
                <path
                    d="M652.8 550.4c-8 6.4-11.2 12.8-11.2 20.8s3.2 14.4 9.6 19.2c6.4 4.8 14.4 8 22.4 8 12.8 0 24-4.8 32-14.4 9.6-9.6 14.4-20.8 14.4-32-9.6-8-22.4-11.2-38.4-11.2-9.6 1.6-20.8 4.8-28.8 9.6zM542.4 417.6h-49.6v80h49.6c11.2 0 20.8-4.8 28.8-11.2 16-16 14.4-41.6-1.6-57.6-6.4-6.4-17.6-11.2-27.2-11.2z"
                    p-id="2775" fill="#2c2c2c"></path>
                <path
                    d="M1024 265.6V256c0-6.4 0-12.8-1.6-19.2-1.6-6.4-3.2-12.8-6.4-17.6-3.2-6.4-6.4-11.2-11.2-16-4.8-4.8-9.6-8-16-11.2-6.4-3.2-11.2-4.8-17.6-6.4-6.4-1.6-12.8-1.6-19.2-1.6H70.4c-6.4 0-12.8 0-19.2 1.6-6.4 1.6-12.8 3.2-17.6 6.4-6.4 3.2-11.2 6.4-16 11.2-4.8 4.8-8 9.6-11.2 16-3.2 6.4-4.8 11.2-6.4 17.6V769.6c0 6.4 0 12.8 1.6 19.2 1.6 6.4 3.2 12.8 6.4 17.6 3.2 6.4 6.4 11.2 11.2 16 4.8 4.8 9.6 8 16 11.2 6.4 3.2 11.2 4.8 17.6 6.4 6.4 1.6 12.8 1.6 19.2 1.6h881.6c6.4 0 12.8 0 19.2-1.6 6.4-1.6 12.8-3.2 17.6-6.4 6.4-3.2 11.2-6.4 16-11.2 4.8-4.8 8-9.6 11.2-16 3.2-6.4 4.8-11.2 6.4-17.6V768v-9.6V276.8v-11.2zM336 604.8c-20.8 20.8-51.2 32-86.4 32-49.6 0-94.4-28.8-116.8-72-19.2-36.8-19.2-81.6 0-118.4 22.4-44.8 67.2-73.6 116.8-73.6 32 0 64 11.2 88 33.6l-36.8 38.4c-12.8-12.8-32-20.8-49.6-19.2-33.6 0-62.4 24-73.6 54.4-4.8 16-4.8 33.6 0 51.2 9.6 32 38.4 54.4 73.6 54.4 17.6 0 32-4.8 44.8-12.8 14.4-9.6 22.4-24 25.6-40h-70.4V480h123.2c1.6 9.6 1.6 17.6 1.6 27.2-1.6 40-14.4 73.6-40 97.6z m256-97.6c-12.8 12.8-30.4 19.2-49.6 19.2h-48v92.8H464V390.4h76.8c19.2 0 36.8 6.4 49.6 20.8 27.2 25.6 28.8 67.2 3.2 94.4 0 0-1.6 0-1.6 1.6z m156.8 113.6h-27.2v-22.4H720c-12.8 17.6-28.8 27.2-48 27.2-17.6 0-32-4.8-43.2-16-11.2-9.6-17.6-24-17.6-38.4 0-16 6.4-28.8 17.6-38.4 12.8-9.6 28.8-14.4 48-14.4 17.6 0 32 3.2 43.2 9.6v-6.4c0-9.6-4.8-19.2-11.2-25.6-8-6.4-17.6-11.2-28.8-11.2-16 0-28.8 6.4-38.4 20.8l-25.6-16c14.4-20.8 35.2-30.4 62.4-30.4 20.8 0 38.4 6.4 51.2 17.6 12.8 11.2 19.2 27.2 19.2 48v96z m62.4 68.8h-30.4l36.8-80-64-147.2h32L832 576l44.8-113.6h32l-97.6 227.2z"
                    p-id="2776" fill="#2c2c2c"></path>
            </svg>),
            APPLEPAY: (<svg t="1749267950666" onClick={() => {
                buyDrama("APPLEPAY")
            }} className="icon" viewBox="0 0 1152 1024" version="1.1"
                 xmlns="http://www.w3.org/2000/svg" p-id="3666" width="200" height="200">
                <path
                    d="M604.4 436.8c0 34.4-21 54.2-58 54.2h-48.6v-108.4h48.8c36.8 0 57.8 19.6 57.8 54.2z m95 125.2c0 16.6 14.4 27.4 37 27.4 28.8 0 50.4-18.2 50.4-43.8v-15.4l-47 3c-26.6 1.8-40.4 11.6-40.4 28.8zM1152 158v704c0 53-43 96-96 96H96c-53 0-96-43-96-96V158c0-53 43-96 96-96h960c53 0 96 43 96 96zM255.6 394.4c16.8 1.4 33.6-8.4 44.2-20.8 10.4-12.8 17.2-30 15.4-47.4-14.8 0.6-33.2 9.8-43.8 22.6-9.6 11-17.8 28.8-15.8 45.6z m121.2 149c-0.4-0.4-39.2-15.2-39.6-60-0.4-37.4 30.6-55.4 32-56.4-17.6-26-44.8-28.8-54.2-29.4-24.4-1.4-45.2 13.8-56.8 13.8-11.8 0-29.4-13.2-48.6-12.8-25 0.4-48.4 14.6-61 37.2-26.2 45.2-6.8 112 18.6 148.8 12.4 18.2 27.4 38.2 47 37.4 18.6-0.8 26-12 48.4-12 22.6 0 29 12 48.6 11.8 20.4-0.4 33-18.2 45.6-36.4 13.8-20.8 19.6-40.8 20-42z m270.8-106.8c0-53.2-37-89.6-89.8-89.6h-102.4v272.8h42.4v-93.2h58.6c53.6 0 91.2-36.8 91.2-90z m180 47.4c0-39.4-31.6-64.8-80-64.8-45 0-78.2 25.8-79.4 61h38.2c3.2-16.8 18.8-27.8 40-27.8 26 0 40.4 12 40.4 34.4v15l-52.8 3.2c-49.2 3-75.8 23.2-75.8 58.2 0 35.4 27.4 58.8 66.8 58.8 26.6 0 51.2-13.4 62.4-34.8h0.8V620h39.2v-136zM1032 421.8h-43l-49.8 161.2h-0.8l-49.8-161.2H844l71.8 198.6-3.8 12c-6.4 20.4-17 28.4-35.8 28.4-3.4 0-9.8-0.4-12.4-0.6v32.8c2.4 0.8 13 1 16.2 1 41.4 0 60.8-15.8 77.8-63.6L1032 421.8z"
                    p-id="3667" fill="#2c2c2c"></path>
            </svg>),
            JKOPAY: (<svg t="1749267972362" onClick={() => {
                buyDrama("JKOPAY")
            }} className="icon" viewBox="0 0 1024 1024" version="1.1"
                 xmlns="http://www.w3.org/2000/svg" p-id="2693" width="200" height="200">
                <path
                    d="M832 0a192 192 0 0 1 192 192v640a192 192 0 0 1-192 192H192a192 192 0 0 1-192-192V192a192 192 0 0 1 192-192h640zM354.496 388.352c-11.52-12.992-28.8-16.384-38.848-7.552 0 0-53.568 72.576-83.2 98.56-29.696 26.112-97.664 70.464-97.664 70.464-9.984 8.832-8.832 26.496 2.624 39.488l13.824 15.68c11.456 12.992 21.76 14.848 38.848 7.552 9.024-3.84 25.024-12.16 44.544-24.704v267.456c0 16 12.032 28.928 26.88 28.928h23.424c14.848 0 26.88-12.928 26.88-28.928V524.8c32.704-33.984 53.12-68.032 59.136-81.408 7.04-15.808 8.832-26.432-2.624-39.424z m174.976-191.488h-19.264l-5.248 0.448a28.992 28.992 0 0 0-23.68 28.544v62.656l-0.512 3.968a17.472 17.472 0 0 1-17.024 13.44h-55.168l-5.248 0.448a28.928 28.928 0 0 0-23.808 28.48v19.2l0.448 5.248c2.496 13.44 14.336 23.68 28.608 23.68h55.168l4.032 0.448c7.68 1.792 13.44 8.704 13.44 16.96v36.608l-0.448 4.032a17.472 17.472 0 0 1-17.024 13.44h-55.168l-5.248 0.448a28.928 28.928 0 0 0-23.808 28.416v19.264l0.448 5.184c2.496 13.44 14.336 23.68 28.608 23.68h55.168l4.032 0.512c7.68 1.792 13.44 8.704 13.44 16.96v33.024l-0.448 3.968a17.472 17.472 0 0 1-17.024 13.44h-55.168l-5.248 0.512a28.928 28.928 0 0 0-23.808 28.416v19.2l0.448 5.248c2.496 13.44 14.336 23.68 28.608 23.68h55.168l4.032 0.448c7.68 1.792 13.44 8.704 13.44 16.96v64.256l-0.448 4.032a17.472 17.472 0 0 1-13.44 13.056c-48.32 10.24-96.768 19.84-96.768 19.84a30.464 30.464 0 0 0-21.568 37.312l5.12 19.968 1.536 5.12c4.928 12.672 14.976 17.28 35.2 17.472 22.656 0.128 54.4-3.584 126.848-22.08a409.28 409.28 0 0 0 133.888-60.8l6.08-4.352c13.12-9.792 19.2-18.56 15.488-33.024l-5.12-19.968-1.792-5.248a30.336 30.336 0 0 0-34.88-17.28s-21.12 10.432-48.256 22.656a17.472 17.472 0 0 1-24.704-15.936v-24.96l0.448-4.032a17.472 17.472 0 0 1 17.024-13.44h52.864l5.184-0.448a28.928 28.928 0 0 0 23.808-28.416v-19.264l-0.448-5.184a28.992 28.992 0 0 0-28.544-23.68h-52.864l-3.968-0.512a17.472 17.472 0 0 1-13.504-16.96v-33.024l0.448-3.968a17.472 17.472 0 0 1 17.024-13.44h52.864l0.384-0.064 1.152-0.256 0.704 0.128a3.008 3.008 0 0 0 0.832 0.192h65.28l4.096 0.448a17.792 17.792 0 0 1 13.76 17.28v306.048l0.448 5.184a27.52 27.52 0 0 0 26.368 23.744h23.488l4.8-0.448a28.48 28.48 0 0 0 22.016-28.48V549.248l0.512-4.032a17.792 17.792 0 0 1 17.28-13.696h84.416l5.184-0.512a28.928 28.928 0 0 0 23.808-28.416v-19.2l-0.448-5.248a28.992 28.992 0 0 0-28.544-23.68H631.36l-0.768 0.256c-0.64 0-0.832 0-1.472-0.192h-53.248l-3.968-0.512a17.472 17.472 0 0 1-13.504-17.024v-36.608l0.448-3.968a17.472 17.472 0 0 1 17.024-13.44h52.864l5.184-0.512a28.928 28.928 0 0 0 23.808-28.416v-19.2l-0.448-5.248a28.992 28.992 0 0 0-28.544-23.68h-52.864l-3.968-0.448a17.472 17.472 0 0 1-13.504-16.96v-62.656l-0.448-5.184a28.928 28.928 0 0 0-28.48-23.808z m-174.272 7.552c-11.264-12.8-28.352-16.256-38.08-7.68 0 0-51.904 70.848-80.832 96.128-28.864 25.344-95.04 68.48-95.04 68.48-9.728 8.512-8.512 25.856 2.752 38.656l13.632 15.424c11.328 12.8 21.44 14.72 38.08 7.68 16.64-7.04 56.576-28.16 100.352-66.88 43.328-38.4 68.8-82.24 75.52-97.728 6.848-15.424 8.512-25.856-2.752-38.656z m395.456-11.776h-1.152c-43.392 2.368-71.744 42.944-64.512 87.872 7.168 44.16 59.328 135.872 59.328 135.872a9.856 9.856 0 0 0 9.28 5.76 9.856 9.856 0 0 0 9.344-5.76s52.16-91.776 59.328-135.872c7.232-44.928-21.12-85.504-64.512-87.872-0.768 0-1.536 0-2.304 0.128l-1.856 0.064-1.792-0.064c-0.768-0.128-1.536-0.192-2.368-0.128z m2.944 39.616a33.088 33.088 0 1 1 0.064 66.112 33.088 33.088 0 0 1 0-66.112z"
                    fill="#2c2c2c" p-id="2694"></path>
            </svg>),
            MORE: (<svg t="1749461822218" onClick={() => {
                buyDrama("")
            }} className="icon" viewBox="0 0 1024 1024" version="1.1"
                 xmlns="http://www.w3.org/2000/svg" p-id="3836" width="200" height="200">
                <path
                    d="M512 1024C229.230592 1024 0 794.769408 0 512S229.230592 0 512 0s512 229.230592 512 512-229.230592 512-512 512zM255.234048 574.787584c34.95936 0 63.29856-28.3392 63.29856-63.29856 0-34.958336-28.340224-63.297536-63.29856-63.297536-34.958336 0-63.297536 28.3392-63.297536 63.297536 0 34.95936 28.3392 63.29856 63.297536 63.29856z m256.256 0c34.958336 0 63.297536-28.3392 63.297536-63.29856 0-34.958336-28.3392-63.297536-63.29856-63.297536-34.958336 0-63.297536 28.3392-63.297536 63.297536 0 34.95936 28.3392 63.29856 63.297536 63.29856z m257.275904 0c34.958336 0 63.297536-28.3392 63.297536-63.29856 0-34.958336-28.3392-63.297536-63.297536-63.297536-34.95936 0-63.29856 28.3392-63.29856 63.297536 0 34.95936 28.340224 63.29856 63.29856 63.29856z"
                    fill="#2c2c2c" p-id="3837"></path>
            </svg>)
        }
        switch (drama.currency){
        case "TWD":
            return [payments.CARD,payments.GOOGLE,payments.APPLEPAY,payments.JKOPAY,payments.MORE]
        default:
            return [payments.CARD,payments.GOOGLE,payments.APPLEPAY,payments.MORE]
        }
    }
    async function buyDrama(payment){
        if(drama.purchase){
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
    function parseTime(timestamp){
        const t = new Date(timestamp*1000)
        console.log(t)
        return t.toLocaleString()
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
        {recommendModal && <>
            <Recommend onClose={()=>{
                setRecommendModal(null)
            }} isMobile={isMobile} series={recommendModal.series}  setLoading={setLoading}/>
        </>}
        {detailModel && <>
            <div className='mask' onClick={()=>{
                setDetailModal(null)
            }}></div>
            <svg t="1751007437661" className="m-h-d-close" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3474" width="200" height="200">
                <path
                    d="M511.021898 12.759124c-275.912409 0-498.175182 222.262774-498.175182 498.175182s222.262774 498.175182 498.175182 498.175182 498.175182-222.262774 498.175182-498.175182S786.934307 12.759124 511.021898 12.759124zM511.021898 914.583942c-222.262774 0-403.649635-181.386861-403.649635-403.649635s181.386861-403.649635 403.649635-403.649635 403.649635 181.386861 403.649635 403.649635S733.284672 914.583942 511.021898 914.583942zM697.518248 367.868613c0-10.218978-5.109489-22.992701-12.773723-30.656934-7.664234-7.664234-20.437956-12.773723-30.656934-12.773723-12.773723 0-25.547445 2.554745-35.766423 12.773723l-107.29927 107.29927-107.29927-107.29927c-10.218978-10.218978-22.992701-12.773723-35.766423-12.773723-10.218978 0-22.992701 5.109489-30.656934 12.773723-7.664234 7.664234-12.773723 20.437956-12.773723 30.656934 0 12.773723 2.554745 25.547445 12.773723 35.766423l107.29927 107.29927-107.29927 107.29927c-10.218978 10.218978-12.773723 22.992701-12.773723 35.766423 0 10.218978 5.109489 22.992701 12.773723 30.656934 7.664234 7.664234 20.437956 12.773723 30.656934 12.773723 12.773723 0 25.547445-2.554745 35.766423-12.773723l107.29927-107.29927 107.29927 107.29927c10.218978 10.218978 22.992701 12.773723 35.766423 12.773723 10.218978 0 22.992701-5.109489 30.656934-12.773723 7.664234-7.664234 12.773723-20.437956 12.773723-30.656934 0-12.773723-2.554745-25.547445-12.773723-35.766423l-107.29927-107.29927 107.29927-107.29927C694.963504 393.416058 697.518248 380.642336 697.518248 367.868613z"
                    p-id="3475" fill="#ffffff"></path>
            </svg>
            {drama && <div className='m-h-detail'>
                <div className='m-h-d-info'>
                    <img src={drama.poster} alt='poster'/>
                    <div className='m-h-d-info-content'>
                        <div className='m-h-d-info-c-title'>
                            {drama.name}
                        </div>
                        <div className='m-h-d-info-c-desc'>
                            {drama.desc}
                        </div>
                    </div>
                </div>
                <div className='m-h-d-video-box'>
                    {Array.from({length: drama.pay_num}).map((item, index) => {
                        if (index + 1 === playingVideoNo) {
                            return <div className='m-h-d-video-box-item playing' onClick={async () => {
                                setDetailModal(null)
                                await play(index+1)
                            }}>
                                <span>{index + 1}</span>
                            </div>
                        } else {
                            return <div className='m-h-d-video-box-item free' onClick={async () => {
                                setDetailModal(null)
                                await play(index+1)
                            }}>
                                <span>{index + 1}</span>
                            </div>
                        }
                    })}
                    {Array.from({length: drama.video_num - drama.pay_num}).map((item, index) => {
                        if (index + drama.pay_num + 1 === playingVideoNo) {
                            return <div className='m-h-d-video-box-item playing' onClick={async () => {
                                setDetailModal(null)
                                await play(index + drama.pay_num + 1)
                            }}>
                                <span>{index + drama.pay_num + 1}</span>
                            </div>
                        } else {
                            return <div className='m-h-d-video-box-item pay' onClick={async () => {
                                setDetailModal(null)
                                await play(index + drama.pay_num + 1)
                            }}>
                                <span>{index + drama.pay_num + 1}</span>
                            </div>
                        }
                    })}
                </div>
                <div className='m-h-d-title'>{getText(Text.Recommend)}</div>
                <div className='m-h-d-item-box'>
                    {recommendsList && recommendsList.map((item, index) => {
                        return <div className='m-h-d-item' onClick={() => {
                            navigate(`/?drama=${item.idx}`)
                            window.location.reload()
                        }}>
                            <div className='m-h-d-i-tip'>
                                {getText(Text.CompleteSeries)}
                            </div>
                            <img className='m-h-d-i-poster' src={item.poster} alt='poster'/>
                            <div className='m-h-d-i-name'>{item.name}</div>
                        </div>
                    })}
                </div>
            </div>}
        </>}
        {drama && (isMobile ? <>
            <div className='m-home'>
                <div className='mh-agent' onClick={()=>{
                    setLiveAgentModel(true)
                }}>
                    <svg t="1749717877636" className="icon" viewBox="0 0 1024 1024" version="1.1"
                         xmlns="http://www.w3.org/2000/svg" p-id="3891" width="200" height="200">
                        <path
                            d="M515.84 510.5664m-445.4912 0a445.4912 445.4912 0 1 0 890.9824 0 445.4912 445.4912 0 1 0-890.9824 0Z"
                            fill="#F5F3FF" p-id="3892"></path>
                        <path
                            d="M522.24 410.9312m-146.0736 0a146.0736 146.0736 0 1 0 292.1472 0 146.0736 146.0736 0 1 0-292.1472 0Z"
                            fill="#8574FA" p-id="3893"></path>
                        <path
                            d="M323.2256 508.672c6.656 0 12.032-5.376 12.032-12.032V409.3952c0.8704-102.656 84.5824-185.856 187.392-185.856 96.9728 0 176.9472 74.0352 186.4704 168.4992V496.64c0 6.656 5.376 12.032 12.032 12.032h7.7824c1.1264 0 2.304-0.1536 3.3792-0.4608 26.5216-7.7824 45.8752-32.2048 45.8752-61.2352 0-19.7632-9.0112-37.4784-23.1424-49.2032-6.8096-122.3168-108.4928-219.7504-232.448-219.7504-123.7504 0-225.2288 97.024-232.3968 218.9824-14.6944 11.7248-24.1152 29.696-24.1152 49.92 0 29.0304 19.4048 53.4528 45.8752 61.2352 1.0752 0.3072 2.2528 0.4608 3.3792 0.4608h7.8848z"
                            fill="#8574FA" p-id="3894"></path>
                        <path
                            d="M783.36 748.3392c-13.056-84.7872-67.1232-156.0064-141.2608-192.8704a190.3104 190.3104 0 0 1-119.8592 42.2912c-45.4144 0-87.04-15.872-119.8592-42.2912-74.1376 36.864-128.2048 108.0832-141.2608 192.8704-3.2256 20.9408 12.8 39.8336 33.9968 39.8336h454.2976c21.1456 0 37.1712-18.944 33.9456-39.8336z m-170.8544-16.5888H431.9232c-12.544 0-22.7328-10.1888-22.7328-22.7328s10.1888-22.7328 22.7328-22.7328h180.5312c12.544 0 22.7328 10.1888 22.7328 22.7328s-10.1376 22.7328-22.6816 22.7328z"
                            fill="#7666F8" p-id="3895"></path>
                        <path
                            d="M522.24 597.7088c-45.4144 0-87.04-15.872-119.8592-42.2912-66.4064 33.024-116.5824 93.6448-135.7824 166.8096 14.2848 4.608 28.928 8.5504 43.9808 11.6224a404.5312 404.5312 0 0 0 171.8784-2.0992h-50.4832c-12.544 0-22.7328-10.1888-22.7328-22.7328s10.1888-22.7328 22.7328-22.7328h164.864c39.8848-23.3984 75.776-53.4528 105.728-89.1392-18.0224-16.5888-38.3488-30.72-60.4672-41.7792-32.8192 26.4704-74.496 42.3424-119.8592 42.3424z"
                            fill="#8574FA" p-id="3896"></path>
                        <path
                            d="M426.0352 571.6992c-8.2944-4.864-16.2304-10.2912-23.7056-16.2816a259.3792 259.3792 0 0 0-54.272 36.2496c26.7264-4.4032 52.7872-11.1104 77.9776-19.968zM665.344 381.696C651.776 315.0336 592.8448 264.9088 522.24 264.9088c-80.64 0-146.0736 65.3824-146.0736 146.0736 0 65.1264 42.5984 120.2176 101.4784 139.1104 76.0832-37.5296 141.5168-95.5392 187.6992-168.3968z"
                            fill="#9E8BFE" p-id="3897"></path>
                        <path
                            d="M522.7008 178.0736c-123.7504 0-225.2288 97.024-232.3968 218.9824-14.6944 11.7248-24.1152 29.696-24.1152 49.92 0 29.0304 19.4048 53.4528 45.8752 61.2352 1.0752 0.3072 2.2528 0.4608 3.3792 0.4608h7.7824c6.656 0 12.032-5.376 12.032-12.032V409.3952c0.8704-102.656 84.5824-185.856 187.392-185.856 75.2128 0 140.1856 44.544 169.984 108.5952 8.1408-17.2032 15.3088-35.072 21.3504-53.5552-42.0352-60.672-112.0768-100.5056-191.2832-100.5056z"
                            fill="#9E8BFE" p-id="3898"></path>
                        <path
                            d="M376.1664 410.6752a463.58016 463.58016 0 0 0 181.504-141.4144 147.3536 147.3536 0 0 0-35.4816-4.352c-80.5376 0-145.8688 65.2288-146.0224 145.7664z"
                            fill="#AE9BFF" p-id="3899"></path>
                        <path
                            d="M522.7008 178.0736c-123.7504 0-225.2288 97.024-232.3968 218.9824a63.75936 63.75936 0 0 0-23.8592 45.8752 459.4688 459.4688 0 0 0 68.864-16.7424v-16.8448c0.8704-102.656 84.5824-185.856 187.392-185.856 20.992 0 41.216 3.4816 60.0576 9.8816 8.1408-12.9024 15.6672-26.2656 22.528-40.0896a231.6544 231.6544 0 0 0-82.5856-15.2064z"
                            fill="#AE9BFF" p-id="3900"></path>
                    </svg>
                </div>
                {shareModel && <>
                    <div className='mh-share'>
                        <img className='mh-share-close' src={require("@/assets/close.png")} alt='close' onClick={()=>{
                            setShareModel(null)
                        }}/>
                        <div className='mh-share-title'>{getText(Text.ShareTitle)}</div>
                        <div className='mh-share-box'>
                            <svg onClick={()=>{
                                window.open(`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(window.location.href)}`,"_blank")
                            }} t="1751620092025" className="icon" viewBox="0 0 1107 1024" version="1.1"
                                 xmlns="http://www.w3.org/2000/svg" p-id="3800" width="200" height="200">
                                <path
                                    d="M553.967 0C248.01 0 0 195.231 0 436.04c0 223.685 214.083 407.92 489.757 433.017a33.708 33.708 0 0 1 22.512 14.705c12.237 20.145 3.542 63.069-5.96 111.197s42.169 23.149 53.6 17.576c9.1-4.415 243.31-136.444 382.742-265.921 101.963-79.1 165.25-189.02 165.25-310.558C1107.934 195.231 859.908 0 553.967 0zM369.311 550.157a29.545 29.545 0 0 1-29.78 29.276H238.257c-17.878 0-41.698-6.178-41.698-35.135v-216.55a29.528 29.528 0 0 1 29.78-29.277h5.959a29.528 29.528 0 0 1 29.78 29.276v187.275h77.438a29.545 29.545 0 0 1 29.796 29.276v5.859z m83.482-5.825a29.746 29.746 0 0 1-59.493 0V333.958a29.746 29.746 0 0 1 59.493 0v210.374z m262.01 0a32.92 32.92 0 0 1-29.78 29.276 33.708 33.708 0 0 1-35.102-16.787l-95.954-134.58v122.057a29.78 29.78 0 0 1-59.543 0V333.589a29.511 29.511 0 0 1 29.763-29.26 37.67 37.67 0 0 1 33.759 21.437c9.232 13.631 97.364 136.511 97.364 136.511V333.59a29.797 29.797 0 0 1 59.576 0v210.709z m178.696-134.614a29.276 29.276 0 1 1 0 58.552H816.06v46.819h77.438a29.276 29.276 0 1 1 0 58.536H777.35a26.557 26.557 0 0 1-26.859-26.322V330.702a26.557 26.557 0 0 1 26.86-26.339h116.148a29.276 29.276 0 1 1 0 58.536H816.06v46.835h77.438z"
                                    fill="#00C300" p-id="3801"></path>
                            </svg>
                            <svg onClick={()=>{
                                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`,"_blank")
                            }} t="1751620265748" className="icon" viewBox="0 0 1024 1024" version="1.1"
                                 xmlns="http://www.w3.org/2000/svg" p-id="2730" width="200" height="200">
                                <path
                                    d="M512 0C229.05 0 0 229.05 0 512s229.05 512 512 512 512-229 512-512S795 0 512 0z m137.4 509.31h-88.89V830h-132V509.31h-67.42V398.85h67.38v-67.38c0-88.89 37.73-142.8 142.8-142.8h88.89v110.47h-53.91c-40.4 0-43.09 16.18-43.09 43.09v53.91h99.68l-13.47 113.18z"
                                    p-id="2731" fill="#405c9c"></path>
                            </svg>
                            <svg onClick={()=>{
                                window.open(`https://t.me/share/url?url=${encodeURIComponent(window.location.href)}`,"_blank")
                            }} t="1751618514941" className="icon" viewBox="0 0 1024 1024" version="1.1"
                                 xmlns="http://www.w3.org/2000/svg" p-id="2321" width="200" height="200">
                                <path
                                    d="M679.424 746.862l84.005-395.996c7.424-34.852-12.581-48.567-35.438-40.009L234.277 501.138c-33.72 13.13-33.134 32-5.706 40.558l126.282 39.424 293.156-184.576c13.714-9.143 26.295-3.986 16.018 5.157L426.898 615.973l-9.143 130.304c13.13 0 18.871-5.706 25.71-12.581l61.696-59.429 128 94.282c23.442 13.129 40.01 6.29 46.3-21.724zM1024 512c0 282.843-229.157 512-512 512S0 794.843 0 512 229.157 0 512 0s512 229.157 512 512z"
                                    fill="#1296DB" p-id="2322"></path>
                            </svg>
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
                        </div>
                    </div>
                </>}
                {purchase && <>
                    <div className='mh-p-mask' onClick={() => {
                        window.location.href = window.location.origin + `/#/?drama=${params.drama}`
                        setPurchase(null)
                    }}></div>
                    <div className='mh-purchase'>
                        <div className='mh-p-title'>
                            {getText(Text.PaymentChoice)}
                        </div>
                        <div className='mh-p-description'>
                            {getText(Text.PriceDesc)} {drama.amount} {getCurrencySignal(drama.currency)}
                            <br/>
                            {getText(Text.RechargeTip)}
                        </div>
                        <div className='mh-p-icon-box'>
                            {getPayments().map((payment) => {
                                return payment
                            })}
                        </div>
                        <div className='mh-p-icon-gift'>
                            {gift ? <>
                                <div className='mh-p-icon-gift-input-box'>
                                    <input onChange={(e) => {
                                        setGiftCode(e.target.value)
                                    }} value={giftCode} placeholder={getText(Text.RedeemTip)}/>
                                    <div className='mh-p-icon-gift-input-box-btn' onClick={async ()=>{
                                        setLoading(true)
                                        const resp = await apiVideo.dramaRedeem({
                                            cdk: giftCode,
                                            drama_idx: params.drama
                                        })
                                        if(resp.success) {
                                            Toast.info(getText(Text.RedeemSuccess))
                                            setGift(null)
                                            setGiftCode('')
                                            setPurchase(null)
                                        }else {
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
                            </>:<>
                            {drama.no_redeem?<>
                            {getText(Text.NoRedeem)}
                            </>:<>
                                <div className='mh-p-icon-gift-box'>
                                    <svg t="1751363820224" onClick={()=>{
                                        setGift(true)
                                    }} className="icon" viewBox="0 0 1024 1024" version="1.1"
                                         xmlns="http://www.w3.org/2000/svg" p-id="8067" width="200" height="200">
                                        <path
                                            d="M592.789333 308.288c-11.349333 5.354667-57.216 38.442667-51.882666 49.813333 5.525333 11.392 60.053333-8.426667 71.424-13.802666 11.370667-5.354667 16.213333-17.856 10.752-29.226667-5.397333-11.370667-18.944-12.138667-30.293334-6.784zM424.682667 268.181333c-11.882667 7.658667-14.698667 22.485333-7.04 34.325334 7.68 11.904 48.298667 63.253333 60.16 55.573333 11.904-7.658667-12.373333-66.56-20.181334-78.421333-7.637333-11.882667-21.056-19.136-32.938666-11.477334z"
                                            p-id="8068" fill="#2c2c2c"></path>
                                        <path
                                            d="M512 21.333333C241.002667 21.333333 21.333333 240.981333 21.333333 512c0 270.954667 219.669333 490.666667 490.666667 490.666667 270.976 0 490.666667-219.712 490.666667-490.666667C1002.666667 240.981333 782.976 21.333333 512 21.333333z m-38.4 744.874667h-179.2V510.250667h179.2v255.957333z m0-281.642667h-204.778667v-76.778666H473.6v76.778666z m32.042667-83.413333c-23.872 15.338667-97.194667-56.064-112.384-79.829333-18.026667-28.117333-8.192-64.64 15.552-79.978667 23.765333-15.338667 60.565333-8.042667 75.904 15.701333 15.338667 23.808 44.608 128.768 20.928 144.106667z m12.8-2.048c-17.365333-18.133333 29.632-102.698667 47.786666-120.064 18.133333-17.365333 51.328-16.106667 68.714667 2.048s18.282667 51.733333-2.944 72.277333c-18.133333 17.408-96.192 63.893333-113.557333 45.738667z m211.008 367.104H550.4V510.250667h179.072v255.957333z m25.685333-281.642667H550.4v-76.778666h204.757333v76.778666z"
                                            p-id="8069" fill="#2c2c2c"></path>
                                    </svg>
                                    <div className='mh-p-icon-gift-tip'>
                                        {getText(Text.RechargeReportTip)}
                                    </div>
                                </div>
                            </>}
                            </>}
                        </div>
                    </div>
                </>}
                {liveAgentModel && <>
                    <div className='mh-review'>
                        <img className='mh-review-close' src={require("@/assets/close.png")} alt='close' onClick={()=>{
                            setLiveAgentModel(null)
                        }}/>
                        <div className='mh-review-title'>{getText(Text.ReviewTitle)}</div>
                        <textarea className='mh-review-comment' onChange={(e) => {setLiveAgentComment(e.target.value)}} value={liveAgentComment} placeholder="..."/>
                        <div className='mh-reiview-btn-box'>
                            <div className='mh-review-agent' onClick={goAgent}>
                                {getText(Text.LiveAgent)}
                            </div>
                            <div className='mh-review-submit' onClick={async ()=>{
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
                            }}>
                                {getText(Text.Submit)}
                            </div>
                        </div>
                    </div>
                </>}
                <>
                    <div className='m-h-h-history' onClick={() => {
                        navigate("/history");
                    }}>
                        <svg t="1748934937683" className="icon" viewBox="0 0 1024 1024" version="1.1"
                             xmlns="http://www.w3.org/2000/svg" p-id="2656" width="88" height="88">
                            <path
                                d="M511.215 62.066c-247.841 0-448.76 200.919-448.76 448.766 0 247.841 200.919 448.76 448.76 448.76 247.847 0 448.766-200.919 448.766-448.76 0-247.847-200.919-448.766-448.766-448.766zM734.022 733.632c-5.145 5.145-11.888 7.718-18.625 7.718-6.743 0-13.486-2.573-18.63-7.718l-211.887-211.893v-267.967c0-14.558 11.803-26.348 26.342-26.348 14.545 0 26.348 11.791 26.348 26.348v246.152l196.452 196.452c10.289 10.278 10.289 26.971 0 37.256z"
                                p-id="2657" fill="#f5315e"></path>
                        </svg>
                    </div>
                    <div className='m-h-h-recommend' onClick={() => {
                        setDetailModal(true)
                    }}>
                        <svg t="1750992948188" className="icon" viewBox="0 0 1024 1024" version="1.1"
                             xmlns="http://www.w3.org/2000/svg" p-id="5742" width="200" height="200">
                            <path
                                d="M843 126v738L583.717 737.328c-22.067-11.015-49.65-16.522-71.717-16.522s-49.65 5.507-71.717 16.522L181 864V126h662zM622.833 396H402.167c-33.1 0-55.167-22-55.167-55s22.067-55 55.167-55h220.666c33.1 0 55.167 22 55.167 55s-22.067 55-55.167 55z m0 215H402.167c-33.1 0-55.167-22-55.167-55s22.067-55 55.167-55h220.666c33.1 0 55.167 22 55.167 55s-22.067 55-55.167 55zM842.75 16h-661.5C120.612 16 71 65.6 71 126.222V952.89C71 985.956 98.562 1008 126.125 1008c5.512 0 16.537 0 22.05-5.511l336.262-165.333c5.513-5.512 16.538-5.512 22.05-5.512 5.513 0 16.538 0 22.05 5.512L864.8 1002.489c16.538 5.511 27.563 5.511 33.075 5.511 27.562 0 55.125-22.044 55.125-55.111V126.222C953 65.6 903.388 16 842.75 16z"
                                fill="#d4237a" p-id="5743"></path>
                        </svg>
                    </div>
                    <div className='m-h-h-share' onClick={()=>{
                        setShareModel(true)
                    }}>
                        <svg t="1751617843920" className="icon" viewBox="0 0 1024 1024" version="1.1"
                             xmlns="http://www.w3.org/2000/svg" p-id="2326" width="200" height="200">
                            <path
                                d="M816 416a174.816 174.816 0 0 1-133.6-62.624l-219.616 104.672a222.944 222.944 0 0 1-1.216 174.656l173.696 89.984A179.84 179.84 0 1 1 611.2 784l-185.056-96a224 224 0 1 1 2.912-284.8l221.44-105.6A175.552 175.552 0 1 1 816 416z"
                                fill="#d4237a" p-id="2327"></path>
                        </svg>
                    </div>
                    <div className={isReadAll?'m-h-h-msg':'m-h-h-msg-notify'} onClick={() => {
                        navigate("/message");
                    }}>
                        <svg t="1752130498424" className="icon" viewBox="0 0 1024 1024" version="1.1"
                             xmlns="http://www.w3.org/2000/svg" p-id="5950" width="200" height="200">
                            <path
                                d="M785.066667 110.933333H221.866667c-14.933333 2.133333-27.733333 4.266667-40.533334 8.533334C102.4 145.066667 42.666667 219.733333 42.666667 309.333333v386.133334c0 44.8 36.266667 78.933333 78.933333 78.933333H480v102.4c0 19.2 14.933333 34.133333 34.133333 34.133333 19.2 0 34.133333-14.933333 34.133334-34.133333v-102.4h-68.266667v-34.133333c0-19.2 14.933333-34.133333 34.133333-34.133334s34.133333 14.933333 34.133334 34.133334v34.133333h354.133333c44.8 0 78.933333-36.266667 78.933333-78.933333V309.333333c2.133333-108.8-85.333333-198.4-196.266666-198.4zM371.2 695.466667c0 6.4-4.266667 12.8-12.8 12.8H121.6c-6.4 0-12.8-4.266667-12.8-12.8V309.333333v-12.8-2.133333c0-4.266667 0-6.4 2.133333-10.666667 0-2.133333 2.133333-4.266667 2.133334-8.533333 0-2.133333 0-2.133333 2.133333-4.266667 0-2.133333 2.133333-4.266667 2.133333-8.533333 0-2.133333 0-2.133333 2.133334-4.266667s2.133333-4.266667 4.266666-8.533333c0-2.133333 2.133333-2.133333 2.133334-4.266667 2.133333-4.266667 4.266667-6.4 6.4-10.666666 2.133333-4.266667 4.266667-6.4 6.4-10.666667l8.533333-8.533333C172.8 192 204.8 177.066667 241.066667 177.066667c72.533333 0 132.266667 59.733333 132.266666 132.266666v386.133334zM768 499.2c-19.2 0-34.133333-14.933333-34.133333-34.133333v-87.466667H554.666667c-19.2 0-34.133333-14.933333-34.133334-34.133333s14.933333-34.133333 34.133334-34.133334h213.333333c19.2 0 34.133333 14.933333 34.133333 34.133334v121.6c2.133333 19.2-12.8 34.133333-34.133333 34.133333z"
                                fill="#405c9c" p-id="5951"></path>
                            <path
                                d="M170.666667 430.933333c-19.2 0-34.133333 14.933333-34.133334 34.133334s14.933333 34.133333 34.133334 34.133333h138.666666c19.2 0 34.133333-14.933333 34.133334-34.133333s-14.933333-34.133333-34.133334-34.133334H170.666667z"
                                fill="#405c9c" p-id="5952"></path>
                        </svg>
                        <div className='dot' />
                    </div>
                    <div className='m-h-h-activity' onClick={()=>{
                        navigate("/activity");
                    }}>
                        <svg t="1752722437656" className="icon" viewBox="0 0 1024 1024" version="1.1"
                             xmlns="http://www.w3.org/2000/svg" p-id="14011" width="200" height="200">
                            <path
                                d="M184.67 540.84V354c0-29.72 24.1-53.82 53.82-53.82h556.52c29.72 0 53.82 24.1 53.82 53.82v515.49c0 29.72-24.1 53.82-53.82 53.82H237.54c-29.72 0-53.82-24.1-53.82-53.82v-187.8"
                                fill="#E2696C" p-id="14012"></path>
                            <path d="M168.07 461.64h672.94v78.25H168.07z" fill="#E2696C" opacity=".37" p-id="14013"></path>
                            <path d="M449.76 485.11h133.02V923.3H449.76z" fill="#FFC963" p-id="14014"></path>
                            <path
                                d="M795.01 938.95H221.89c-38.31 0-69.47-31.17-69.47-69.47v-187.8c0-8.64 7.01-15.65 15.65-15.65s15.65 7.01 15.65 15.65v187.8c0 21.05 17.12 38.17 38.17 38.17h573.12c21.04 0 38.17-17.12 38.17-38.17V354c0-21.05-17.12-38.17-38.17-38.17H222.84c-21.04 0-38.17 17.12-38.17 38.17v179.02c0 8.64-7.01 15.65-15.65 15.65s-15.65-7.01-15.65-15.65V354c0-38.31 31.16-69.47 69.47-69.47h572.17c38.31 0 69.47 31.17 69.47 69.47v515.49c0 38.3-31.16 69.46-69.47 69.46z"
                                fill="#5E125C" p-id="14015"></path>
                            <path d="M168.07 626.91v-39.12" fill="#E6EDEC" p-id="14016"></path>
                            <path
                                d="M168.07 642.56c-8.64 0-15.65-7.01-15.65-15.65v-39.12c0-8.64 7.01-15.65 15.65-15.65s15.65 7.01 15.65 15.65v39.12c0 8.64-7.01 15.65-15.65 15.65z"
                                fill="#5E125C" p-id="14017"></path>
                            <path
                                d="M887.95 468.51v-156.5c0-29.72-24.1-53.82-53.82-53.82H182.77c-29.72 0-53.82 24.1-53.82 53.82v156.5h759z"
                                fill="#E2696C" p-id="14018"></path>
                            <path
                                d="M820.7 271.04H196.2c-45.08 0-55.38 10.62-55.38 53.71v74.92c0-28.12 26.88-50.38 55.38-50.38h624.5c28.5 0 47.82 22.26 47.82 50.38v-74.92c0.01-41.78-6.65-53.71-47.82-53.71z"
                                fill="#FFFFFF" opacity=".5" p-id="14019"></path>
                            <path
                                d="M474.67 262.9l-179.52-81.07 60.98-72.31 150.11 110.49zM707.98 117.35c-11.86-16.11-38.67-19.68-54.77-7.82L520.7 212.39l34.41 46.74L759.3 179.3"
                                fill="#FFC963" p-id="14020"></path>
                            <path
                                d="M363.22 125.17c6.84 0 13.74 2.1 19.67 6.47l123.34 90.79-31.57 42.89-191.26-69.34 53.03-57.28c6.52-8.84 16.59-13.53 26.79-13.53m0.01-31.3c-19.76 0-38.58 9.18-50.76 24.64l-52.03 56.21-32.04 34.61 44.34 16.08L464 294.75l22 7.98 13.87-18.85 31.57-42.89L550 215.78l-25.21-18.55-123.34-90.79c-11.16-8.22-24.38-12.57-38.22-12.57z"
                                fill="#5E125C" p-id="14021"></path>
                            <path
                                d="M549.62 278.08l-50.57-68.7L643.61 97.16c11.29-8.32 26.03-11.75 40.74-9.72 14.73 2.06 27.8 9.42 35.94 20.23l64.85 78.32-235.52 92.09z m-7.27-62.68l18.25 24.79 172.83-67.58-38.05-45.99c-3.1-4.21-8.84-7.27-15.36-8.18-6.59-0.93-13.16 0.45-17.54 3.68L542.35 215.4z"
                                fill="#5E125C" p-id="14022"></path>
                            <path
                                d="M860.7 484.16H156.2c-23.66 0-42.91-19.25-42.91-42.91V312.02c0-38.31 31.16-69.47 69.47-69.47h651.37c38.31 0 69.47 31.17 69.47 69.47v129.24c0 23.65-19.24 42.9-42.9 42.9zM182.76 273.84c-21.04 0-38.17 17.12-38.17 38.17v129.24c0 6.4 5.2 11.61 11.61 11.61h704.5c6.4 0 11.61-5.21 11.61-11.61V312.02c0-21.05-17.12-38.17-38.17-38.17H182.76z"
                                fill="#5E125C" p-id="14023"></path>
                            <path d="M434.11 273.84h164.32v179.97H434.11z" fill="#FFCD7D" p-id="14024"></path>
                            <path d="M254.14 195.59h164.32v46.95H254.14zM614.08 195.59H778.4v46.95H614.08z" fill="#F5D781"
                                  p-id="14025"></path>
                            <path
                                d="M418.46 195.59v46.95H254.14v-17.65c0-16.18 13.12-29.3 29.3-29.3h135.02m31.3-31.3H283.44c-33.41 0-60.6 27.18-60.6 60.6v48.95H449.76V164.29zM749.11 195.59c16.18 0 29.3 13.12 29.3 29.3v17.65H614.08v-46.95h135.03m0-31.3H582.78v109.55H809.7v-48.95c0.01-33.41-27.18-60.6-60.59-60.6zM582.79 938.95H434.11V547.71c0-8.64 7.01-15.65 15.65-15.65s15.65 7.01 15.65 15.65v359.94h117.37c8.64 0 15.65 7.01 15.65 15.65 0.01 8.65-7 15.65-15.64 15.65z"
                                fill="#5E125C" p-id="14026"></path>
                            <path
                                d="M582.79 845.05c-8.64 0-15.65-7.01-15.65-15.65V485.11H449.76c-8.64 0-15.65-7.01-15.65-15.65s7.01-15.65 15.65-15.65h148.67V829.4c0.01 8.65-7 15.65-15.64 15.65z"
                                fill="#5E125C" p-id="14027"></path>
                            <path d="M621.91 485.11H410.64V242.54h211.27v242.57z m-179.97-31.3h148.67V273.84H441.94v179.97z"
                                  fill="#5E125C" p-id="14028"></path>
                            <path
                                d="M597.26 243.72H432.94V158.7c0-4.9 3.97-8.87 8.87-8.87h146.57c4.9 0 8.87 3.97 8.87 8.87v85.02z"
                                fill="#F5D781" p-id="14029"></path>
                            <path
                                d="M614.08 273.84H418.46v-47.93c0-46.92 38.18-85.09 85.1-85.09h25.43c46.92 0 85.1 38.17 85.1 85.09v47.93z m-164.32-31.3h133.02v-16.63c0-29.66-24.13-53.79-53.8-53.79h-25.43c-29.66 0-53.8 24.13-53.8 53.79v16.63z"
                                fill="#5E125C" p-id="14030"></path>
                            <path d="M449.76 485.11h117.37v54.77H449.76zM449.76 219.07h133.02v23.47H449.76z" fill="#F5D781"
                                  opacity=".5" p-id="14031"></path>
                            <path d="M254.14 219.07h164.32v23.47H254.14zM614.08 219.07H778.4v23.47H614.08z" fill="#FFC963"
                                  p-id="14032"></path>
                            <path
                                d="M579.01 857.91v62.6H445.99v-62.6h-281.7V876c0 34.77 31.97 60.16 66.74 60.16h547.02c34.77 0 59.18-25.39 59.18-60.16v-18.09H579.01z"
                                fill="#E2696C" opacity=".37" p-id="14033"></path>
                            <path d="M465.41 860.71h117.37v46.95H465.41z" fill="#F5D781" opacity=".5" p-id="14034"></path>
                        </svg>
                    </div>
                </>
                <div className='m-h-header'>
                    <div className='m-h-h-left'>
                        <img className='m-h-h-logo' src={require("@/assets/logo.png")} alt='logo'/>
                    </div>
                    <div className='m-h-h-mid' onClick={()=>{
                        navigate("/search")
                    }}>
                        <svg t="1753169119235" className="icon" viewBox="0 0 1024 1024" version="1.1"
                             xmlns="http://www.w3.org/2000/svg" p-id="2322" width="200" height="200">
                            <path
                                d="M475.3 856.9C266 856.9 95.7 686.7 95.7 477.4S266 97.9 475.3 97.9s379.5 170.2 379.5 379.5-170.3 379.5-379.5 379.5z m0-675.9c-163.4 0-296.4 133-296.4 296.4s133 296.4 296.4 296.4c163.4 0 296.4-132.9 296.4-296.4S638.7 181 475.3 181z"
                                fill="#ffffff" p-id="2323"></path>
                            <path
                                d="M475.3 696.1c-120.6 0-218.7-98.1-218.7-218.7 0-23 18.6-41.6 41.6-41.6s41.6 18.6 41.6 41.6c0 74.8 60.8 135.6 135.6 135.6 23 0 41.6 18.6 41.6 41.6-0.2 22.9-18.8 41.5-41.7 41.5zM885.6 919.7c-10.2 0-20.5-3.7-28.5-11.3L695.3 756.2c-16.7-15.7-17.5-42-1.8-58.8 15.8-16.7 42.1-17.5 58.8-1.8l161.9 152.2c16.7 15.7 17.5 42 1.8 58.8-8.3 8.7-19.3 13.1-30.4 13.1z"
                                fill="#ffffff" p-id="2324"></path>
                        </svg>
                    </div>
                    <div className='m-h-h-right'>
                        <div className='m-h-h-login' onClick={() => {
                            navigate(`/login?redirect=${encodeURIComponent(`https://player.netshort.online/#/?drama=${params.drama}`)}`)
                        }}>
                            {email ? <span>{email}</span> : <>
                                <svg t="1749537708692" className="icon" viewBox="0 0 1024 1024" version="1.1"
                                     xmlns="http://www.w3.org/2000/svg" p-id="2439" id="mx_n_1749537708693" width="200"
                                     height="200">
                                    <path
                                        d="M512 64C264.8 64 64 264.8 64 512s200.8 448 448 448 448-200.8 448-448S759.2 64 512 64z m32 704h-64v-64h64v64z m-64-128V256h64v384h-64z"
                                        p-id="2440" fill="#2c2c2c"></path>
                                </svg>
                                {getText(Text.Login)}
                            </>}
                        </div>
                    </div>
                </div>
                <div className='m-h-show'>
                    <div id='J_prismPlayer'/>
                </div>
                <div className='m-h-bottom'>
                    <div className='m-h-b-title' onClick={() => {
                        setDetailModal(true)
                    }}><span>{drama.name}</span></div>
                    <div className='m-h-b-btn-box'>
                        <div className='m-h-b-btn-box-left'>
                            <div className='m-h-b-btn-box-no'>
                                {getText(Text.VideoNo)} {playingVideoNo}
                            </div>
                        </div>
                        <div className='m-h-b-btn-box-right'>
                            <div className='m-h-b-btn-box-right-next' onClick={async () => {
                                await play(playingVideoNo + 1)
                            }}>{getText(Text.Next)}</div>
                        </div>
                    </div>
                </div>
            </div>
        </> : <>
            <div className='p-home'>
                <div className='ph-agent' onClick={goAgent}>
                    <svg t="1749717877636" className="icon" viewBox="0 0 1024 1024" version="1.1"
                         xmlns="http://www.w3.org/2000/svg" p-id="3891" width="200" height="200">
                        <path
                            d="M515.84 510.5664m-445.4912 0a445.4912 445.4912 0 1 0 890.9824 0 445.4912 445.4912 0 1 0-890.9824 0Z"
                            fill="#F5F3FF" p-id="3892"></path>
                        <path
                            d="M522.24 410.9312m-146.0736 0a146.0736 146.0736 0 1 0 292.1472 0 146.0736 146.0736 0 1 0-292.1472 0Z"
                            fill="#8574FA" p-id="3893"></path>
                        <path
                            d="M323.2256 508.672c6.656 0 12.032-5.376 12.032-12.032V409.3952c0.8704-102.656 84.5824-185.856 187.392-185.856 96.9728 0 176.9472 74.0352 186.4704 168.4992V496.64c0 6.656 5.376 12.032 12.032 12.032h7.7824c1.1264 0 2.304-0.1536 3.3792-0.4608 26.5216-7.7824 45.8752-32.2048 45.8752-61.2352 0-19.7632-9.0112-37.4784-23.1424-49.2032-6.8096-122.3168-108.4928-219.7504-232.448-219.7504-123.7504 0-225.2288 97.024-232.3968 218.9824-14.6944 11.7248-24.1152 29.696-24.1152 49.92 0 29.0304 19.4048 53.4528 45.8752 61.2352 1.0752 0.3072 2.2528 0.4608 3.3792 0.4608h7.8848z"
                            fill="#8574FA" p-id="3894"></path>
                        <path
                            d="M783.36 748.3392c-13.056-84.7872-67.1232-156.0064-141.2608-192.8704a190.3104 190.3104 0 0 1-119.8592 42.2912c-45.4144 0-87.04-15.872-119.8592-42.2912-74.1376 36.864-128.2048 108.0832-141.2608 192.8704-3.2256 20.9408 12.8 39.8336 33.9968 39.8336h454.2976c21.1456 0 37.1712-18.944 33.9456-39.8336z m-170.8544-16.5888H431.9232c-12.544 0-22.7328-10.1888-22.7328-22.7328s10.1888-22.7328 22.7328-22.7328h180.5312c12.544 0 22.7328 10.1888 22.7328 22.7328s-10.1376 22.7328-22.6816 22.7328z"
                            fill="#7666F8" p-id="3895"></path>
                        <path
                            d="M522.24 597.7088c-45.4144 0-87.04-15.872-119.8592-42.2912-66.4064 33.024-116.5824 93.6448-135.7824 166.8096 14.2848 4.608 28.928 8.5504 43.9808 11.6224a404.5312 404.5312 0 0 0 171.8784-2.0992h-50.4832c-12.544 0-22.7328-10.1888-22.7328-22.7328s10.1888-22.7328 22.7328-22.7328h164.864c39.8848-23.3984 75.776-53.4528 105.728-89.1392-18.0224-16.5888-38.3488-30.72-60.4672-41.7792-32.8192 26.4704-74.496 42.3424-119.8592 42.3424z"
                            fill="#8574FA" p-id="3896"></path>
                        <path
                            d="M426.0352 571.6992c-8.2944-4.864-16.2304-10.2912-23.7056-16.2816a259.3792 259.3792 0 0 0-54.272 36.2496c26.7264-4.4032 52.7872-11.1104 77.9776-19.968zM665.344 381.696C651.776 315.0336 592.8448 264.9088 522.24 264.9088c-80.64 0-146.0736 65.3824-146.0736 146.0736 0 65.1264 42.5984 120.2176 101.4784 139.1104 76.0832-37.5296 141.5168-95.5392 187.6992-168.3968z"
                            fill="#9E8BFE" p-id="3897"></path>
                        <path
                            d="M522.7008 178.0736c-123.7504 0-225.2288 97.024-232.3968 218.9824-14.6944 11.7248-24.1152 29.696-24.1152 49.92 0 29.0304 19.4048 53.4528 45.8752 61.2352 1.0752 0.3072 2.2528 0.4608 3.3792 0.4608h7.7824c6.656 0 12.032-5.376 12.032-12.032V409.3952c0.8704-102.656 84.5824-185.856 187.392-185.856 75.2128 0 140.1856 44.544 169.984 108.5952 8.1408-17.2032 15.3088-35.072 21.3504-53.5552-42.0352-60.672-112.0768-100.5056-191.2832-100.5056z"
                            fill="#9E8BFE" p-id="3898"></path>
                        <path
                            d="M376.1664 410.6752a463.58016 463.58016 0 0 0 181.504-141.4144 147.3536 147.3536 0 0 0-35.4816-4.352c-80.5376 0-145.8688 65.2288-146.0224 145.7664z"
                            fill="#AE9BFF" p-id="3899"></path>
                        <path
                            d="M522.7008 178.0736c-123.7504 0-225.2288 97.024-232.3968 218.9824a63.75936 63.75936 0 0 0-23.8592 45.8752 459.4688 459.4688 0 0 0 68.864-16.7424v-16.8448c0.8704-102.656 84.5824-185.856 187.392-185.856 20.992 0 41.216 3.4816 60.0576 9.8816 8.1408-12.9024 15.6672-26.2656 22.528-40.0896a231.6544 231.6544 0 0 0-82.5856-15.2064z"
                            fill="#AE9BFF" p-id="3900"></path>
                    </svg>
                    <div className='ph-agent-question-box'>
                        <div className='ph-agent-question'>
                            {getText(Text.QuestionPurchase)}
                        </div>
                        <div className='ph-agent-question'>
                            {getText(Text.QuestionSuggestion)}
                        </div>
                        <div className='ph-agent-question'>
                            {getText(Text.QuestionCollaboration)}
                        </div>
                    </div>
                </div>
                {purchase && <>
                    <div className='ph-p-mask' onClick={() => {
                        setPurchase(null)
                    }}></div>
                    <div className='ph-purchase'>
                        <div className='ph-p-title'>
                            {getText(Text.PaymentChoice)}<br/>
                        </div>
                        <div className='ph-p-description'>
                            {getText(Text.PriceDesc)} {drama.amount} {getCurrencySignal(drama.currency)}
                        </div>
                        <div className='ph-p-icon-box'>
                            {getPayments().map((payment) => {
                                return payment
                            })}
                        </div>
                    </div>
                </>}
                <div className='ph-header'>
                    <div className='ph-h-left'>
                        <img className='ph-h-logo' src={require("@/assets/logo.png")} alt='logo'/>
                        <div className='ph-h-home'>{getText(Text.Store)}</div>
                    </div>
                    <div className='ph-h-right'>
                        <div className='ph-h-history'>
                            <svg t="1748934937683" onClick={() => {
                                setShowHistory(true)
                            }} className="icon" viewBox="0 0 1024 1024" version="1.1"
                                 xmlns="http://www.w3.org/2000/svg" p-id="2656" width="88" height="88">
                                <path
                                    d="M511.215 62.066c-247.841 0-448.76 200.919-448.76 448.766 0 247.841 200.919 448.76 448.76 448.76 247.847 0 448.766-200.919 448.766-448.76 0-247.847-200.919-448.766-448.766-448.766zM734.022 733.632c-5.145 5.145-11.888 7.718-18.625 7.718-6.743 0-13.486-2.573-18.63-7.718l-211.887-211.893v-267.967c0-14.558 11.803-26.348 26.342-26.348 14.545 0 26.348 11.791 26.348 26.348v246.152l196.452 196.452c10.289 10.278 10.289 26.971 0 37.256z"
                                    p-id="2657" fill="#f5315e"></path>
                            </svg>
                            {showHistory && <>
                                <div className='ph-h-h-mask' onClick={() => {
                                    setShowHistory(false)
                                }}/>
                                <div className='ph-h-history-modal'>
                                    <div className='ph-h-history-modal-inner' id='ph-h-history-scroll'>
                                        <InfiniteScroll scrollableTarget="ph-h-history-scroll" next={updateHistory}
                                                        hasMore={hasMore} loader={
                                            <h4>{getText(Text.Loading)}</h4>
                                        } dataLength={history.length}
                                                        endMessage={<div className='ph-h-h-m-end'>No More</div>}>
                                            {history.map((item, index) => {
                                                return <>
                                                    <div className='ph-h-h-m-item' onClick={() => {
                                                        navigate(`/?drama=${item.idx}`);
                                                    }}>
                                                        <img className='ph-h-h-m-item-poster' src={item.poster}
                                                             alt='poster'/>
                                                        <div className='ph-h-h-m-item-info'>
                                                            <div className='ph-h-h-m-item-info-title'>
                                                                {item.name}
                                                            </div>
                                                            <div className='ph-h-h-m-item-info-content'>
                                                                {getText(Text.WatchUpToEpisode)} <span>{item.no}</span>
                                                            </div>
                                                            <div className='ph-h-h-m-item-info-time'>
                                                                {parseTime(item.watch_time)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </>
                                            })}
                                        </InfiniteScroll>
                                    </div>
                                </div>
                            </>}
                        </div>
                        <div className='ph-h-login'>
                            <span onClick={async () => {
                                setLoading(true)
                                setLogin(true)
                                setLoading(false)
                            }}>{email ? email : <>
                                <svg t="1749537708692" className="icon" viewBox="0 0 1024 1024" version="1.1"
                                     xmlns="http://www.w3.org/2000/svg" p-id="2439" id="mx_n_1749537708693" width="200"
                                     height="200">
                                    <path
                                        d="M512 64C264.8 64 64 264.8 64 512s200.8 448 448 448 448-200.8 448-448S759.2 64 512 64z m32 704h-64v-64h64v64z m-64-128V256h64v384h-64z"
                                        p-id="2440" fill="#2c2c2c"></path>
                                </svg>
                                {getText(Text.Login)}
                            </>}</span>
                            {login && <>
                                <div className='ph-h-login-modal-mask' onClick={() => {
                                    setLogin(false)
                                }}/>
                                <div className='ph-h-login-modal'>
                                    <div className='ph-h-lm-title'>
                                        {getText(Text.Login)}
                                    </div>
                                    <div className='ph-h-lm-desc'>
                                        {getText(Text.LoginEmailToast)}
                                    </div>
                                    <div className='ph-h-lm-email'>
                                        <input value={emailInput} onChange={(e) => {
                                            setEmailInput(e.target.value)
                                        }} placeholder={getText(Text.EmailInput)}/>
                                    </div>
                                    <div className='ph-h-lm-code'>
                                        <input value={codeInput} onChange={(e) => {
                                            setCodeInput(e.target.value)
                                        }} placeholder={getText(Text.CodeInput)}/>
                                        <div className='ph-h-lm-code-btn' onClick={async () => {
                                            setLoading(true)
                                            const resp = await apiAuth.emailCode({email: emailInput})
                                            if (resp.success) {
                                                Toast.info(getText(Text.EmailSuccess))
                                            } else {
                                                Toast.info(getText(Text.EmailFailure))
                                            }
                                            setLoading(false)
                                        }}>
                                            {getText(Text.GetCode)}
                                        </div>
                                    </div>
                                    <div className='ph-h-lm-confirm' onClick={async () => {
                                        setLoading(true)
                                        const authResp = await apiAuth.loginEmail({
                                            email: emailInput,
                                            code: codeInput,
                                        })
                                        if (authResp.success) {
                                            ss.set("Authorization", authResp.data.token)
                                            setEmail(emailInput)
                                        } else {
                                            if (authResp.err_code === 31003) {
                                                Toast.info(getText(Text.EmailCodeExpire))
                                            } else {
                                                Toast.info(getText(Text.LoginFail))
                                            }
                                        }
                                        setLogin(false)
                                        setLoading(false)
                                    }}>{getText(Text.Confirm)}</div>
                                </div>
                            </>}
                        </div>
                    </div>
                </div>
                <div className='ph-content'>
                    <div className='ph-c-playground'>
                        <img className='ph-c-poster' src={drama.poster} alt='poster'/>
                        <div id='J_prismPlayer' className='ph-c-video' style={player ? {} : {display: 'none'}}/>
                    </div>
                    <div className='ph-c-info'>
                        <div className='ph-c-i-name'>{drama.name}<span className="ph-c-i-n-more" onClick={() => {
                            setRecommendModal({series: drama.series_id})
                        }}>{getText(Text.More)}</span></div>
                        <div className='ph-c-i-desc'>{drama.desc}</div>
                        <div className='ph-c-i-btn-box'>
                            {drama.pay_num <= drama.video_num &&
                                <div className={'ph-c-i-btn-pay' + (drama.purchase ? " paid" : "")} onClick={() => {
                                    if (!drama.purchase) {
                                        setPurchase(true)
                                    }
                                }}>
                                    <svg t="1748600990112" viewBox="0 0 1024 1024" version="1.1"
                                         xmlns="http://www.w3.org/2000/svg" p-id="2342" width="88" height="88">
                                        <path
                                            d="M237.358431 284.464797l131.472334 375.310851-27.569916-19.554358L890.249275 640.22129c16.136515 0 29.212322 13.0799 29.212322 29.213345 0 16.129352-13.075807 29.205159-29.212322 29.205159L341.259826 698.639794c-12.409634 0-23.465434-7.836479-27.566846-19.549242L109.05016 94.8963l27.567869 19.553335L77.586564 114.449635c-16.129352 0-29.207206-13.074783-29.207206-29.212322 0-16.129352 13.077853-29.207206 29.207206-29.207206l59.032488 0c12.409634 0 23.466458 7.842619 27.566846 19.555381l52.728922 150.525272 710.724017 0c18.48705 0 32.326243 16.962324 28.612665 35.077913l-46.633087 227.389894c-2.547009 12.408611-12.796444 21.75549-25.382087 23.160489l-431.515944 48.065715c-16.036231 1.786693-30.482245-9.761318-32.266891-25.797549-1.783623-16.030092 9.764388-30.475082 25.798573-32.257681l410.798087-47.145763c0 0 20.75879-96.119151 35.926234-170.074513C893.311007 282.900162 362.038058 284.149619 237.358431 284.464797L237.358431 284.464797zM407.438061 818.372759c23.362081 0 42.36897 19.004843 42.36897 42.3659 0 23.360034-19.006889 42.364877-42.36897 42.364877-23.360034 0-42.363853-19.004843-42.363853-42.364877C365.073184 837.377602 384.078027 818.372759 407.438061 818.372759M407.438061 762.594385c-54.202483 0-98.142228 43.941791-98.142228 98.144274 0 54.207599 43.939745 98.143251 98.142228 98.143251s98.147344-43.936675 98.147344-98.143251C505.584382 806.536176 461.640544 762.594385 407.438061 762.594385L407.438061 762.594385zM816.372707 818.372759c23.357987 0 42.360783 19.004843 42.360783 42.3659 0 23.360034-19.002796 42.364877-42.360783 42.364877-23.360034 0-42.364877-19.004843-42.364877-42.364877C774.007831 837.377602 793.012673 818.372759 816.372707 818.372759M816.372707 762.594385c-54.206576 0-98.143251 43.941791-98.143251 98.144274 0 54.207599 43.937698 98.143251 98.143251 98.143251 54.200436 0 98.139158-43.936675 98.139158-98.143251C914.512888 806.536176 870.573143 762.594385 816.372707 762.594385L816.372707 762.594385zM816.372707 958.88191"
                                            fill="#ffffff" p-id="2343"></path>
                                    </svg>
                                    <span>{drama.purchase ? getText(Text.Purchased) : getText(Text.Purchase)}</span>
                                </div>}
                            <div className='ph-c-i-btn-play' onClick={async () => {
                                await play(drama.watch_no)
                            }}>
                                <img
                                    src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAAAXNSR0IArs4c6QAAAWRJREFUWEft2L0uBUEYxvH/kygULkBBKNyAe3ABCoULUCrodSLhUkSBxCkkVBqlC1DQ6RUUkpdJbLIRZ3dm5+PMSXaqLWZ3fvs+uzO7IypvqtzHCIxNaP4raGYrwDGwBSwAd8CRpNfY6vic31lBM1sDHoHlPxf7BE6BM0nuOFvrA14C2x2jvwAHkq5zCfuA78CSx+BXv9DksfcBzQPXdMkSe0pgA00aew5gA00Se06gg0bHnhsYHXsp4ODYSwODY58FsB37nqT7rqlslsDGtSvpfBqyBuAbsCrp6z9kDUDn2pT0NAID1u121+ojrvYleQb2Jd3WNs0Erc+l3+Ib4FCSq55XKwV0IPdrMPFStTrlBgbFWXoeDI6zFHBwnLmB0XEOAX78/KAvejzYSeIcArwAdjqASeMcAtwAHqrd+nB3ZGbrrc0j983mNo9OQiZbj0dkapf5336LufsU544VjK1i9RX8Bm7FuSnbLuzHAAAAAElFTkSuQmCC"
                                    alt='play-icon'/>
                                <span>{getText(Text.PlayNow)}</span>
                            </div>
                        </div>
                        <div className='ph-c-i-video'>
                            {Array.from({length: drama.pay_num}).map((item, index) => {
                                if (playingVideoNo === index + 1) {
                                    return <div className='ph-c-i-video-item playing' onClick={async () => {
                                        await play(index + 1)
                                    }}>
                                        <span>{index + 1}</span>
                                    </div>
                                } else {
                                    return <div className='ph-c-i-video-item free' onClick={async () => {
                                        await play(index + 1)
                                    }}>
                                        <span>{index + 1}</span>
                                    </div>
                                }
                            })}
                            {Array.from({length: drama.video_num - drama.pay_num}).map((item, index) => {
                                if (playingVideoNo === index + drama.pay_num + 1) {
                                    return <div className='ph-c-i-video-item playing' onClick={async () => {
                                        await play(index + drama.pay_num + 1)
                                    }}>
                                        <span>{index + drama.pay_num + 1}</span>
                                    </div>
                                } else {
                                    return <div className='ph-c-i-video-item pay' onClick={async () => {
                                        await play(index + drama.pay_num + 1)
                                    }}>
                                        <span>{index + drama.pay_num + 1}</span>
                                    </div>
                                }
                            })}
                        </div>
                    </div>
                </div>
                <div className='ph-bottom-1'>
                    <div className='ph-bottom-2'>
                        <div className='ph-b-list'>
                            <div className='ph-b-l-header'>
                                {getText(Text.About)}
                            </div>
                            <div className='ph-b-l-item' onClick={() => {
                                window.open("https://player.netshort.online/user_agreement.html", "_blank")
                            }}>
                                {getText(Text.TermsOfService)}
                            </div>
                            <div className='ph-b-l-item' onClick={() => {
                                window.open("https://player.netshort.online/privacy_policy.html", "_blank")
                            }}>
                                {getText(Text.PrivacyPolicy)}
                            </div>
                            <div className='ph-b-l-item' onClick={() => {
                                window.open("https://player.netshort.online/FAQ.html", "_blank")
                            }}>
                                {getText(Text.FAQ)}
                            </div>
                        </div>
                        <div className='ph-b-list'>
                            <div className='ph-b-l-header'>
                                {getText(Text.ContactUs)}
                            </div>
                            <div className='ph-b-l-item' onClick={() => {
                                window.location.href = "mailto:lichuanhz00670@maiyawx.com";
                            }}>
                                support@shortshore.com
                            </div>
                            <div className='ph-b-l-item' onClick={() => {
                                window.location.href = "mailto:lichuanhz00670@maiyawx.com";
                            }}>
                                business@shortstore.com
                            </div>
                        </div>
                        <div className='ph-b-list'>
                            <div className='ph-b-l-header'>
                                {getText(Text.Community)}
                            </div>
                            <div className='ph-b-l-icon-box'>
                                <div className='ph-b-l-icon-item' onClick={() => {
                                    // window.open("https://www.facebook.com/profile.php?id=61564956644828","_blank")
                                }}>
                                    <img className='ph-b-l-icon-item-hover'
                                         src="data:image/png;base64,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"/>
                                    <img className='ph-b-l-icon-item-normal'
                                         src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAMAAACdt4HsAAAAhFBMVEUAAAA6Ojo5OTlAQEA5OTkwMDA6Ojo5OTk5OTk6Ojo6Ojo5OTk4ODg5OTk5OTk5OTkgICA5OTk6Ojo4ODg4ODg6Ojo3Nzc6Ojo5OTk4ODg3Nzc1NTU3Nzc4ODg6Ojp0dHRFRUVpaWlBQUFPT09wcHBeXl5mZmZXV1c9PT1sbGxLS0tJSUk4tIo8AAAAHnRSTlMA940EthDv6eHNx62FeWdZCNvbf19TNycjIBwYPDsYUHBRAAAB0UlEQVRYw6XX2XKjMBAF0Cs5bGEL3pfMJTh4Seb//28KiplxbLUs0HmyH/qWBF1UNyS7MkuTSJEqTtJstccoaz3nnUr/gqMgr2gU54FL+SKkSOkD7GZFSKuomMFi88qnXrcQlYoO1FI6vqYjbbzG2wudvbwJ9R4JM6FeTLi/heZIGj8sOVqJG1vF0dTm5gFY+ufjcm7ruv06Xx466v9jKCi5nuq/Gt4rMDhElJxrS0AYPH0Dp9oWwAV6gRLvX9sDhiPklFz+Vbdte+ajHJ2YkmYoPx1pVnX17xS1Qz1Fa3sTDwf4bW/o6mnAB0VzYE+fAO6w8gsokfkFZEhp8v3ZGQIu/R9zTIpE6IAHnzRJELsEyC8zgnINuNJEgY4BLc2cAxohwPkKJwpXiGhy7A21393vK41iJH6NlCD1C0j9W7n0C1hh5xewB+Y+ARUA7ROgAax9Avrhs5oeEKOTTw/I0QnCqQEqQG8xNUADwxGmBUQHDIppAcXTEaf56j5FzZEDccTBZsqQtcWNkqMtfQdN71HXd9j2Hfe9Fw6zpdvKU0K0dVm6Nva1L6JVWMxgd9DKUr4InFbfmEZVHsDR++PyPddrjLJfZWkSK1JFSZqVOwj+AN7id+gXcsVLAAAAAElFTkSuQmCC"/>
                                </div>
                                <div className='ph-b-l-icon-item' onClick={() => {
                                    // window.open("https://www.youtube.com/@NetShort-app","_blank")
                                }}>
                                    <img className='ph-b-l-icon-item-hover'
                                         src="data:image/png;base64,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"/>
                                    <img className='ph-b-l-icon-item-normal'
                                         src="data:image/png;base64,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"/>
                                </div>
                                <div className='ph-b-l-icon-item' onClick={() => {
                                    // window.open("https://www.instagram.com/netshortdrama","_blank")
                                }}>
                                    <img className='ph-b-l-icon-item-hover'
                                         src="data:image/png;base64,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"/>
                                    <img className='ph-b-l-icon-item-normal'
                                         src="data:image/png;base64,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"/>
                                </div>
                                <div className='ph-b-l-icon-item' onClick={()=>{
                                    // window.open("https://www.tiktok.com/@netshortdramas","_blank")
                                }}>
                                    <img className='ph-b-l-icon-item-hover'
                                         src="data:image/png;base64,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"/>
                                    <img className='ph-b-l-icon-item-normal'
                                         src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAAXNSR0IArs4c6QAAB9BJREFUeF7lW11oFFcUPmc2ZqL4EzVqggYTY0zEBFdT2ZmNBR/70NKWVlqoUEsLCn1oCxUtFWqppUqF2oeCQguWttBSoUJ96KNQ3Jk1SqNNMcEUV6Ouij/xb/O793bPsCOzu7Mzs/Ozu6EHln2Ye88957vnnnvPueciBEySJLWEQqFIOp3uQkT6reCcr0DEegCoyw4/zjm/g4h3OOfDADCMiGfT6XQ8Ho9fC1JEDIK5JEkRRHw9o8TzALDayxhZQE5wzk+oqnraCy+zvr4BEA6H6+vq6t5FxO2I6EnpYkpyzhOIeCSVSh3t7+8f9QMMzwBkFX9PEIT3AYDMuhxES+bI9PT0wb6+vpteBnQNwJYtW2omJibeRsQDZVQ8X1fyGXtFUfzu1KlT026AcAVAb29vB+f8GABIbgYNoI+acZzbYrHYv6XyLhkASZLeEAThW4MHL3XMoNqPM8Z2qqr6fSkDOAYga/JfIiKt9aolzvkhURQ/crokHAHQ0tJS19TU9Gt2W6ta5XXBOOd/JJPJlxOJxLidsLYAZJX/DRGfs2NWTd+dgmAJQNbsf59pyhss4aQoii9bLQdLAGRZpjX/YTXNbKmycM4PK4ryQbF+RQGQJOlNQRBoq5vxxBjbpqrqT2aKmAIQjUbbAGCgCrc6t5Mxjojh06dPD+UzKACA1v3k5OSf5TzkLFmyBNrb2wuUm5iYgHPnzrlVOr+fWltb+2y+PygAQJblHRRw+DWqEz7FAOCcg6qqQP9+EOd8p6IoR428cgDYtGlT46xZs/4GgAY/BnTKoxgA1H9gYAAePnzolJVdu9FUKtVqjCRzAJBl+atKnPSsALh9+zYMD1OOxB9ijO1TVfVTndtTACisnTNnTrISjs8KADL/8+fPQyqV8gcBgBwreApANBrdnVGeQtuykxUAJMzY2BhcuHAB0um0L7Ixxvaqqvo5MXsKgCzLlxGxxZcRSmRiBwCxe/LkCQwODgLtDF6J0myKomjbjgZAJBLZHAqFaOurCDkBgAQjC7h69SqQX/BqDYwxSVXVuAZApY+8TgHQZyfjyODBgweaX7hx4wZMTU2VPHH6EVkH4FJQiUwnkpUKgJEnOUhaHi5oOBaLtWMkElkRCoVGXDDwrUuFAADGWCtGo9FXAOC4b9q4YFQpALS7C1mWv0DEPS7k9q2LFQBDQ0OwcuVKqKvTL5Fyh/WwBMgC9hMAlOp61TdtDIwQEerr62HRokUwd+5cEEUR+vv7YXJyMmc4KwBisRgQn2XLlgG1mzdvXk5fLwDQbRMtgb8AIOwnACTw0qVLobm5GWpra3NYU3SXv5fbAWBkQCDOnz8fZs+erfEeGRnxcjY4SxYwQheWfgFAQq1Zs0YT0oy8AuCXnMQnEx3eJAsY8+v8T7Ozbt26ouuVBq0mAABgnADwJdgmsw+Hw5ppWlGVAQC+AbBq1SpobGy0tdBqBMDzEqAtimZfEARTAKanp+HWrVswOjqqJTfyMzylOEFbhEtrME5OMJlJgdlPnQVj2qeXL19u2oKUpr3cKnipFACc82u0BPoA4JnSgMttvXHjRlPHR8EK7dN2Ob1KAQAA/WQBdO31klsAyPP39PSYdr948SLcv3/flnUFATiOkiR9JgjCXlspizSgk1l3d3fBV5r1eDxOx01b1pUCgHN+AHt7e1/jnP9sK2WRBnTM7ezsLPhKju/MmTOO2FqlxRVFccTDZaOtZAEtgiBcdslAO/F1dXWZWoDTnH5TUxO0trYW8KBER18fuahgKJ1ON2sJkWg0esltOZsfPmDt2rWwcOHCAi0fP36sJUODID0vqGeEPN0HkBMkIPKJMjWkgNUusGDBAu34bEaU7kokEkHoTzIdUhRll54UlUKhkOvFZnUKpF2AsrlmINDyodkPhUKmSvp8K5QzBmNsMxVeGtPirvOCdBLcsGGDFrebEcX/yWRSS2QSEBQxLl68WIvvi/UJ2PwTiqJoTsd4MfIxAOx3a29tbW1a0sIvCnL2M1HgnlgsdjAHgOzVGO0Grqo9KQ5Yv369bTToBKDr16/DlStXnDR102Y8U2rbpF+Q5tisJEmfZBTZ54Yr9XGSD7Djfe/ePS12sDs+2/Ep9j2/ZCYHAK9WoIPQ0dGh5QBLJZp5uvkJSnkAuDM1NdVtrC8OpECCHBvlBihCzM8JmoFCDo+2Ox/rAEyxty2QoF5+lsgQEA0NDdohhyyCwCBfQaEx3fiSwnfv3oVHjx6Vaixu2jsrkSHOsix3IiJli82T8W6Gr2wfKq/vVhSloNLCqkyOiqJ/rKzc/ozOGNterIjarlDS0xHZH/G9cdGPvMW4OCmVpYQJvf2ZcUT1wqIovuC6VJY0/l8XS+tTPtNA4JyfTCaTW30pl9dByFaO001yVRdP00lPFMVdvj6YMC7+bBE1VZJW2xZJT2beKVYU7coJFusky/JqRPyhnPXENh5Y5Zy/pSjKYKme2vbFSDGGhmdzFEKXtbTWINMo53xP2Z/NGUGh+uKamprdiLizjMuCXo0eTqVSX3t9QeraAvItIxtJ7qCAI6iCS0pkZngfS6VS33hVXJffNwCMgFDhpSAIL2ZvnLy+Ix6mbY0x9ks8HqcHkr5SIADkgUFleBLnvCdbi0iAkM+gn/H5/Cgi0lP5a4yxAUEQ/mGMqaqqBpMWzgr5H7G3oct1mrTYAAAAAElFTkSuQmCC"/>
                                </div>
                            </div>
                        </div>
                        <div className='ph-b-list'>
                            <div className='ph-b-l-header'>
                                {getText(Text.DownloadApp)}
                            </div>
                            <img className='ph-b-l-ios-download' onClick={()=>{
                                // window.open("https://apps.apple.com/us/app/netshort-popular-dramas-tv/id6504849169?mt=8","_blank")
                            }} src={require("@/assets/ios-donwload.png")} alt='ios' />
                            <img className='ph-b-l-android-download' onClick={()=>{
                                // window.open("https://play.google.com/store/apps/details?id=com.netshort.abroad","_blank")
                            }} src={require("@/assets/android-download.png")} alt='android'/>
                        </div>
                    </div>
                    <div className='ph-bottom-line'>
                        {/*{getText(Text.BottomLine)}*/}
                    </div>
                </div>
            </div>
        </>)}
    </>
}