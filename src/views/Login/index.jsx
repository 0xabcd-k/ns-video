import "./style.less"
import {useEffect, useState} from "react";
import ReactLoading from "react-loading";
import {Toast} from "react-vant";
import {apiAdmin, apiAuth} from "@/api";
import ss from "good-storage";
import {useNavigate} from "react-router-dom";
import {useMediaQuery} from "react-responsive";
import {getText,Text} from "@/utils/i18";
import {LoginButton} from "@telegram-auth/react";

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
                <div className='l-login-third-box'>
                    <div className='l-login-third-box-item'>
                        <svg t="1751445500949" className="icon" viewBox="0 0 1024 1024" version="1.1"
                             xmlns="http://www.w3.org/2000/svg" p-id="2339" width="200" height="200">
                            <path
                                d="M679.424 746.862l84.005-395.996c7.424-34.852-12.581-48.567-35.438-40.009L234.277 501.138c-33.72 13.13-33.134 32-5.706 40.558l126.282 39.424 293.156-184.576c13.714-9.143 26.295-3.986 16.018 5.157L426.898 615.973l-9.143 130.304c13.13 0 18.871-5.706 25.71-12.581l61.696-59.429 128 94.282c23.442 13.129 40.01 6.29 46.3-21.724zM1024 512c0 282.843-229.157 512-512 512S0 794.843 0 512 229.157 0 512 0s512 229.157 512 512z"
                                fill="#1296DB" p-id="2340"></path>
                        </svg>
                        <LoginButton botUsername='netshort001bot' authCallbackUrl="https://player.netshort.online/#/login" buttonSize="small" cornerRadius={5} showAvatar={true} lang="en" />
                    </div>
                    <div className='l-login-third-box-item'>
                        <svg t="1751445632902" className="icon" viewBox="0 0 1107 1024" version="1.1"
                             xmlns="http://www.w3.org/2000/svg" p-id="3326" width="200" height="200">
                            <path
                                d="M553.967 0C248.01 0 0 195.231 0 436.04c0 223.685 214.083 407.92 489.757 433.017a33.708 33.708 0 0 1 22.512 14.705c12.237 20.145 3.542 63.069-5.96 111.197s42.169 23.149 53.6 17.576c9.1-4.415 243.31-136.444 382.742-265.921 101.963-79.1 165.25-189.02 165.25-310.558C1107.934 195.231 859.908 0 553.967 0zM369.311 550.157a29.545 29.545 0 0 1-29.78 29.276H238.257c-17.878 0-41.698-6.178-41.698-35.135v-216.55a29.528 29.528 0 0 1 29.78-29.277h5.959a29.528 29.528 0 0 1 29.78 29.276v187.275h77.438a29.545 29.545 0 0 1 29.796 29.276v5.859z m83.482-5.825a29.746 29.746 0 0 1-59.493 0V333.958a29.746 29.746 0 0 1 59.493 0v210.374z m262.01 0a32.92 32.92 0 0 1-29.78 29.276 33.708 33.708 0 0 1-35.102-16.787l-95.954-134.58v122.057a29.78 29.78 0 0 1-59.543 0V333.589a29.511 29.511 0 0 1 29.763-29.26 37.67 37.67 0 0 1 33.759 21.437c9.232 13.631 97.364 136.511 97.364 136.511V333.59a29.797 29.797 0 0 1 59.576 0v210.709z m178.696-134.614a29.276 29.276 0 1 1 0 58.552H816.06v46.819h77.438a29.276 29.276 0 1 1 0 58.536H777.35a26.557 26.557 0 0 1-26.859-26.322V330.702a26.557 26.557 0 0 1 26.86-26.339h116.148a29.276 29.276 0 1 1 0 58.536H816.06v46.835h77.438z"
                                fill="#00C300" p-id="3327"></path>
                        </svg>
                    </div>
                </div>
            </div>
        </> : <>
            {getText(Text.NotFound)}
        </>}
    </>
}