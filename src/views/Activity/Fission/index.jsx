import "./style.less"
import {getText,Text} from "@/utils/i18";
import {useEffect, useState} from "react";
import {apiTelegramChannelActivity} from "@/api";
import {LoginButton} from "@telegram-auth/react";
import {useHashQueryParams} from "@/utils";
import ReactLoading from "react-loading";
import {Toast} from "react-vant";
import ss from "good-storage";
import {useNavigate} from "react-router-dom";

export default function (){
    const [loading,setLoading] = useState(false);
    const params = useHashQueryParams()
    const [userInfo,setUserInfo] = useState(null)
    const [giftList,setGiftList] = useState(null)
    const [redeemModal,setRedeemModal] = useState(null)
    const navigate = useNavigate()
    async function init(){
        setLoading(true)
        const resp = await apiTelegramChannelActivity.getUserInfo({
            invite: params.invite,
        })
        if(resp.success){
            setUserInfo(resp.data)
        }
        setLoading(false)
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
        {userInfo&&<>
            <div className='fission'>
                <img className='f-bg' src={require("@/assets/fission/bg.png")} alt='bg'/>
                <img className='f-logo' src={require("@/assets/fission/logo.png")} alt='logo'/>
                <div className='f-gift' onClick={async ()=>{
                    setLoading(true)
                    const resp = await apiTelegramChannelActivity.listGift({})
                    if(resp.success) {
                        setGiftList(resp.data.list)
                    }
                    setLoading(false)
                }}>
                    <svg t="1752659288567" className="icon" viewBox="0 0 1024 1024" version="1.1"
                         xmlns="http://www.w3.org/2000/svg" p-id="5357" width="200" height="200">
                        <path
                            d="M51.2 102.4a51.2 51.2 0 1 1-51.2 51.2 51.2 51.2 0 0 1 51.2-51.2z m204.8 0h716.8a51.2 51.2 0 0 1 0 102.4H256a51.2 51.2 0 0 1 0-102.4zM51.2 460.8a51.2 51.2 0 1 1-51.2 51.2 51.2 51.2 0 0 1 51.2-51.2z m204.8 0h716.8a51.2 51.2 0 0 1 0 102.4H256a51.2 51.2 0 0 1 0-102.4z m-204.8 358.4a51.2 51.2 0 1 1-51.2 51.2 51.2 51.2 0 0 1 51.2-51.2z m204.8 0h716.8a51.2 51.2 0 0 1 0 102.4H256a51.2 51.2 0 0 1 0-102.4z"
                            fill="#ac6629" p-id="5358"></path>
                    </svg>
                </div>
                {giftList && <>
                    <div className='f-mask' />
                    <div className='f-modal-box'>
                        <div className='f-modal'>
                            <div className='f-modal-content'>
                                {giftList.map((item, index) => {
                                    return <>
                                        <div className='f-modal-content-item'>
                                            <div className={'f-modal-content-item-code'+' '+(item.claimed?'f-modal-content-item-code-gray':'f-modal-content-item-code-green')} onClick={()=>{
                                                navigator.clipboard.writeText(item.code)
                                                    .then(() => {
                                                        Toast.info("copy success")
                                                    })
                                                    .catch(err => {
                                                        Toast.info("copy failed")
                                                    });
                                            }}>
                                                {item.code}
                                            </div>
                                            <div className='f-modal-content-item-time'>
                                                {(()=>{
                                                    let date = new Date(item.create_time * 1000);
                                                    return date.toLocaleString()
                                                })()}
                                            </div>
                                        </div>
                                    </>
                                })}
                            </div>
                        </div>
                        <svg t="1752660675916" className='f-modal-close' onClick={() => {
                            setGiftList(null)
                        }} viewBox="0 0 1024 1024" version="1.1"
                             xmlns="http://www.w3.org/2000/svg" p-id="6604" width="200" height="200">
                            <path
                                d="M512 1024A512 512 0 1 1 512 0a512 512 0 0 1 0 1024zM305.956571 370.395429L447.488 512 305.956571 653.604571a45.568 45.568 0 1 0 64.438858 64.438858L512 576.512l141.604571 141.531429a45.568 45.568 0 0 0 64.438858-64.438858L576.512 512l141.531429-141.604571a45.568 45.568 0 1 0-64.438858-64.438858L512 447.488 370.395429 305.956571a45.568 45.568 0 0 0-64.438858 64.438858z"
                                fill="#ffffff" p-id="6605"></path>
                        </svg>
                    </div>
                </>}
                {redeemModal && <>
                    <div className='f-mask' />
                    <div className='f-modal-redeem'>
                        <svg t="1752660675916" className='f-modal-redeem-close' onClick={() => {
                            setRedeemModal(null)
                        }} viewBox="0 0 1024 1024" version="1.1"
                             xmlns="http://www.w3.org/2000/svg" p-id="6604" width="200" height="200">
                            <path
                                d="M512 1024A512 512 0 1 1 512 0a512 512 0 0 1 0 1024zM305.956571 370.395429L447.488 512 305.956571 653.604571a45.568 45.568 0 1 0 64.438858 64.438858L512 576.512l141.604571 141.531429a45.568 45.568 0 0 0 64.438858-64.438858L576.512 512l141.531429-141.604571a45.568 45.568 0 1 0-64.438858-64.438858L512 447.488 370.395429 305.956571a45.568 45.568 0 0 0-64.438858 64.438858z"
                                fill="#ffffff" p-id="6605"></path>
                        </svg>
                        <video autoPlay muted loop playsInline >
                            <source src="https://static.netshort.online/ActivityFissionGuide.mp4" type="video/mp4"/>
                            Your browser does not support the video tag.
                        </video>
                        <div className='f-modal-redeem-tip'>
                            200🪙<span>&gt;&gt;</span>
                            <svg t="1752663175982" className="icon" viewBox="0 0 1024 1024" version="1.1"
                                 xmlns="http://www.w3.org/2000/svg" p-id="7805" width="200" height="200">
                                <path
                                    d="M169.866782 234.697323c-24.2718 5.89015-40.539298 27.094078-40.612976 53.16792-0.146333 52.051493-0.045025 97.298-0.037862 149.34847 0 1.088798 0.13917 2.191922 0.243546 3.830235 22.469758 0.605797 35.178197 8.527211 50.732452 24.929786 15.693424 16.556071 23.14207 36.458353 22.289655 59.374272-0.668219 18.052145-6.815219 34.138518-18.268062 47.956222-15.857153 19.144012-29.806863 29.480428-54.810326 29.480428h-0.007164c-0.083911 1.926886-0.181125 2.626827-0.184195 3.572362 0 52.211129-0.031722 76.218916 0.059352 128.422881 0.007163 4.136204 0.521886 8.328689 1.346671 12.385075 4.508687 22.220071 21.708418 42.320874 51.832506 42.296315 43.329854-0.055259 78.518285 0.066515 120.67543 0.02763V232.870722c-42.157145 0.014326-78.157058 0.285502-121.890095 0.302898-4.891404 0-6.641257 0.378623-11.368932 1.523703z m719.775161 367.635032c-42.564421-3.047406-64.442708-36.301787-65.503877-78.922491-1.061169-43.034119 22.814612-79.805604 65.3688-81.913614 3.937682-0.194428 5.02341-1.439792 5.016247-5.357008-0.118704-51.414997 0.014326-102.818737-0.107447-154.232711-0.083911-32.708959-17.286712-48.781006-49.758264-48.781006-184.64537-0.017396-322.775334-0.281409-506.742252-0.25378v556.61922c183.966918-0.076748 321.317123-0.201591 505.576707-0.22922 3.966335 0 10.07445 0.007163 13.953803-0.685616 26.630521-4.749164 35.794228-19.457144 35.895535-47.413869 0.188288-51.734268 0.532119-82.059947 0.664125-133.794216 0.016373-3.90903-0.870834-4.78191-4.363377-5.035689z m-159.267377-6.978949c0 15.355733-12.444427 27.806299-27.800159 27.8063H448.337051c-15.352663 0-27.800159-12.450567-27.800159-27.8063v-0.925068c0-15.355733 12.447497-27.800159 27.800159-27.80016h254.237356c15.355733 0 27.800159 12.444427 27.800159 27.80016v0.925068z m-27.719318-139.614781H448.257234c-15.306614 0-27.719318-12.412704-27.719319-27.723411 0-15.310707 12.412704-27.723412 27.719319-27.723412h254.39699c15.310707 0 27.720342 12.412704 27.720342 27.723412 0 15.310707-12.408611 27.723412-27.719318 27.723411z"
                                    fill="#d4237a" p-id="7806"></path>
                            </svg>
                        </div>
                        <div className='f-modal-redeem-btn' onClick={()=>{
                            if(navigator.language.includes("zh-TW")){
                                navigate("/series?series=2")
                            }else {
                                navigate("/series?series=1")
                            }
                        }}>
                            <div className='f-btn-mask' />
                            🔥Go🔥
                        </div>
                    </div>
                </>}
                <div className='f-main'>
                    <div className='f-m-title'>{getText(Text.FissionTitle)}</div>
                    <div className='f-m-time'><span>{getText(Text.FissionTime)}</span></div>
                    <div className='f-m-modal-1'>
                        <div className='f-m-modal-2'>
                            <div className='f-m-modal-title'>🪙{getText(Text.FissionBalance)}🪙</div>
                            <div className='f-balance-modal'>
                                <div className='f-balance-modal-title'>
                                    {getText(Text.FissionBalance)}: {userInfo.balance * 100}
                                </div>
                                <div className='f-balance-modal-btn' onClick={async () => {
                                    setLoading(true)
                                    const resp = await apiTelegramChannelActivity.redeemReward({})
                                    if (resp.success) {
                                        Toast.info(getText(Text.FissionRedeemSuccess))
                                    } else if (resp.err_code === 21002) {
                                        Toast.info(getText(Text.FissionRedeemFailed))
                                    }
                                    setRedeemModal(true)
                                    const infoResp = await apiTelegramChannelActivity.getUserInfo({
                                        invite: params.invite,
                                    })
                                    if (infoResp.success) {
                                        setUserInfo(infoResp.data)
                                    }
                                    setLoading(false)
                                }}>
                                    <div className='f-btn-mask'/>
                                    🔥{getText(Text.FissionRedeem)}🔥
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='f-m-modal-1'>
                        <div className='f-m-modal-2'>
                            <div className='f-m-modal-title'>🪙{getText(Text.FissionLogin)}🪙</div>
                            <div className='f-login-modal'>
                                <div className='f-m-modal-desc'>{getText(Text.FissionLoginTelegramDesc)}</div>
                                {userInfo.name?<>
                                    <div className='f-m-modal-name'>{userInfo.name}</div>
                                    {userInfo.claim_login?<>
                                        <div className='f-m-modal-btn-redeem'>
                                            <div className='f-btn-mask'/>
                                            {getText(Text.FissionClaimed)}
                                            {userInfo.claim_follow && <>
                                                <svg t="1752575628672" className="f-claim-btn-tag" viewBox="0 0 1024 1024" version="1.1"
                                                     xmlns="http://www.w3.org/2000/svg" p-id="4048" width="200" height="200">
                                                    <path
                                                        d="M512 1024a512 512 0 1 1 512-512 512 512 0 0 1-512 512z m296.96-819.2c-213.4528 112.1792-348.8256 448.768-348.8256 448.768L376.832 487.936 204.8 594.7904A725.504 725.504 0 0 1 470.3232 819.2c62.5152-117.76 255.1296-357.9392 348.8768-379.3408-36.4544-85.504-15.36-154.9312-10.24-235.0592z"
                                                        p-id="4049" fill="#1afa29"></path>
                                                </svg>
                                            </>}
                                        </div>
                                    </>:<>
                                        <div className='f-m-modal-btn-unredeem' onClick={async ()=>{
                                            setLoading(true)
                                            const resp = await apiTelegramChannelActivity.claimReward({
                                                tp: "login",
                                            })
                                            if(resp.success){
                                                setUserInfo({...userInfo,claim_login: true})
                                                Toast.info(getText(Text.FissionClaimSuccess))
                                            }
                                            setLoading(false)
                                        }}>
                                            {userInfo.claim_follow && <>
                                                <svg t="1752575628672" className="f-claim-btn-tag" viewBox="0 0 1024 1024" version="1.1"
                                                     xmlns="http://www.w3.org/2000/svg" p-id="4048" width="200" height="200">
                                                    <path
                                                        d="M512 1024a512 512 0 1 1 512-512 512 512 0 0 1-512 512z m296.96-819.2c-213.4528 112.1792-348.8256 448.768-348.8256 448.768L376.832 487.936 204.8 594.7904A725.504 725.504 0 0 1 470.3232 819.2c62.5152-117.76 255.1296-357.9392 348.8768-379.3408-36.4544-85.504-15.36-154.9312-10.24-235.0592z"
                                                        p-id="4049" fill="#1afa29"></path>
                                                </svg>
                                            </>}
                                            <div className='f-btn-mask'/>
                                            🔥{getText(Text.FissionClaim)}🔥
                                        </div>
                                    </>}
                                </>:<>
                                    <LoginButton
                                        botUsername={"netshort002bot"}
                                        buttonSize="medium"
                                        showAvatar={false}
                                        onAuthCallback={async (user) => {
                                            setLoading(true)
                                            const resp = await apiTelegramChannelActivity.bindTelegram({
                                                ...user
                                            })
                                            if(resp.success){
                                                setUserInfo(resp.data)
                                                ss.set("Authorization", resp.data.token)
                                            }
                                            setLoading(false)
                                        }}
                                    />
                                </>}
                            </div>
                        </div>
                    </div>

                    <div className='f-m-modal-1'>
                        <div className='f-m-modal-2'>
                            <div className='f-m-modal-title'>🪙{getText(Text.FissionFollowChannel)}🪙</div>
                            <div className='f-follow-modal'>
                                <div className='f-m-modal-desc'>{getText(Text.FissionFollowChannelDesc)}</div>
                                <div className={userInfo.is_follower ? (userInfo.claim_follow ? 'f-followed-btn' : 'f-claim-btn') : ('f-follow-btn'+' '+(userInfo.name?'can-click':'cannot-click'))} onClick={async ()=>{
                                    if(userInfo.is_follower&&!userInfo.claim_follow) {
                                        setLoading(true)
                                        const resp = await apiTelegramChannelActivity.claimReward({
                                            tp: "follow",
                                        })
                                        if(resp.success){
                                            setUserInfo({...userInfo,claim_follow: true})
                                            Toast.info(getText(Text.FissionClaimSuccess))
                                        }
                                        setLoading(false)
                                    }
                                }}>
                                    <div className='f-btn-mask'/>
                                    {userInfo.is_follower ? (userInfo.claim_follow ? `${getText(Text.FissionFollowed)}` : `🪙${getText(Text.FissionClaim)}🪙`) : `🔥${getText(Text.FissionFollow)}🔥`}
                                    {userInfo.claim_follow && <>
                                        <svg t="1752575628672" className="f-claim-btn-tag" viewBox="0 0 1024 1024" version="1.1"
                                             xmlns="http://www.w3.org/2000/svg" p-id="4048" width="200" height="200">
                                            <path
                                                d="M512 1024a512 512 0 1 1 512-512 512 512 0 0 1-512 512z m296.96-819.2c-213.4528 112.1792-348.8256 448.768-348.8256 448.768L376.832 487.936 204.8 594.7904A725.504 725.504 0 0 1 470.3232 819.2c62.5152-117.76 255.1296-357.9392 348.8768-379.3408-36.4544-85.504-15.36-154.9312-10.24-235.0592z"
                                                p-id="4049" fill="#1afa29"></path>
                                        </svg>
                                    </>}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='f-m-modal-1'>
                        <div className='f-m-modal-2'>
                            <div className='f-m-modal-title'>🪙{getText(Text.FissionInviteFriend)}🪙</div>
                            <div className='f-invite-modal'>
                                <div className='f-m-modal-desc'>{getText(Text.FissionInviteDesc)}</div>
                                <div className='f-invite-btn' onClick={()=>{
                                    window.open(`https://t.me/share/url?url=https://player.netshort.online/#/activity/fission?invite=${userInfo.user_id}`)
                                }}>
                                    <div className='f-btn-mask'/>
                                    🔥{getText(Text.FissionInvite)}🔥
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>}
    </>
}