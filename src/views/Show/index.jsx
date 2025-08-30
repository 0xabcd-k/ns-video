import "./style.less"
import {useEffect, useState} from "react";
import {getText, Text} from "@/utils/i18";
import {getSafeTop, useHashQueryParams} from "@/utils";
import {useNavigate} from "react-router-dom";
import {Image, Swiper} from "react-vant";
import {apiAuth, apiVideo} from "@/api";
import ReactLoading from "react-loading";

const keys = (()=>{
    let m = {
        "en-US": ["CEO", "boss", "romance", "revenge", "pregnant",
            "emotional", "married", "divorce", "identity", "crush",
            "kiss", "fake", "billionaire", "mistress", "alpha",
            "cold", "queen", "toxic", "rebirth", "time",
            "travel", "knight"],
        "zh-TW": ["總裁", "超能力", "校園", "復仇", "青梅竹馬", "豪門", "甜寵",
            "暗戀", "犯罪", "推理", "靈異", "職場", "愛情",
            "親情", "家族", "黑幫", "醫療", "旅行", "逆襲",
            "魔法", "科幻", "懸疑", "犯罪心理", "戰爭", "喜劇", "情感",
            "宮鬥", "破案", "網戀", "偶像", "復仇者", "冒險", "超自然", "輕喜劇", "都市愛情"]
    }
    if(!m[navigator.language]){
        return m["en-US"]
    }else{
        return m[navigator.language]
    }
})()

