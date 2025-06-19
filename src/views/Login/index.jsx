import "./style.less"
import {useEffect, useState} from "react";
import ReactLoading from "react-loading";
import {Toast} from "react-vant";
import {apiAuth} from "@/api";
import ss from "good-storage";
import {useNavigate} from "react-router-dom";
import {useMediaQuery} from "react-responsive";
import {getText,Text} from "@/utils/i18";

export default function (){
    const isMobile = useMediaQuery({ maxWidth: 767 });
    const [loading, setLoading] = useState(false);
    const [emailInput,setEmailInput] = useState("")
    const [codeInput,setCodeInput] = useState("")
    const navigate = useNavigate();
    useEffect(() => {
    }, []);
    return <>
        {loading && <>
            <div className='mask'>
                <div className='loading'>
                    <ReactLoading type="bars" color="#fff"/>
                </div>
            </div>
        </>}
        {isMobile ? <>
            <div className='login'>
                <div className='l-back' onClick={()=>{
                    navigate(-1)
                }}>{getText(Text.Back)}</div>
                <div className='l-title'>
                    {getText(Text.Login)}
                </div>
                <div className='l-desc'>
                    {getText(Text.LoginEmailToast)}
                </div>
                <div className='l-email'>
                    <input value={emailInput} onChange={(e) => {
                        setEmailInput(e.target.value)
                    }} placeholder={getText(Text.EmailInput)} />
                </div>
                <div className='l-code'>
                    <input value={codeInput} onChange={(e) => {
                        setCodeInput(e.target.value)
                    }} placeholder={getText(Text.CodeInput)} />
                    <div className='l-code-btn' onClick={async () => {
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
                <div className='l-confirm' onClick={async () => {
                    setLoading(true)
                    const authResp = await apiAuth.loginEmail({
                        email: emailInput,
                        code: codeInput,
                    })
                    if(authResp.success){
                        ss.set("Authorization", authResp.data.token)
                        navigate(-1)
                    }else {
                        if(authResp.err_code === 31003){
                            Toast.info(getText(Text.EmailCodeExpire))
                        }else {
                            Toast.info(getText(Text.LoginFail))
                        }
                    }
                    setLoading(false)
                }}>{getText(Text.Confirm)}</div>
            </div>
        </>: <>
            {getText(Text.NotFound)}
        </>}
    </>
}