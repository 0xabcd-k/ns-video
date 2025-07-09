import "./style.less"
import {useEffect, useState} from "react";
import {apiFinance, apiVideo} from "@/api";
import ReactLoading from "react-loading";
import InfiniteScroll from "react-infinite-scroll-component";
import {useNavigate} from "react-router-dom";
import {Text,getText} from "@/utils/i18";

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
                setRecharge([recharge,...resp.data.list]);
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
        return t.toLocaleString()
    }
    async function init(){
        setLoading(true);
        await updateHistory();
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
        <div className='history'>
            <div className='h-back' onClick={()=>{
                navigate(-1)
            }}>
                {getText(Text.Back)}
            </div>
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
            <div className='h-modal-inner' id='history-recharge-scroll' style={historyType===HistoryType.RechargeRecord?{}:{display:"none"}}>
                <InfiniteScroll scrollableTarget="history-recharge-scroll" next={updateRecharge} hasMore={hasMoreRecharge} loader={
                    <h4>{getText(Text.Loading)}</h4>
                } dataLength={recharge.length}
                    endMessage={<div className='h-m-end'>{getText(Text.NoMore)}</div>}                                    >
                    {recharge?.map((item, index) => {
                        return <>
                            <div className='h-m-r-item' onClick={()=>{
                                navigate(`/?drama=${item.drama_idx}`);
                            }}>
                                <div className='h-m-r-item-drama-name'>{item.drama_name}</div>
                                <div className='h-m-r-item-drama-order'>{item.order_no}</div>
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
            <div className='h-modal-inner' id='history-watch-scroll' style={historyType===HistoryType.WatchRecord?{}:{display:"none"}}>
                <InfiniteScroll scrollableTarget="history-watch-scroll" next={updateHistory} hasMore={hasMore} loader={
                    <h4>{getText(Text.Loading)}</h4>
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