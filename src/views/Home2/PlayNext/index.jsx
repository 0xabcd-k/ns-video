import "./style.less"
import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {apiVideo} from "@/api";
import {getText, Text} from "@/utils/i18";

export default function ({setLoading,drama,recommendsList,onClose}){
    const [tick,setTick] = useState(4)
    const navigate = useNavigate()
    async function init(){
        setLoading(true)
        if(drama.next_idx){
            const dramaResp = await apiVideo.drama({
                idx: drama.next_idx
            })
            if(dramaResp.success){
                return {...dramaResp.data,idx: drama.next_idx}
            }
        }else{
            for (let i = 0; i < recommendsList.length; i++) {
                if(recommendsList[i].idx !== drama.idx){
                    return recommendsList[i]
                }
            }
        }
    }
    useEffect(() => {
        let ticker;
        init().then((ans)=>{
            setLoading(false)
            ticker = setInterval(() => {
                setTick(prevTick => {
                    if (prevTick <= 0) {
                        clearInterval(ticker); // 停止计时
                        navigate(`/?drama=${ans.idx}`)
                        return 0;
                    }
                    return prevTick - 1;
                });
            },1000)
        })
        return ()=>{
            clearInterval(ticker)
        }
    }, []);
    return <>
        <div className='pn-main'>
            <div className='pn-close' onClick={()=>{
                onClose?.()
            }}>
                <svg t="1756452154498" className="icon" viewBox="0 0 1024 1024" version="1.1"
                     xmlns="http://www.w3.org/2000/svg" p-id="2344" width="200" height="200">
                    <path
                        d="M865.6 809.6c16 16 16 41.6 0 56-8 8-17.6 11.2-28.8 11.2s-20.8-3.2-28.8-11.2L512 568 214.4 865.6c-8 8-17.6 11.2-28.8 11.2s-20.8-3.2-28.8-11.2c-16-16-16-41.6 0-56L456 512 158.4 214.4c-16-16-16-41.6 0-56 16-16 41.6-16 56 0L512 456 809.6 158.4c16-16 41.6-16 56 0 16 16 16 41.6 0 56L568 512l297.6 297.6z"
                        fill="" p-id="2345"></path>
                </svg>
            </div>
            <div className='pn-modal'>
                <div className='pn-left'>
                    <img className='pn-poster' src={drama.poster} alt='poster'/>
                    <div className='pn-text'>{getText(Text.PlayNext).replace("{m}",drama.name).replace("{n}",tick)}</div>
                </div>
                <img className='pn-right' src={require("@/assets/play-next.png")} alt='play-next' onClick={()=>{}}/>
            </div>
        </div>
    </>
}