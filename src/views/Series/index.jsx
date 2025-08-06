import "./style.less"
import ReactLoading from "react-loading";
import {useEffect, useState} from "react";
import {useMediaQuery} from "react-responsive";
import {getText, Text} from "@/utils/i18";
import {apiAuth, apiVideo} from "@/api";
import {getSafeTop, useHashQueryParams} from "@/utils";
import {useNavigate} from "react-router-dom";
import {Toast} from "react-vant";
import ss from "good-storage";

export default function (){
    const [loading,setLoading] = useState(false);
    const isMobile = useMediaQuery({ maxWidth: 767 });
    const [email,setEmail] = useState("");
    const [dramas,setDramas] = useState("");
    const params = useHashQueryParams();
    if(navigator.language==='zh-TW'){
        params.series = 2
    }else {
        params.series = 1
    }
    const navigate = useNavigate();
    const [login,setLogin] = useState(null);
    const [emailInput,setEmailInput] = useState("");
    const [codeInput,setCodeInput] = useState("");
    async function init(){
        setLoading(true)
        const resp = await apiAuth.userInfo({})
        if(resp?.data?.email){
            setEmail(resp?.data?.email)
        }
        const dramaResp = await apiVideo.dramaList({
            series: Number(params.series),
            lan: navigator.language,
        })
        if(dramaResp.success){
            setDramas(dramaResp.data.list)
        }
        setLoading(false);
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
        <div className='series-main' style={{maxWidth: '500px'}}>
            <div className='s-header' style={{maxWidth: '500px',top: getSafeTop()}}>
                <img className='s-h-logo' src={require("@/assets/logo.png")} alt='logo'/>
            </div>
            <div style={{marginTop: getSafeTop()}}/>
            <div className='s-drama'>
                <div className='s-drama-title'>
                    {getText(Text.Recommend)}
                </div>
                <div className='s-drama-box'>
                    {dramas && dramas.map((item, index) => {
                        return <div className='s-drama-box-item' onClick={() => {
                            navigate(`/?drama=${item.idx}`)
                        }}>
                            <div className='s-drama-box-item-tip'>
                                {getText(Text.CompleteSeries)}
                            </div>
                            <img className='s-drama-box-item-poster' src={item.poster} alt='poster'/>
                            <div className='s-drama-box-item-name'>{item.name}</div>
                        </div>
                    })}
                </div>
            </div>
        </div>
    </>
}