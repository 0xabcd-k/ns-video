import "./style.less"
import {useEffect, useState} from "react";
import ReactLoading from "react-loading";
import {Toast} from "react-vant";
import {apiAdmin, apiAuth} from "@/api";
import ss from "good-storage";
import {useNavigate} from "react-router-dom";
import {useMediaQuery} from "react-responsive";
import {getText,Text} from "@/utils/i18";

const LoginType = {
    Account: 1,
    Email: 2,
}
let accountTimeout;
export default function (){
    const isMobile = useMediaQuery({ maxWidth: 767 });
    const [loading, setLoading] = useState(false);
    const [emailInput,setEmailInput] = useState("")
    const [codeInput,setCodeInput] = useState("")

    const [loginType,setLoginType] = useState(LoginType.Account)

    const [accountInput,setAccountInput] = useState("")
    const [passwordInput,setPasswordInput] = useState("")
    const [passwordAgainInput,setPasswordAgainInput] = useState("")
    const [isRegister,setIsRegister] = useState(false)

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
                <div className='l-tab'>
                    <div className={'l-tab-box'+" "+(LoginType.Account===loginType?"l-tab-box-item1":"l-tab-box-item2")} >
                        <div className='l-tab-item'>
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
                        <div className='l-tab-item'>
                            <div className='l-tab-input-box'>
                                <input className='l-tab-input' placeholder={getText(Text.AccountInput)} onChange={(e)=>{
                                    setAccountInput(e.target.value)
                                    clearTimeout(accountTimeout)
                                    accountTimeout = setTimeout(async ()=>{
                                        const exist = await apiAuth.isAccountExist({
                                            account: e.target.value
                                        })
                                        if (exist.success){
                                            if(exist.data.exist){
                                                setIsRegister(false)
                                            }else{
                                                setIsRegister(true)
                                            }
                                        }
                                    },1000)
                                }}/>
                                <div className='l-tab-info'>{getText(Text.AccountTip)}</div>
                            </div>
                            <div className='l-tab-input-box'>
                                <input className='l-tab-input' type='password' placeholder={getText(Text.PasswordInput)} onChange={(e)=>{
                                    setPasswordInput(e.target.value)
                                }}/>
                                <div className='l-tab-info'>{getText(Text.PasswordTip)}</div>
                            </div>
                            {isRegister && <div className='l-tab-input-box'>
                                <input className='l-tab-input' type='password' placeholder={getText(Text.PasswordAgainInput)} onChange={(e)=>{
                                    setPasswordAgainInput(e.target.value)
                                }}/>
                            </div>}
                            <div className='l-confirm' onClick={async ()=>{
                                if(isRegister){
                                   if(passwordAgainInput !== passwordInput) {
                                       Toast.info(getText(Text.NotSamePassword))
                                       return
                                   }
                                }
                                const loginResp = await apiAuth.loginPassword({
                                    username: accountInput,
                                    password: passwordInput
                                })
                                if(loginResp.success) {
                                    ss.set("Authorization", loginResp.data.token)
                                    navigate(-1)
                                }else {
                                    if(loginResp.err_code === 41001){
                                        Toast.info(getText(Text.InvalidFormat))
                                    }else {
                                        Toast.info(getText(Text.ServerError))
                                    }
                                }
                            }}>{getText(Text.Confirm)}</div>
                            <div className='l-tip'>{getText(Text.RegisterTip)}</div>
                        </div>
                    </div>
                </div>
                <div className='l-login-methods'>
                    <div className={LoginType.Account===loginType?'l-l-m-btn-light':'l-l-m-btn-black'} onClick={()=>{
                        setLoginType(LoginType.Account)
                    }}>
                        {getText(Text.EmailLogin)}
                    </div>
                    <div className={LoginType.Email===loginType?'l-l-m-btn-light':'l-l-m-btn-black'} onClick={()=>{
                        setLoginType(LoginType.Email)
                    }}>
                        {getText(Text.AccountLogin)}
                    </div>
                </div>
            </div>
        </>: <>
            {getText(Text.NotFound)}
        </>}
    </>
}