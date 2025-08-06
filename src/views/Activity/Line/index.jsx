import "./style.less"
import {getText,Text} from "@/utils/i18";
import {useEffect, useState} from "react";
import {Toast} from "react-vant";
import ReactLoading from "react-loading";
import {apiAuth, apiLineActivity} from "@/api";
import Uid from "@/views/Common/Uid";
import ss from "good-storage";
import {useNavigate} from "react-router-dom";
import {getSafeTop, useHashQueryParams} from "@/utils";

export default function (){
    const params = useHashQueryParams()
    const [inputText,setInputText] = useState('')
    const [giftModal,setGiftModal] = useState(null);
    const [couponModal,setCouponModal] = useState(null);
    const [coinModal,setCoinModal] = useState(null);
    const [email,setEmail] = useState(null);
    const [giftList,setGiftList] = useState(null)
    const [loading,setLoading] = useState(null)
    const [uid,setUid] = useState(null)

    const [status,setStatus] = useState(null)
    const [inviteInput,setInviteInput] = useState("")

    const [appId,setAPPId] = useState(ss.get("APPUSERID",""))

    const navigate = useNavigate()
    async function init(){
        setLoading(true)
        let line = ""
        const infoResp = await apiAuth.userInfo({})
        if(infoResp?.data?.email){
            line = ss.get("Line","")
            setEmail(infoResp?.data?.email)
        }
        if(infoResp?.data?.user_idx){
            setUid(infoResp?.data?.user_idx)
        }
        const statusResp = await apiLineActivity.getStatus({
            line_idx: line,
        })
        if(statusResp.success){
            setStatus(statusResp.data)
        }
        setLoading(false)
    }
    useEffect(() => {
        init()
    }, []);
    return <>
        <Uid uid={uid}/>
        {loading && <>
            <div className='mask'>
                <div className='loading'>
                    <ReactLoading type="bars" color="#fff"/>
                </div>
            </div>
        </>}
        {status&& <>
            <div className='line'>
                {params.invite && !status.bound && <>
                    <div className='line-modal-mask'/>
                    <div className='line-invite-modal'>
                        <svg t="1753690585134" onClick={() => {
                            window.location.href = '#/activity/line';
                        }} className="line-invite-modal-close" viewBox="0 0 1024 1024" version="1.1"
                             xmlns="http://www.w3.org/2000/svg" p-id="3380" width="200" height="200">
                            <path
                                d="M828.770654 148.714771C641.293737-20.89959 354.184117-19.590868 168.245698 152.630946c-212.062907 196.418185-212.062907 522.329912 0 718.748098 185.93842 172.221815 473.048039 173.520546 660.524956 3.916176 219.435707-198.536117 219.435707-528.054322 0-726.580449z m-121.880976 569.643707c-11.708566 11.708566-30.680039 11.708566-42.388605 0L502.729054 556.586459c-0.659356-0.659356-1.728312-0.659356-2.397659 0L338.609327 718.318517c-11.708566 11.708566-30.680039 11.708566-42.388605 0l-0.039961-0.039961c-11.708566-11.708566-11.708566-30.680039 0-42.388605l161.732059-161.732058c0.659356-0.659356 0.659356-1.728312 0-2.397659L296.1408 350.008195c-11.708566-11.708566-11.708566-30.680039 0-42.388605l0.039961-0.039961c11.708566-11.708566 30.680039-11.708566 42.388605 0l161.772019 161.77202c0.659356 0.659356 1.728312 0.659356 2.397659 0L664.551024 307.539668c11.708566-11.708566 30.680039-11.708566 42.388605 0l0.039961 0.039961c11.708566 11.708566 11.708566 30.680039 0 42.388605L545.15762 511.770224c-0.659356 0.659356-0.659356 1.728312 0 2.397659L706.919649 675.939902c11.708566 11.708566 11.708566 30.680039 0 42.388605l-0.029971 0.029971z"
                                fill="#1c043c" p-id="3381"></path>
                        </svg>
                        <div className='line-invite-modal-title'>
                            {getText(Text.LineWelcome)}
                        </div>
                        <div className='line-invite-modal-desc'>
                            {getText(Text.LineInviteFollowTip)}
                        </div>
                        <div className='line-modal-input-box'>
                            <input type='text' onChange={(e) => {
                                setInviteInput(e.target.value)
                            }} value={inviteInput}/>
                            <div className='line-modal-input-btn' onClick={async () => {
                                setLoading(true)
                                if(!email) {
                                    Toast.info(getText(Text.LinePlsLogin))
                                    setLoading(false)
                                    return
                                }
                                const followResp = await apiLineActivity.follow({
                                    inviter_idx: params.invite,
                                    code: inviteInput,
                                })
                                setInputText("")
                                if (followResp.success) {
                                    let line = ""
                                    ss.set("Line",line)
                                    if (email) {
                                        line = followResp.data.secret
                                    }
                                    const statusResp = await apiLineActivity.getStatus({
                                        line_idx: line,
                                    })
                                    if (statusResp.success) {
                                        setStatus(statusResp.data)
                                    }
                                } else {
                                    switch (followResp.err_code) {
                                        case 61004:
                                            Toast.info(getText(Text.LineAccountFollow))
                                            break;
                                        case 61003:
                                            Toast.info(getText(Text.LineCodeInvalid))
                                            break;
                                        default:
                                            Toast.info(getText(Text.ServerError))
                                            break;
                                    }
                                }
                                setLoading(false)
                            }}>
                                <div className='line-modal-btn-mask'/>
                                {getText(Text.LineClaim)}</div>
                        </div>
                        <div className='line-modal-input-tip'>{getText(Text.LineCodeAgain)}</div>
                    </div>
                </>}
                <img className='line-bg' src={require("@/assets/line/bg.png")} alt='line'/>
                <div style={{marginTop: getSafeTop()}}/>
                <div className='line-login'>
                    <div className='line-login-btn' onClick={() => {
                        navigate(`/login?redirect=${encodeURIComponent(`https://player.netshort.online/#/activity/line?v=1`)}`)
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
                <div className='line-title1'>
                    {getText(Text.LineTitle1)}
                </div>
                <div className='line-title2'>
                    {getText(Text.LineTitle2)}
                </div>
                <div className='line-gift'>
                    <div className='line-gift-btn' onClick={async () => {
                        setLoading(true)
                        if(!email) {
                            Toast.info(getText(Text.LinePlsLogin))
                            setLoading(false)
                            return
                        }
                        const listResp = await apiLineActivity.listGift({})
                        if (listResp.success) {
                            setGiftList(listResp.data.list)
                        }
                        setGiftModal(true)
                        setLoading(false)
                    }}>
                        {getText(Text.LineGift)}
                    </div>
                </div>
                <div className='line-tip-box'>
                    <div className='line-tip'>
                    </div>
                    <img className='line-tip-icon' src={require("@/assets/line/alarm.png")} alt='icon'/>
                    <div className='line-tip-text'>{getText(Text.LineTip1)}</div>
                </div>
                {giftModal && <>
                    <div className='line-modal-mask'/>
                    <div className='line-gift-modal'>
                        <svg t="1753690585134" onClick={() => {
                            setGiftModal(null)
                        }} className="line-gift-modal-close" viewBox="0 0 1024 1024" version="1.1"
                             xmlns="http://www.w3.org/2000/svg" p-id="3380" width="200" height="200">
                            <path
                                d="M828.770654 148.714771C641.293737-20.89959 354.184117-19.590868 168.245698 152.630946c-212.062907 196.418185-212.062907 522.329912 0 718.748098 185.93842 172.221815 473.048039 173.520546 660.524956 3.916176 219.435707-198.536117 219.435707-528.054322 0-726.580449z m-121.880976 569.643707c-11.708566 11.708566-30.680039 11.708566-42.388605 0L502.729054 556.586459c-0.659356-0.659356-1.728312-0.659356-2.397659 0L338.609327 718.318517c-11.708566 11.708566-30.680039 11.708566-42.388605 0l-0.039961-0.039961c-11.708566-11.708566-11.708566-30.680039 0-42.388605l161.732059-161.732058c0.659356-0.659356 0.659356-1.728312 0-2.397659L296.1408 350.008195c-11.708566-11.708566-11.708566-30.680039 0-42.388605l0.039961-0.039961c11.708566-11.708566 30.680039-11.708566 42.388605 0l161.772019 161.77202c0.659356 0.659356 1.728312 0.659356 2.397659 0L664.551024 307.539668c11.708566-11.708566 30.680039-11.708566 42.388605 0l0.039961 0.039961c11.708566 11.708566 11.708566 30.680039 0 42.388605L545.15762 511.770224c-0.659356 0.659356-0.659356 1.728312 0 2.397659L706.919649 675.939902c11.708566 11.708566 11.708566 30.680039 0 42.388605l-0.029971 0.029971z"
                                fill="#1c043c" p-id="3381"></path>
                        </svg>
                        <div className='line-gift-modal-content'>
                            {giftList?.length?<>
                                {giftList.map((item, index) => {
                                    const d = new Date(item.time * 1000)
                                    switch (item.type) {
                                        case "coin":
                                            return <>
                                                <div className='line-gift-modal-item line-gift-modal-item-coin'>
                                                    <div className='line-gift-modal-item-icon-box'>
                                                        <img className='line-gift-modal-item-icon'
                                                             src={require("@/assets/line/n-coin.png")} alt='icon'/>
                                                    </div>
                                                    <div className='line-gift-modal-item-info'>
                                                        <div className='line-gift-modal-item-info-text'>
                                                            {getText(Text.LineClaimTime)}: {d.toLocaleString(navigator.language)}
                                                        </div>
                                                        <div className='line-gift-modal-item-info-text'>
                                                            {getText(Text.LineGiftStatus)}: {item.used ? getText(Text.LineGiftStatusCredited) : getText(Text.LineGiftStatusPending)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        case "coupon":
                                            return <>
                                                <div className='line-gift-modal-item line-gift-modal-item-coupon'
                                                     onClick={() => {
                                                         navigator.clipboard.writeText(item.code)
                                                             .then(() => {
                                                                 Toast.info("copy success")
                                                             })
                                                             .catch(err => {
                                                                 Toast.info("copy failed")
                                                             });
                                                     }}>
                                                    <div className='line-gift-modal-item-tip'>
                                                        {getText(Text.LineGiftClickToCopy)}
                                                    </div>
                                                    <div className='line-gift-modal-item-icon-box'>
                                                        <img className='line-gift-modal-item-icon'
                                                             src={require("@/assets/line/coupon.png")} alt='icon'/>
                                                    </div>
                                                    <div className='line-gift-modal-item-info'>
                                                        <div className='line-gift-modal-item-info-text'>
                                                            {getText(Text.LineClaimTime)}: {d.toLocaleString(navigator.language)}
                                                        </div>
                                                        <div className='line-gift-modal-item-info-text'>
                                                            {getText(Text.LineGiftCode)}: {item.code}
                                                        </div>
                                                        <div className='line-gift-modal-item-info-text'>
                                                            {getText(Text.LineGiftStatus)}: {!item.used ? getText(Text.LineGiftStatusAvailable) : getText(Text.LineGiftStatusUsed)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                    }
                                })}
                            </>:<>
                                <div className='line-gift-modal-empty'>
                                    <svg t="1753856127392" className="icon" viewBox="0 0 1024 1024" version="1.1"
                                         xmlns="http://www.w3.org/2000/svg" p-id="2615" width="88" height="88">
                                        <path
                                            d="M511.23315 512.76685m-511.23315 0a511.23315 511.23315 0 1 0 1022.466301 0 511.23315 511.23315 0 1 0-1022.466301 0Z"
                                            fill="#E8E8E8" p-id="2616"></path>
                                        <path
                                            d="M663.580629 434.036945H362.464304c-3.578632 0-6.646031 2.044933-8.179731 5.112331l-59.303045 106.847728c-1.022466 1.533699-1.022466 3.067399-1.022467 4.601099v129.85322c0 5.112332 4.089865 9.71343 9.71343 9.71343h419.722417c5.112332 0 9.71343-4.089865 9.713429-9.71343v-129.85322c0-1.533699-0.511233-3.067399-1.022466-4.601099l-59.303045-106.847728c-2.556166-3.067399-6.134798-5.112332-9.202197-5.112331zM577.69346 549.575637c-4.601098 0-8.690964 3.578632-9.71343 8.17973-4.089865 26.584124-27.095357 47.544683-55.21318 47.544683s-51.123315-20.449326-55.213181-47.544683c-0.511233-4.601098-4.601098-8.17973-9.713429-8.17973h-112.471293c-7.157264 0-11.758362-7.668497-8.690964-13.803296l40.898652-77.707438c1.533699-3.067399 5.112332-5.112332 8.690964-5.112332h273.509735c3.578632 0 6.646031 2.044933 8.690964 5.112332l40.898652 77.707438c3.578632 6.134798-1.533699 13.803295-8.690964 13.803296H577.69346z m-60.325512-232.099851c5.112332 0 9.71343 4.089865 9.71343 9.71343v49.589616c0 5.112332-4.089865 9.71343-9.71343 9.71343-5.112332 0-9.71343-4.089865-9.71343-9.71343V327.189216c0-5.112332 4.601098-9.71343 9.71343-9.71343z m-132.409386 27.60659c3.578632-3.578632 9.71343-3.578632 13.292062 0l35.275087 35.275088c3.578632 3.578632 3.578632 9.71343 0 13.292062-3.578632 3.578632-9.71343 3.578632-13.292061 0l-35.275088-35.275088c-4.089865-3.578632-4.089865-9.71343 0-13.292062z m210.628058 35.275088l35.275087-35.275088c3.578632-3.578632 9.71343-3.578632 13.292062 0 3.578632 3.578632 3.578632 9.71343 0 13.292062l-35.275087 35.275088c-3.578632 3.578632-9.71343 3.578632-13.292062 0-4.089865-3.578632-4.089865-9.71343 0-13.292062z"
                                            fill="#FFFFFF" p-id="2617"></path>
                                    </svg>
                                    {getText(Text.LineGiftEmpty)}
                                </div>
                            </>}
                        </div>
                    </div>
                </>}
                {couponModal && <>
                    <div className='line-modal-mask'/>
                    <div className='line-coupon-modal'>
                        <div className='line-coupon-content'>
                            <video autoPlay muted loop playsInline>
                                <source src="https://static.netshort.online/ActivityCouponGuide.mp4" type="video/mp4"/>
                                Your browser does not support the video tag.
                            </video>
                            <div className='line-coupon-content-desc'>
                                {getText(Text.LineCouponDesc)}
                            </div>
                        </div>
                        <div className='line-coupon-btn-box'>
                            <div className='line-coupon-btn-close' onClick={() => {
                                setCouponModal(null)
                            }}>
                                <div className='line-modal-btn-mask'/>
                                {getText(Text.LineClose)}
                            </div>
                            <div className='line-coupon-btn-go' onClick={() => {
                                if (navigator.language.includes("zh-TW")) {
                                    navigate("/series?series=2")
                                } else {
                                    navigate("/series?series=1")
                                }
                            }}>
                                <div className='line-modal-btn-mask'/>
                                {getText(Text.LineGo)}
                            </div>
                        </div>
                    </div>
                </>}
                {coinModal && <>
                    <div className='line-modal-mask'/>
                    <div className='line-coin-modal'>
                        <div className='line-coin-content'>
                            <div className='line-coin-content-desc'>
                                {getText(Text.LineCoinDesc)}
                            </div>
                        </div>
                        <div className='line-coin-btn-box'>
                            <div className='line-coin-btn-close' onClick={() => {
                                setCoinModal(null)
                            }}>
                                <div className='line-modal-btn-mask'/>
                                {getText(Text.LineClose)}
                            </div>
                            <div className='line-coin-btn-go' onClick={() => {
                                window.open("https://netshort.com/base/n/j70Ac9u", "_blank")
                            }}>
                                <div className='line-modal-btn-mask'/>
                                {getText(Text.LineGo)}
                            </div>
                        </div>
                    </div>
                </>}
                <div className='line-modal'>
                    <div className='line-modal-title'
                         style={{marginLeft: '5vw'}}>{getText(Text.LinePointBalance)}: {status.balance}
                        <div className='star'>
                            <img className='star-img' src={require("@/assets/line/star.png")} alt='star'/>
                        </div>
                    </div>
                    <div className='line-modal-redeem-btn-box' style={{marginTop: '3vh'}}>
                        <div className='line-modal-redeem-btn' onClick={async () => {
                            setLoading(true)
                            if (!email) {
                                Toast.info(getText(Text.LinePlsLogin))
                                setLoading(false)
                                return
                            }
                            if(!appId){
                                Toast.info(getText(Text.LineAppIdInputAsk))
                                setLoading(false)
                                return
                            }
                            const resp = await apiLineActivity.redeem({
                                type: "coin",
                                uid: appId,
                            })
                            if (resp.success) {
                                const statusResp = await apiLineActivity.getStatus({})
                                if (statusResp.success) {
                                    setStatus(statusResp.data)
                                }
                                Toast.info(getText(Text.LineRedeemSuccess))
                            } else {
                                switch (resp.err_code) {
                                    case 21002:
                                        Toast.info(getText(Text.LineBalanceInsufficient))
                                        break;
                                    default:
                                        Toast.info(getText(Text.ServerError))
                                        break;
                                }
                            }
                            setLoading(false)
                        }}>
                            <span>200</span>
                            <div className='star'>
                                <img className='star-img' src={require("@/assets/line/star.png")} alt='star'/>
                            </div>
                            <svg t="1753432059477" className="icon" viewBox="0 0 1024 1024" version="1.1"
                                 xmlns="http://www.w3.org/2000/svg" p-id="13045" width="200" height="200">
                                <path
                                    d="M885.6850000000001 325.9999999999999l0-74.33300000000001-74.33400000000002 0L811.3510000000001 177.00000000000006l-74.84200000000001 0 0-74.487-74.84200000000001 0L661.667 325.99999999999994l-597.3340000000001 0 0 75.00000000000001L960.3520000000001 401l0-75.00000000000001zM363.018 849.5130000000001l0-149.00000000000003L960.3520000000001 700.513l0-75.00000000000001-896.019 0 0 75.00000000000001L138.9999999999999 700.513l0 74.33400000000002 74.33400000000002 0 0 74.66600000000001 74.84200000000001 0L288.176 924l74.84200000000001 0z"
                                    p-id="13046" fill="#00ffff"></path>
                            </svg>
                            <span>500</span>
                            <img className='coin' src={require("@/assets/line/n-coin.png")} alt='n-coin'/>
                        </div>
                        <svg t="1753691747789" onClick={() => {
                            setCoinModal(true)
                        }} className="question" viewBox="0 0 1024 1024" version="1.1"
                             xmlns="http://www.w3.org/2000/svg" p-id="10567" width="200" height="200">
                            <path
                                d="M514 114.3c-219.9 0-398.8 178.9-398.8 398.9C115.2 733.1 294.1 912 514 912s398.9-178.9 398.9-398.8c-0.1-219.9-179-398.9-398.9-398.9z m13.3 652.3c-33.5 7.3-66.7-13.9-74-47.4-7.3-33.5 13.9-66.7 47.4-74 33.5-7.3 66.7 13.9 74 47.4 7.4 33.5-13.9 66.7-47.4 74z m158.1-320.8c0 60.5-49.2 109.7-109.7 109.7-7.5 0-13.6 6.1-13.6 13.6v36.5h-96.2v-36.5c0-60.5 49.2-109.7 109.7-109.7 7.5 0 13.6-6.1 13.6-13.6v-60.5c0-7.5-6.1-13.6-13.6-13.6H452.4c-7.5 0-13.6 6.1-13.6 13.6v57.6h-96.2v-57.6c0-60.5 49.2-109.7 109.7-109.7h123.3c60.5 0 109.7 49.2 109.7 109.7v60.5z"
                                fill="#1296db" p-id="10568"></path>
                        </svg>
                    </div>
                    <div className='line-modal-redeem-btn-box' style={{marginTop: '1vh'}}>
                        <div className='line-modal-redeem-btn' onClick={async () => {
                            setLoading(true)
                            if (!email) {
                                Toast.info(getText(Text.LinePlsLogin))
                                setLoading(false)
                                return
                            }
                            if(!appId){
                                Toast.info(getText(Text.LineAppIdInputAsk))
                                setLoading(false)
                                return
                            }
                            const resp = await apiLineActivity.redeem({
                                type: "coupon",
                                uid: appId,
                            })
                            if (resp.success) {
                                const statusResp = await apiLineActivity.getStatus({})
                                if (statusResp.success) {
                                    setStatus(statusResp.data)
                                }
                                Toast.info(getText(Text.LineRedeemSuccess))
                            } else {
                                switch (resp.err_code) {
                                    case 21002:
                                        Toast.info(getText(Text.LineBalanceInsufficient))
                                        break;
                                    default:
                                        Toast.info(getText(Text.ServerError))
                                        break;
                                }
                            }
                            setLoading(false)
                        }}>
                            <span>200</span>
                            <div className='star'>
                                <img className='star-img' src={require("@/assets/line/star.png")} alt='star'/>
                            </div>
                            <svg t="1753432059477" className="icon" viewBox="0 0 1024 1024" version="1.1"
                                 xmlns="http://www.w3.org/2000/svg" p-id="13045" width="200" height="200">
                                <path
                                    d="M885.6850000000001 325.9999999999999l0-74.33300000000001-74.33400000000002 0L811.3510000000001 177.00000000000006l-74.84200000000001 0 0-74.487-74.84200000000001 0L661.667 325.99999999999994l-597.3340000000001 0 0 75.00000000000001L960.3520000000001 401l0-75.00000000000001zM363.018 849.5130000000001l0-149.00000000000003L960.3520000000001 700.513l0-75.00000000000001-896.019 0 0 75.00000000000001L138.9999999999999 700.513l0 74.33400000000002 74.33400000000002 0 0 74.66600000000001 74.84200000000001 0L288.176 924l74.84200000000001 0z"
                                    p-id="13046" fill="#00ffff"></path>
                            </svg>
                            <span>1</span>
                            <img className='code' src={require("@/assets/line/coupon.png")} alt='coupon'/>
                        </div>
                        <svg t="1753691747789" onClick={() => {
                            setCouponModal(true)
                        }} className="question" viewBox="0 0 1024 1024" version="1.1"
                             xmlns="http://www.w3.org/2000/svg" p-id="10567" width="200" height="200">
                            <path
                                d="M514 114.3c-219.9 0-398.8 178.9-398.8 398.9C115.2 733.1 294.1 912 514 912s398.9-178.9 398.9-398.8c-0.1-219.9-179-398.9-398.9-398.9z m13.3 652.3c-33.5 7.3-66.7-13.9-74-47.4-7.3-33.5 13.9-66.7 47.4-74 33.5-7.3 66.7 13.9 74 47.4 7.4 33.5-13.9 66.7-47.4 74z m158.1-320.8c0 60.5-49.2 109.7-109.7 109.7-7.5 0-13.6 6.1-13.6 13.6v36.5h-96.2v-36.5c0-60.5 49.2-109.7 109.7-109.7 7.5 0 13.6-6.1 13.6-13.6v-60.5c0-7.5-6.1-13.6-13.6-13.6H452.4c-7.5 0-13.6 6.1-13.6 13.6v57.6h-96.2v-57.6c0-60.5 49.2-109.7 109.7-109.7h123.3c60.5 0 109.7 49.2 109.7 109.7v60.5z"
                                fill="#1296db" p-id="10568"></path>
                        </svg>
                    </div>
                    <div className='line-uid-input-box'>
                        <input value={appId} onChange={(e)=>{
                            setAPPId(e.target.value.replaceAll(" ",""))
                        }} placeholder={getText(Text.LineAppIdInputTip)}/>
                        <div className='line-uid-input-btn' onClick={()=>{
                            console.log(appId)
                            if(appId?.length===19) {
                                ss.set("APPUSERID",appId)
                                Toast.info("Success!")
                            }else {
                                Toast.info(getText(Text.LineAppIdInvalid))
                            }
                        }}>{getText(Text.LineSave)}</div>
                    </div>
                </div>
                <div className='line-modal'>
                    <div className='line-modal-title'>{getText(Text.LineTask)} 100
                        <div className='star'>
                            <img className='star-img' src={require("@/assets/line/star.png")} alt='star'/>
                        </div>
                    </div>
                    <div className='line-modal-text' style={{marginTop: '2vh'}}>{getText(Text.LineFollow)}</div>
                    {!status.bound ? <>
                        <div className='line-modal-input-box'>
                            <input type='text' onChange={(e) => {
                                setInputText(e.target.value)
                            }} value={inputText}/>
                            <div className='line-modal-input-btn' onClick={async () => {
                                setLoading(true)
                                if (!email) {
                                    Toast.info(getText(Text.LinePlsLogin))
                                    setLoading(false)
                                    return
                                }
                                const followResp = await apiLineActivity.followAuthed({
                                    invite_idx: params.invite,
                                    code: inputText,
                                })
                                setInputText("")
                                if (followResp.success) {
                                    const statusResp = await apiLineActivity.getStatus({})
                                    if (statusResp.success) {
                                        setStatus(statusResp.data)
                                    }
                                } else {
                                    switch (followResp.err_code) {
                                        case 61004:
                                            Toast.info(getText(Text.LineAccountFollow))
                                            break;
                                        case 61003:
                                            Toast.info(getText(Text.LineCodeInvalid))
                                            break;
                                        default:
                                            Toast.info(getText(Text.ServerError))
                                            break;
                                    }
                                }
                                setLoading(false)
                            }}>{getText(Text.LineClaim)}</div>
                        </div>
                        <div className='line-modal-input-tip'>{getText(Text.LineCodeAgain)}</div>
                    </> : <>
                        <div className='line-modal-claimed'>{getText(Text.LineClaimed)}</div>
                    </>}
                </div>
                <div className='line-modal'>
                    <div className='line-modal-title'>{getText(Text.LineTask)} 100 <div className='star'>
                        <img className='star-img' src={require("@/assets/line/star.png")} alt='star'/>
                    </div></div>
                    <div className='line-modal-text' style={{marginTop: '2vh'}}>{getText(Text.LineShareDesc)}</div>
                    <div className='line-modal-share' onClick={() => {
                        if (!email) {
                            Toast.info(getText(Text.LinePlsLogin))
                            return
                        }
                        window.open(`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(`https://player.netshort.online/#/activity/line?invite=${uid}`)}`)
                    }}>
                        <div className='line-modal-btn-mask'/>
                        {getText(Text.LineInvite)}
                    </div>
                </div>
                <div className='line-modal'>
                    <div className='line-modal-title'>{getText(Text.LineFollowGroup)}</div>
                    <div className='line-modal-text' style={{marginTop: '2vh'}}>{getText(Text.LineGroupDesc)}</div>
                    <div className='line-modal-share' onClick={() => {
                        switch (navigator.language){
                            case "ja":
                                window.open(`https://api.netshort.online/pay/21`)
                                break;
                            default:
                                window.open(`https://api.netshort.online/pay/22`)
                                break;
                        }
                    }}>
                        <div className='line-modal-btn-mask'/>
                        {getText(Text.LineGo)}
                    </div>
                </div>
            </div>
        </>}
    </>
}