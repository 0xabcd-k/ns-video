import "./style.less"
import {useEffect, useState} from "react";
import {apiVideo} from "@/api";
import {getText,Text} from "@/utils/i18";
import {useNavigate} from "react-router-dom";

export default function ({isMobile,series,setLoading,onClose}){
    const [dramas,setDramas] = useState([])
    const navigate = useNavigate();
    async function init(){
        setLoading(true)
        const dramaResp = await apiVideo.dramaList({
            series: Number(series),
            lan: navigator.language,
        })
        if(dramaResp.success){
            setDramas(dramaResp.data.list)
        }
        setLoading(false);
    }
    useEffect(()=>{
        init()
    },[])
    return <>
        <div className='mask' onClick={onClose}></div>
        {isMobile?<>
            <div className='recommend-modal-mobile'>
                <div className='rmm-title'>
                    {getText(Text.Recommend)}
                </div>
                <div className='rmm-content'>
                    {dramas&&dramas.map((item,index)=>{
                        return <div className='rmm-c-item' onClick={()=>{
                            navigate(`/?drama=${item.idx}`)
                        }}>
                            <div className='rmm-c-i-tip'>
                                {getText(Text.CompleteSeries)}
                            </div>
                            <img className='rmm-c-i-poster' src={item.poster} alt='poster'/>
                            <div className='rmm-c-i-name'>{item.name}</div>
                        </div>
                    })}
                </div>
            </div>
        </>:<>
            <div className='recommend-modal-pc'>
                <div className='rmpc-title'>
                    {getText(Text.Recommend)}
                </div>
                <div className='rmpc-content'>
                    {dramas&&dramas.map((item,index)=>{
                        return <div className='rmpc-c-item' onClick={()=>{
                            navigate(`/?drama=${item.idx}`)
                        }}>
                            <div className='rmpc-c-i-tip'>
                                {getText(Text.CompleteSeries)}
                            </div>
                            <img className='rmpc-c-i-poster' src={item.poster} alt='poster'/>
                            <div className='rmpc-c-i-name'>{item.name}</div>
                        </div>
                    })}
                </div>
            </div>
        </>}
    </>
}