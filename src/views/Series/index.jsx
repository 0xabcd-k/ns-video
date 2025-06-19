import "./style.less"
import ReactLoading from "react-loading";
import {useEffect, useState} from "react";
import {useMediaQuery} from "react-responsive";
import {getText, Text} from "@/utils/i18";
import {apiAuth, apiVideo} from "@/api";
import {useHashQueryParams} from "@/utils";
import {useNavigate} from "react-router-dom";

export default function (){
    const [loading,setLoading] = useState(false);
    const isMobile = useMediaQuery({ maxWidth: 767 });
    const [email,setEmail] = useState("");
    const [dramas,setDramas] = useState("");
    const params = useHashQueryParams();
    const navigate = useNavigate();
    async function init(){
        setLoading(true)
        const resp = await apiAuth.userInfo({})
        if(resp?.data?.email){
            setEmail(resp?.data?.email)
        }
        const dramaResp = await apiVideo.dramaList({
            series: params.series,
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
        {isMobile ?<>
            <div className='m-series'>
                <div className='m-s-header'>
                    <div className='m-s-h-left'>
                        <img className='m-s-h-logo' src={require("@/assets/logo.png")} alt='logo'/>
                    </div>
                    <div className='m-s-h-right'>
                        <div className='m-s-h-login'>
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
                <div className='m-s-list'>
                    <div className='m-s-title'>
                        {getText(Text.Recommend)}
                    </div>
                    <div className='m-s-items'>
                        {dramas&&dramas.map((item,index)=>{
                            return <div className='m-s-item' onClick={()=>{
                                navigate(`/?drama=${item.idx}`)
                            }}>
                                <img className='m-s-i-poster' src={item.poster} alt='poster'/>
                                <div className='m-s-i-desc'>
                                    <div className='m-s-i-title'>{item.name}</div>
                                    <div className='m-s-i-content'>{item.desc}</div>
                                </div>
                                <div className='m-s-item-bg1'></div>

                            </div>
                        })}
                    </div>
                </div>
            </div>
        </>:<>
            <div className='p-series'>

            </div>
        </>}
    </>
}