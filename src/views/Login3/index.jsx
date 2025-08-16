import "./style.less"
import ReactLoading from "react-loading";
import {useState} from "react";
import {getSafeTop, useHashQueryParams} from "@/utils";
import {useNavigate} from "react-router-dom";
import {getText, Text} from "@/utils/i18";
import {LoginButton} from "@telegram-auth/react";
import {Toast} from "react-vant";
import {apiAuth} from "@/api";
import ss from "good-storage";

const LoginType = {
    Account: 1,
    Email: 2,
}
let accountTimeout;
export default function (){
    const params = useHashQueryParams();
    const [loading, setLoading] = useState(false);
    const [emailInput,setEmailInput] = useState("")
    const [codeInput,setCodeInput] = useState("")

    const [loginType,setLoginType] = useState(LoginType.Account)

    const [accountInput,setAccountInput] = useState("")
    const [passwordInput,setPasswordInput] = useState("")
    const [passwordAgainInput,setPasswordAgainInput] = useState("")
    const [isRegister,setIsRegister] = useState(false)
    const navigate = useNavigate();
    const top = getSafeTop()
    return <>
        {loading && <>
            <div className='mask'>
                <div className='loading'>
                    <ReactLoading type="bars" color="#fff"/>
                </div>
            </div>
        </>}
        <div className='login-main' style={{maxWidth: '500px'}}>
            <div className='l-header' style={{maxWidth: '500px',top: top}}>
                <svg t="1754293807822" onClick={()=>{
                    navigate(-1)
                }} className="l-header-back" viewBox="0 0 1024 1024" version="1.1"
                     xmlns="http://www.w3.org/2000/svg" p-id="12170" width="200" height="200">
                    <path
                        d="M370.432 438.144a42.666667 42.666667 0 0 1-54.058667 65.792l-4.138666-3.413333-170.666667-159.189334a42.624 42.624 0 0 1-13.184-36.949333l-0.341333-3.413333 0.085333-5.546667 0.725333-5.333333 1.28-4.736 1.877334-4.736 2.218666-4.181334 2.730667-3.925333 3.541333-4.010667 170.666667-170.666666a42.666667 42.666667 0 0 1 63.872 56.32l-3.541333 4.010666L273.664 256h289.450667C747.306667 256 896 409.258667 896 597.802667c0 178.901333-134.912 293.546667-321.408 298.069333l-11.477333 0.128H281.6a42.666667 42.666667 0 0 1-4.949333-85.034667L281.557333 810.666667h281.6C711.594667 810.666667 810.666667 729.173333 810.666667 597.802667c0-138.752-106.069333-251.264-238.293334-256.298667L563.114667 341.333333H266.666667l103.765333 96.810667z"
                        fill="#cdcdcd" p-id="12171"></path>
                </svg>
            </div>
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
            <div className='l-login-box'>
                <div className='l2-login-telegram'>
                    <LoginButton
                        botUsername={process.env.NODE_ENV === "development"?"netshort002bot":"netshort001bot"}
                        buttonSize="large"
                        showAvatar={false}
                        onAuthCallback={async (user) => {
                            setLoading(true)
                            const resp = await apiAuth.loginTelegram(user)
                            if(resp.success) {
                                ss.set("Authorization", resp.data.token)
                                navigate(-1)
                            }else {
                                Toast.info(getText(Text.LoginFail))
                            }
                            setLoading(false)
                        }}
                    />
                </div>
                <div className='l2-login-line' onClick={()=>{
                    const link = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=2007677100&redirect_uri=${encodeURIComponent("https://api.netshort.online/line/auth")}&state=${encodeURIComponent(params.redirect)}&scope=profile%20openid`
                    window.location.href = link
                }}>
                    <svg t="1751454356123" className="icon" viewBox="0 0 1024 1024" version="1.1"
                         xmlns="http://www.w3.org/2000/svg" p-id="2292" width="88" height="88">
                        <path
                            d="M826.24 420.821333a26.922667 26.922667 0 0 1 0 53.802667H751.36v48h74.88a26.88 26.88 0 1 1 0 53.717333h-101.802667a26.922667 26.922667 0 0 1-26.752-26.837333V345.941333c0-14.72 12.032-26.88 26.88-26.88h101.802667a26.88 26.88 0 0 1-0.128 53.76H751.36v48h74.88z m-164.48 128.682667a26.88 26.88 0 0 1-26.922667 26.752 26.368 26.368 0 0 1-21.76-10.666667l-104.234666-141.525333v125.44a26.88 26.88 0 0 1-53.632 0V345.941333a26.752 26.752 0 0 1 26.624-26.794666c8.32 0 16 4.437333 21.12 10.837333l105.045333 142.08V345.941333c0-14.72 12.032-26.88 26.88-26.88 14.72 0 26.88 12.16 26.88 26.88v203.562667z m-244.949333 0a26.965333 26.965333 0 0 1-26.922667 26.837333 26.922667 26.922667 0 0 1-26.752-26.837333V345.941333c0-14.72 12.032-26.88 26.88-26.88 14.762667 0 26.794667 12.16 26.794667 26.88v203.562667z m-105.216 26.837333H209.792a27.050667 27.050667 0 0 1-26.88-26.837333V345.941333c0-14.72 12.16-26.88 26.88-26.88 14.848 0 26.88 12.16 26.88 26.88v176.682667h74.922667a26.88 26.88 0 0 1 0 53.717333M1024 440.064C1024 210.901333 794.24 24.405333 512 24.405333S0 210.901333 0 440.064c0 205.269333 182.186667 377.258667 428.16 409.941333 16.682667 3.498667 39.381333 11.008 45.141333 25.173334 5.12 12.842667 3.370667 32.682667 1.621334 46.08l-6.997334 43.52c-1.92 12.842667-10.24 50.602667 44.757334 27.52 55.082667-22.997333 295.082667-173.994667 402.602666-297.6C988.842667 614.101333 1024 531.541333 1024 440.064"
                            fill="#ffffff" p-id="2293"></path>
                    </svg>
                    Log in with Line
                </div>
                <div className='fb-login' onClick={() => {
                    FB.getLoginStatus(async function (response) {
                        if (response.status === "connected") {
                            setLoading(true)
                            const resp = await apiAuth.loginFacebook({
                                otoken: response.authResponse.accessToken,
                                signed_request: response.authResponse.signedRequest
                            })
                            if (resp.success) {
                                ss.set("Authorization", resp.data.token)
                                navigate(-1)
                            } else {
                                Toast.info(getText(Text.LoginFail))
                            }
                            setLoading(false)
                        } else {
                            FB.login(async function (response) {
                                setLoading(true)
                                if (response.status === "connected") {
                                    const resp = await apiAuth.loginFacebook({
                                        otoken: response.authResponse.accessToken,
                                        signed_request: response.authResponse.signedRequest
                                    })
                                    if (resp.success) {
                                        ss.set("Authorization", resp.data.token)
                                        navigate(-1)
                                    } else {
                                        Toast.info(getText(Text.LoginFail))
                                    }
                                } else {
                                    Toast.info(getText(Text.LoginFail))
                                }
                                setLoading(false)
                            });
                        }
                    })
                }}>
                    <svg t="1755317112699" className="icon" viewBox="0 0 1024 1024" version="1.1"
                         xmlns="http://www.w3.org/2000/svg" p-id="2313" width="200" height="200">
                        <path
                            d="M967.509333 0H56.490667C25.301333 0 0 25.301333 0 56.490667v911.018666C0 998.741333 25.301333 1024 56.490667 1024h490.410666v-396.544H413.397333v-154.496h133.504V358.826667c0-132.224 80.810667-204.16 198.784-204.16 56.533333 0 105.130667 4.138667 119.296 6.016v138.24h-81.962666c-64 0-76.458667 30.762667-76.458667 75.562666v98.602667h152.917333l-19.84 154.88H706.56V1024h260.906667c31.274667 0 56.533333-25.258667 56.533333-56.490667V56.490667C1024 25.301333 998.741333 0 967.509333 0"
                            fill="#ffffff" p-id="2314"></path>
                    </svg>
                    Log in with Facebook
                </div>
                {/*<div className="fb-login-button" data-width="200px" data-size="large" data-button-type="" data-layout=""*/}
                {/*     data-auto-logout-link="false" data-use-continue-as="true" onlogin="checkLoginState();">*/}
                {/*</div>*/}
            </div>
            <div className='l2-login-bottom'>
                <div className='l2-login-methods'>
                    <div className={LoginType.Account === loginType ? 'l2-l-m-btn-light' : 'l2-l-m-btn-black'}
                         onClick={() => {
                             setLoginType(LoginType.Account)
                         }}>
                        {getText(Text.EmailLogin)}
                    </div>
                    <div className={LoginType.Email === loginType ? 'l2-l-m-btn-light' : 'l2-l-m-btn-black'}
                         onClick={() => {
                             setLoginType(LoginType.Email)
                         }}>
                        {getText(Text.AccountLogin)}
                    </div>
                </div>
            </div>
        </div>
    </>
}