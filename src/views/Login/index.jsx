import "./style.less"
import {useEffect, useState} from "react";
import ReactLoading from "react-loading";
import {Toast} from "react-vant";
import {apiAuth} from "@/api";
import ss from "good-storage";
import {useNavigate} from "react-router-dom";
import {useMediaQuery} from "react-responsive";

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
                }}>Back</div>
                <div className='l-title'>
                    Login
                </div>
                <div className='l-desc'>
                    (To prevent information loss)
                </div>
                <div className='l-email'>
                    <input value={emailInput} onChange={(e) => {
                        setEmailInput(e.target.value)
                    }} placeholder='input your email'/>
                </div>
                <div className='l-code'>
                    <input value={codeInput} onChange={(e) => {
                        setCodeInput(e.target.value)
                    }} placeholder='email verify code'/>
                    <div className='l-code-btn' onClick={async () => {
                        setLoading(true)
                        const resp = await apiAuth.emailCode({email: emailInput})
                        if (resp.success) {
                            Toast.info("Email sent successfully. Pls Check your email")
                        } else {
                            Toast.info("Email send failed.Pls try again")
                        }
                        setLoading(false)
                    }}>
                        Get Code
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
                            Toast.info("Email verify code expire.Pls try again")
                        }else {
                            Toast.info("Login failed.Pls try again")
                        }
                    }
                    setLoading(false)
                }}>Confirm</div>
            </div>
        </>: <>
            404 NOT FOUND
        </>}
    </>
}