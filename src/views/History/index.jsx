import "./style.less"
import {useEffect, useState} from "react";
import {apiVideo} from "@/api";
import ReactLoading from "react-loading";
import InfiniteScroll from "react-infinite-scroll-component";
import {useNavigate} from "react-router-dom";

export default function (){
    const [history,setHistory] = useState([]);
    const [nextId,setNextId] = useState("");
    const [hasMore,setHasMore] = useState(true);
    const [loading,setLoading] = useState(true);
    const navigate = useNavigate();
    async function updateHistory(){
        setLoading(true);
        apiVideo.listHistory({
            page_size:8,
            pre_idx: nextId
        }).then((resp)=>{
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
        })
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
                Back
            </div>
            <div className='h-modal-inner' id='history-scroll'>
                <InfiniteScroll scrollableTarget="history-scroll" next={updateHistory} hasMore={hasMore} loader={
                    <h4>loading</h4>
                } dataLength={history.length}
                                endMessage={<div className='h-m-end'>No More</div>}                                    >
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
                                        Watched up to Episode  <span>{item.no}</span>
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