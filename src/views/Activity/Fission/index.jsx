import "./style.less"
import {getText,Text} from "@/utils/i18";
import {useEffect, useState} from "react";
import {apiTelegramChannelActivity} from "@/api";
import {LoginButton} from "@telegram-auth/react";
import {useHashQueryParams} from "@/utils";
import ReactLoading from "react-loading";
import {Toast} from "react-vant";
import ss from "good-storage";

export default function (){
    const [loading,setLoading] = useState(false);
    const params = useHashQueryParams()
    const [userInfo,setUserInfo] = useState(null)
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
                <div className='f-main'>
                    <div className='f-m-title'>{getText(Text.FissionTitle)}</div>
                    <div className='f-m-time'><span>{getText(Text.FissionTime)}</span></div>
                    <div className='f-m-modal-1'>
                        <div className='f-m-modal-2'>
                            <div className='f-m-modal-title'>🪙{getText(Text.FissionBalance)}🪙</div>
                            <div className='f-balance-modal'>
                                <div className='f-balance-modal-title'>
                                    {getText(Text.FissionBalance)}: {userInfo.balance*100}
                                </div>
                                <div className='f-balance-modal-btn'>
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
                                            const resp = await apiTelegramChannelActivity.claimReward({
                                                tp: "login",
                                            })
                                            if(resp.success){
                                                setUserInfo({...userInfo,claim_login: true})
                                                Toast.info(getText(Text.FissionClaimSuccess))
                                            }
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
                                            const resp = await apiTelegramChannelActivity.bindTelegram({
                                                ...user
                                            })
                                            if(resp.success){
                                                setUserInfo(resp.data)
                                                ss.set("Authorization", resp.data.token)
                                            }
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
                                        const resp = await apiTelegramChannelActivity.claimReward({
                                            tp: "follow",
                                        })
                                        if(resp.success){
                                            setUserInfo({...userInfo,claim_follow: true})
                                            Toast.info(getText(Text.FissionClaimSuccess))
                                        }
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