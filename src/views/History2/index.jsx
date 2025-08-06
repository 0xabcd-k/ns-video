import "./style.less"
import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import ReactLoading from "react-loading";
import {getText,Text} from "@/utils/i18";
import InfiniteScroll from "react-infinite-scroll-component";
import {apiFinance, apiVideo} from "@/api";
import {Toast} from "react-vant";
import {getSafeTop} from "@/utils";

const HistoryType = {
    WatchRecord: "WatchRecord",
    RechargeRecord: "RechargeRecord"
}
export default function (){
    const [history,setHistory] = useState([]);
    const [nextId,setNextId] = useState("");
    const [hasMore,setHasMore] = useState(true);
    const [loading,setLoading] = useState(true);
    const navigate = useNavigate();

    const [recharge,setRecharge] = useState([])
    const [nextRechargeId,setNextRechargeId] = useState(0);
    const [hasMoreRecharge,setHasMoreRecharge] = useState(true);

    const [historyType,setHistoryType] = useState(HistoryType.WatchRecord);

    async function updateHistory(){
        setLoading(true);
        if(hasMore){
            const resp = await apiVideo.listHistory({
                page_size:8,
                pre_idx: nextId
            })
            if(resp.success){
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
        setLoading(false);
    }
    async function updateRecharge(){
        setLoading(true);
        if(hasMoreRecharge){
            const resp = await apiFinance.rechargeList({
                page_size:8,
                pre_id: nextRechargeId,
            })
            if(resp.success){
                if(resp.data.list.length>0){
                    setRecharge([...recharge,...resp.data.list]);
                    setNextRechargeId(resp.data.last_id)
                    if(resp.data.list.length<8){
                        setHasMoreRecharge(false);
                    }
                }else{
                    setHasMoreRecharge(false)
                }
            }
        }
        setLoading(false);
    }
    function parseTime(timestamp){
        const t = new Date(timestamp*1000)
        console.log(t)
        return t.toLocaleString(navigator.language)
    }
    async function init(){
        setLoading(true);
        await updateHistory();
        await updateRecharge();
        setLoading(false)
    }
    useEffect(() => {
        init()
    }, []);
    return <>
        {loading && <>
            <div className='mask'>
                <div className='loading'>
                    <ReactLoading type="bars" color="#fff"/>
                </div>
            </div>
        </>}
        <div className='history-main' style={{maxWidth: '500px'}}>
            <div className='h-header' style={{maxWidth: '500px',top: getSafeTop()}}>
                <div className='h-header-left'>
                    <svg t="1754293807822" onClick={()=>{
                        navigate(-1)
                    }} className="h-header-back" viewBox="0 0 1024 1024" version="1.1"
                         xmlns="http://www.w3.org/2000/svg" p-id="12170" width="200" height="200">
                        <path
                            d="M370.432 438.144a42.666667 42.666667 0 0 1-54.058667 65.792l-4.138666-3.413333-170.666667-159.189334a42.624 42.624 0 0 1-13.184-36.949333l-0.341333-3.413333 0.085333-5.546667 0.725333-5.333333 1.28-4.736 1.877334-4.736 2.218666-4.181334 2.730667-3.925333 3.541333-4.010667 170.666667-170.666666a42.666667 42.666667 0 0 1 63.872 56.32l-3.541333 4.010666L273.664 256h289.450667C747.306667 256 896 409.258667 896 597.802667c0 178.901333-134.912 293.546667-321.408 298.069333l-11.477333 0.128H281.6a42.666667 42.666667 0 0 1-4.949333-85.034667L281.557333 810.666667h281.6C711.594667 810.666667 810.666667 729.173333 810.666667 597.802667c0-138.752-106.069333-251.264-238.293334-256.298667L563.114667 341.333333H266.666667l103.765333 96.810667z"
                            fill="#cdcdcd" p-id="12171"></path>
                    </svg>
                </div>
                <div className='h-header-right'>
                    <div className='h-switch-method'>
                        <div className={HistoryType.WatchRecord === historyType ? 'h-switch-method-btn-light' : 'h-switch-method-btn-black'}
                             onClick={() => {
                                 setHistoryType(HistoryType.WatchRecord)
                             }}>
                            {getText(Text.WatchRecord)}
                        </div>
                        <div className={HistoryType.RechargeRecord === historyType ? 'h-switch-method-btn-light' : 'h-switch-method-btn-black'}
                             onClick={async () => {
                                 setLoading(true);
                                 await updateRecharge();
                                 setHistoryType(HistoryType.RechargeRecord);
                                 setLoading(false);
                             }}>
                            {getText(Text.RechargeRecord)}
                        </div>
                    </div>
                </div>
            </div>
            <div className='h-modal-inner' id='history-recharge-scroll' style={historyType===HistoryType.RechargeRecord?{marginTop:`calc(6vh+${getSafeTop()})`}:{marginTop:`calc(6vh+${getSafeTop()})`,display:"none"}}>
                <InfiniteScroll scrollableTarget="history-recharge-scroll" next={updateRecharge} hasMore={hasMoreRecharge} loader={
                    <h4 style={{color: "#ffd890"}}>{getText(Text.Empty)}</h4>
                } dataLength={recharge.length}
                                endMessage={<div className='h-m-end'>{getText(Text.NoMore)}</div>}                                    >
                    {recharge?.map((item, index) => {
                        return <>
                            <div className='h-m-r-item'>
                                <div className='h-m-r-item-drama-name' onClick={()=>{
                                    navigate(`/?drama=${item.drama_idx}`);
                                }}>{item.drama_name}</div>
                                <div className='h-m-r-item-drama-order' onClick={()=>{
                                    navigator.clipboard.writeText(item.order_no)
                                        .then(() => {
                                            Toast.info("copy successfully")
                                        })
                                        .catch(err => {
                                            Toast.info("copy failed")
                                        });
                                }}>{item.order_no}</div>
                                <div className='h-m-r-item-drama-price'>Amount: {item.amount}</div>
                                <div className='h-m-r-item-drama-time'>{parseTime(item.create_time)}</div>
                                {(()=>{
                                    switch (item.state){
                                        case "RechargeOrderSuccess":
                                            return <div className='h-m-r-item-drama-state-success'>
                                                {getText(Text.RechargeSuccess)}
                                            </div>
                                        case "RechargeOrderUnprocess":
                                            return <div className='h-m-r-item-drama-state-pending'>
                                                {getText(Text.RechargePending)}
                                            </div>
                                    }
                                })()}
                            </div>
                        </>
                    })}
                </InfiniteScroll>
            </div>
            <div className='h-modal-inner' id='history-watch-scroll' style={historyType===HistoryType.WatchRecord?{marginTop:`calc(6vh+${getSafeTop()})`}:{marginTop:`calc(6vh+${getSafeTop()})`,display:"none"}}>
                <InfiniteScroll scrollableTarget="history-watch-scroll" next={updateHistory} hasMore={hasMore} loader={
                    <h4 style={{color: "#ffd890"}}>{getText(Text.Empty)}</h4>
                } dataLength={history.length}
                                endMessage={<div className='h-m-end'>{getText(Text.NoMore)}</div>}                                    >
                    {history.map((item, index) => {
                        return <>
                            <div className='h-m-item' onClick={()=>{
                                navigate(`/?drama=${item.idx}`);
                            }}>
                                <img className='h-m-item-poster' src={item.poster} alt='poster' />
                                <div className='h-m-item-info'>
                                    <div className='h-m-item-info-title'>
                                        {item.name}
                                    </div>
                                    <div className='h-m-item-info-content'>
                                        {getText(Text.WatchUpToEpisode)} <span>{item.no}</span>
                                    </div>
                                    <div className='h-m-item-info-time'>
                                        {parseTime(item.watch_time)}
                                    </div>
                                </div>
                            </div>
                        </>
                    })}
                </InfiniteScroll>
            </div>
        </div>
    </>
}