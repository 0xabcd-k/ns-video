import "./style.less"
import ReactLoading from "react-loading";
import {useEffect, useState} from "react";
import {useMediaQuery} from "react-responsive";
import {getText, Text} from "@/utils/i18";
import {apiAuth, apiVideo} from "@/api";
import {useHashQueryParams} from "@/utils";
import {useNavigate} from "react-router-dom";
import {Toast} from "react-vant";
import ss from "good-storage";

export default function (){
    const [loading,setLoading] = useState(false);
    const isMobile = useMediaQuery({ maxWidth: 767 });
    const [email,setEmail] = useState("");
    const [dramas,setDramas] = useState("");
    const params = useHashQueryParams();
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
        {isMobile ?<>
            <div className='m-series'>
                <div className='m-s-header'>
                    <div className='m-s-h-left'>
                        <img className='m-s-h-logo' src={require("@/assets/logo.png")} alt='logo'/>
                    </div>
                    <div className='m-s-h-right'>
                        <div className='m-s-h-login' onClick={()=>{
                            navigate("/login")
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
                <div className='m-s-list'>
                    <div className='m-s-title'>
                        {getText(Text.Recommend)}
                    </div>
                    <div className='m-s-items'>
                        {dramas && dramas.map((item, index) => {
                            return <div className='m-s-item' onClick={() => {
                                navigate(`/?drama=${item.idx}`)
                            }}>
                                <div className='m-s-tip'>
                                    {getText(Text.CompleteSeries)}
                                </div>
                                <img className='m-s-poster' src={item.poster} alt='poster'/>
                                <div className='m-s-name'>{item.name}</div>
                            </div>
                        })}
                    </div>
                </div>
            </div>
        </>:<>
            <div className='p-series'>
                <div className='p-s-header'>
                    <div className='p-s-h-left'>
                        <img className='p-s-h-logo' src={require("@/assets/logo.png")} alt='logo'/>
                        <div className='p-s-h-home'>{getText(Text.Recommend)}</div>
                    </div>
                    <div className='p-s-h-right'>
                        <div className='p-s-h-login'>
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
                                <div className='p-h-login-modal-mask' onClick={() => {
                                    setLogin(false)
                                }}/>
                                <div className='p-h-login-modal'>
                                    <div className='p-h-lm-title'>
                                        {getText(Text.Login)}
                                    </div>
                                    <div className='p-h-lm-desc'>
                                        {getText(Text.LoginEmailToast)}
                                    </div>
                                    <div className='p-h-lm-email'>
                                        <input value={emailInput} onChange={(e) => {
                                            setEmailInput(e.target.value)
                                        }} placeholder={getText(Text.EmailInput)}/>
                                    </div>
                                    <div className='p-h-lm-code'>
                                        <input value={codeInput} onChange={(e) => {
                                            setCodeInput(e.target.value)
                                        }} placeholder={getText(Text.CodeInput)} />
                                        <div className='p-h-lm-code-btn' onClick={async () => {
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
                                    <div className='p-h-lm-confirm' onClick={async () => {
                                        setLoading(true)
                                        const authResp = await apiAuth.loginEmail({
                                            email: emailInput,
                                            code: codeInput,
                                        })
                                        if(authResp.success){
                                            ss.set("Authorization", authResp.data.token)
                                            setEmail(emailInput)
                                        }else {
                                            if(authResp.err_code === 31003){
                                                Toast.info(getText(Text.EmailCodeExpire))
                                            }else {
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
                <div className='p-s-list'>
                    <div className='p-s-items'>
                        {dramas&&dramas.map((item,index)=>{
                            return <div className='p-s-item' onClick={()=>{
                                navigate(`/?drama=${item.idx}`)
                            }}>
                                <img className='p-s-i-poster' src={item.poster} alt='poster'/>
                                <div className='p-s-i-desc'>
                                    <div className='p-s-i-title'>{item.name}</div>
                                    <div className='p-s-i-content'>{item.desc}</div>
                                </div>
                                <div className='p-s-item-bg1'></div>
                            </div>
                        })}
                    </div>
                </div>
            </div>
        </>}
    </>
}