export default function (){
    const [loading,setLoading] = useState(false);
    const [email,setEmail] = useState("");
    const navigate = useNavigate();
    const [list,setList] = useState(null);
    const params = useHashQueryParams();
    const [searchText,setSearchText] = useState("");
    const top = getSafeTop();
    async function search(text){
        setLoading(true);
        const resp = await apiVideo.listDramaByKey({
            key: text,
        })
        if(resp.success){
            setList(resp.data.list)
        }
        setLoading(false)
    }
    async function init() {
        setLoading(true)
        const resp = await apiAuth.userInfo({})
        if(resp?.data?.email){
            setEmail(resp?.data?.email)
        }
        let series = params.series
        if(!series){
            if(navigator.language==='zh-TW'){
                series = 2
            }else if (navigator.language==='ko'){
                series = 4
            }else {
                series = 1
            }
        }
        const dramaResp = await apiVideo.dramaList({
            series: Number(series),
            lan: navigator.language,
        })
        if(dramaResp.success){
            setList(dramaResp.data.list)
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
        <div className='show-main' style={{maxWidth: '500px'}}>
            <div className='s-header' style={{maxWidth: '500px', paddingTop:top}}>
                <div className='s-header-icon'>
                    <img src={require("@/assets/logo.png")} alt='logo'/>
                </div>
                <div className='s-header-empty'></div>
                <div className='s-header-login' onClick={()=>{
                    navigate(`/login?redirect=${encodeURIComponent(window.location.href)}`);
                }}>
                    {email?<>
                        <span className='s-header-login-account'>{email}</span>
                    </>:<>
                        <svg t="1749537708692" className="icon" viewBox="0 0 1024 1024" version="1.1"
                             xmlns="http://www.w3.org/2000/svg" p-id="2439" id="mx_n_1749537708693" width="200"
                             height="200">
                            <path
                                d="M512 64C264.8 64 64 264.8 64 512s200.8 448 448 448 448-200.8 448-448S759.2 64 512 64z m32 704h-64v-64h64v64z m-64-128V256h64v384h-64z"
                                p-id="2440" fill="#ffffff"></path>
                        </svg>
                        <span className='s-header-login-text'>{getText(Text.Login)}</span>
                    </>}
                </div>
            </div>
            <div style={{marginTop: top}}/>
            <div className='s-poster'>
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
            <div className='s-search-box' style={{top: `calc(5vh + ${top})` }}>
                <div className='s-search-input'>
                    <svg className='icon' xmlns="http://www.w3.org/2000/svg" width="33" height="33" viewBox="0 0 33 33"
                         fill="none">
                        <path
                            d="M15.9434 31.4494C12.8072 31.4631 9.73674 30.5509 7.11714 28.8272C4.49754 27.1035 2.44538 24.645 1.21801 21.7602C0.00964754 18.8874 -0.308822 15.7184 0.30378 12.6628C0.916381 9.60718 2.43188 6.80552 4.65435 4.62001C6.8949 2.41383 9.73381 0.913282 12.8193 0.304296C15.9048 -0.304691 19.1012 0.00465676 22.0125 1.194C25.4096 2.56205 28.2214 5.07419 29.9612 8.29568C31.701 11.5172 32.2593 15.2453 31.5396 18.8348C30.8199 22.4243 28.8673 25.6494 26.0199 27.9519C23.1725 30.2543 19.6094 31.4893 15.9472 31.4431L15.9434 31.4494ZM15.9434 2.34108C13.2667 2.3281 10.6458 3.10597 8.40985 4.57698C6.17394 6.04799 4.42269 8.14657 3.37604 10.6092C2.34589 13.0609 2.07539 15.7653 2.59952 18.3724C3.12366 20.9795 4.41831 23.3695 6.31603 25.2331C8.23023 27.1129 10.6542 28.3899 13.2876 28.9058C15.9209 29.4216 18.6478 29.1536 21.1303 28.1351C24.0247 26.9652 26.4192 24.8213 27.8999 22.0738C29.3806 19.3263 29.8543 16.148 29.2392 13.0884C28.6241 10.0288 26.9589 7.2802 24.5313 5.31776C22.1037 3.35533 19.0665 2.30242 15.9446 2.34108H15.9434ZM31.8214 33C31.5134 32.9954 31.2193 32.8712 31.0013 32.6536L25.3346 27.0578C25.2254 26.9509 25.1386 26.8232 25.0794 26.6824C25.0202 26.5415 24.9897 26.3902 24.9897 26.2375C24.9897 26.0847 25.0202 25.9334 25.0794 25.7925C25.1386 25.6517 25.2254 25.524 25.3346 25.4171C25.5563 25.1994 25.8547 25.0775 26.1654 25.0775C26.4762 25.0775 26.7746 25.1994 26.9963 25.4171L32.6643 31.0129C32.8248 31.173 32.9341 31.3772 32.9782 31.5995C33.0223 31.8219 32.9992 32.0523 32.9118 32.2615C32.8229 32.4717 32.6745 32.6514 32.4848 32.7785C32.2952 32.9057 32.0725 32.9747 31.8442 32.9772L31.8214 33Z"
                            fill="white" fill-opacity="0.8"/>
                    </svg>
                    <input  onChange={(e)=>{setSearchText(e.target.value)}} value={searchText} placeholder={getText(Text.Search)}></input>
                </div>
                <div className='s-search-btn' onClick={async ()=>{
                    await search(searchText)
                }}>
                    {getText(Text.SearchBtn)}
                </div>
            </div>
            <div className='s-keys-box' style={{top: `calc(9vh + ${top})`}}>
                <div className='s-keys-content'>
                    <div className='s-keys-box-item' onClick={async ()=>{
                        setLoading(true)
                        const resp = await apiAuth.userInfo({})
                        if(resp?.data?.email){
                            setEmail(resp?.data?.email)
                        }
                        let series = params.series
                        if(!series){
                            if(navigator.language==='zh-TW'){
                                series = 2
                            }else if (navigator.language==='ko'){
                                series = 4
                            }else {
                                series = 1
                            }
                        }
                        const dramaResp = await apiVideo.dramaList({
                            series: Number(series),
                            lan: navigator.language,
                        })
                        if(dramaResp.success){
                            setList(dramaResp.data.list)
                        }
                        setLoading(false);
                    }}>{getText(Text.SearchAll)}</div>
                    {keys?.map((item,i)=>{
                        return <div className='s-keys-box-item' onClick={async ()=>{
                            await search(item)
                        }}>
                            {item}
                        </div>
                    })}
                </div>
            </div>
            <div className='s-drama-box'>
                {list?.map((item, index) => {
                    return <div className='s-drama-box-item' onClick={() => {
                        navigate(`/?drama=${item.idx}`)
                    }}>
                        <div className='s-drama-box-tip'>
                            {getText(Text.CompleteSeries)}
                        </div>
                        <img className='s-drama-box-desc' src={item.poster} alt='poster'/>
                        <div className='s-drama-box-name'>{item.name}</div>
                    </div>
                })}
            </div>
        </div>
    </>
}