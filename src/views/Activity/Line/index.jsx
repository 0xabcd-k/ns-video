import "./style.less"
import {getText,Text} from "@/utils/i18";
import {useState} from "react";
import {Toast} from "react-vant";

export default function (){
    const [inputText,setInputText] = useState('')
    const [giftModal,setGiftModal] = useState(null);
    const [couponModal,setCouponModal] = useState(null);
    const [coinModal,setCoinModal] = useState(null);
    const [email,setEmail] = useState(null);
    const [giftList,setGiftList] = useState([
        {
            "type": "coin",
            "num": 500,
            "time": 1721609231,
            "used": true,
        },
        {
            "type": "coupon",
            "num": 1,
            "code": "1234567812345678",
            "time": 1721784027,
            "used": false,
        },
        {
            "type": "coin",
            "num": 500,
            "time": 1721609231,
            "used": false,
        },
        {
            "type": "coupon",
            "num": 1,
            "code": "1234567812345678",
            "time": 1721784027,
            "used": true,
        },
        {
            "type": "coin",
            "num": 500,
            "time": 1721609231,
            "used": true,
        },
        {
            "type": "coupon",
            "num": 1,
            "code": "1234567812345678",
            "time": 1721784027,
            "used": false,
        },
        {
            "type": "coin",
            "num": 500,
            "time": 1721609231,
            "used": false,
        },
        {
            "type": "coupon",
            "num": 1,
            "code": "1234567812345678",
            "time": 1721784027,
            "used": true,
        },
    ])
    return <>
        <div className='line'>
            <img className='line-bg' src={require("@/assets/line/bg.png")} alt='line'/>
            {/*<img className='line-bg2' src={require("@/assets/line/bg2.png")} alt='line'/>*/}
            <div className='line-login'>
                <div className='line-login-btn' onClick={() => {
                    navigate(`/login?drama=${params.drama}`)
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
                <div className='line-gift-btn' onClick={()=>{
                    setGiftModal(true)
                }}>
                    {getText(Text.LineGift)}
                </div>
            </div>
            <div className='line-tip-box'>
                <div className='line-tip'>
                </div>
                <img className='line-tip-icon' src={require("@/assets/line/alarm.png")} alt='icon' />
                <div className='line-tip-text'>{getText(Text.LineTip1)}</div>
            </div>
            {giftModal &&<>
                <div className='line-modal-mask'/>
                <div className='line-gift-modal'>
                    <svg t="1753690585134" onClick={()=>{
                        setGiftModal(null)
                    }} className="line-gift-modal-close" viewBox="0 0 1024 1024" version="1.1"
                         xmlns="http://www.w3.org/2000/svg" p-id="3380" width="200" height="200">
                        <path
                            d="M828.770654 148.714771C641.293737-20.89959 354.184117-19.590868 168.245698 152.630946c-212.062907 196.418185-212.062907 522.329912 0 718.748098 185.93842 172.221815 473.048039 173.520546 660.524956 3.916176 219.435707-198.536117 219.435707-528.054322 0-726.580449z m-121.880976 569.643707c-11.708566 11.708566-30.680039 11.708566-42.388605 0L502.729054 556.586459c-0.659356-0.659356-1.728312-0.659356-2.397659 0L338.609327 718.318517c-11.708566 11.708566-30.680039 11.708566-42.388605 0l-0.039961-0.039961c-11.708566-11.708566-11.708566-30.680039 0-42.388605l161.732059-161.732058c0.659356-0.659356 0.659356-1.728312 0-2.397659L296.1408 350.008195c-11.708566-11.708566-11.708566-30.680039 0-42.388605l0.039961-0.039961c11.708566-11.708566 30.680039-11.708566 42.388605 0l161.772019 161.77202c0.659356 0.659356 1.728312 0.659356 2.397659 0L664.551024 307.539668c11.708566-11.708566 30.680039-11.708566 42.388605 0l0.039961 0.039961c11.708566 11.708566 11.708566 30.680039 0 42.388605L545.15762 511.770224c-0.659356 0.659356-0.659356 1.728312 0 2.397659L706.919649 675.939902c11.708566 11.708566 11.708566 30.680039 0 42.388605l-0.029971 0.029971z"
                            fill="#1c043c" p-id="3381"></path>
                    </svg>
                    <div className='line-gift-modal-content'>
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
                                                    {getText(Text.LineGiftStatus)}: {item.used ? getText(Text.LineGiftStatusAvailable) : getText(Text.LineGiftStatusUsed)}
                                                </div>
                                            </div>
                                        </div>
                                    </>
                            }
                        })}
                    </div>
                </div>
            </>}
            {couponModal && <>
                <div className='line-modal-mask'/>
                <div className='line-coupon-modal'>
                    <div className='line-coupon-content'>
                        <video autoPlay muted loop playsInline >
                            <source src="https://static.netshort.online/ActivityCouponGuide.mp4" type="video/mp4"/>
                            Your browser does not support the video tag.
                        </video>
                        <div className='line-coupon-content-desc'>
                            {getText(Text.LineCouponDesc)}
                        </div>
                    </div>
                    <div className='line-coupon-btn-box'>
                        <div className='line-coupon-btn-close' onClick={()=>{
                            setCouponModal(null)
                        }}>
                            <div className='line-modal-btn-mask'/>
                            {getText(Text.LineClose)}
                        </div>
                        <div className='line-coupon-btn-go' onClick={()=>{
                            if(navigator.language.includes("zh-TW")){
                                navigate("/series?series=2")
                            }else {
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
                        <div className='line-coin-btn-close' onClick={()=>{
                            setCoinModal(null)
                        }}>
                            <div className='line-modal-btn-mask'/>
                            {getText(Text.LineClose)}
                        </div>
                        <div className='line-coin-btn-go' onClick={()=>{
                            window.open("https://netshort.com/base/n/j70Ac9u","_blank")
                        }}>
                            <div className='line-modal-btn-mask'/>
                            {getText(Text.LineGo)}
                        </div>
                    </div>
                </div>
            </>}
            <div className='line-modal'>
                <div className='line-modal-title' style={{marginLeft: '5vw'}}>{getText(Text.LinePointBalance)}: 200
                    <div className='star'>
                        <img className='star-img' src={require("@/assets/line/star.png")} alt='star'/>
                    </div>
                </div>
                <div className='line-modal-redeem-btn' style={{marginTop: '3vh'}}>
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
                    <svg t="1753691747789" onClick={()=>{
                        setCoinModal(true)
                    }} className="question" viewBox="0 0 1024 1024" version="1.1"
                         xmlns="http://www.w3.org/2000/svg" p-id="10567" width="200" height="200">
                        <path
                            d="M514 114.3c-219.9 0-398.8 178.9-398.8 398.9C115.2 733.1 294.1 912 514 912s398.9-178.9 398.9-398.8c-0.1-219.9-179-398.9-398.9-398.9z m13.3 652.3c-33.5 7.3-66.7-13.9-74-47.4-7.3-33.5 13.9-66.7 47.4-74 33.5-7.3 66.7 13.9 74 47.4 7.4 33.5-13.9 66.7-47.4 74z m158.1-320.8c0 60.5-49.2 109.7-109.7 109.7-7.5 0-13.6 6.1-13.6 13.6v36.5h-96.2v-36.5c0-60.5 49.2-109.7 109.7-109.7 7.5 0 13.6-6.1 13.6-13.6v-60.5c0-7.5-6.1-13.6-13.6-13.6H452.4c-7.5 0-13.6 6.1-13.6 13.6v57.6h-96.2v-57.6c0-60.5 49.2-109.7 109.7-109.7h123.3c60.5 0 109.7 49.2 109.7 109.7v60.5z"
                            fill="#1296db" p-id="10568"></path>
                    </svg>
                </div>
                <div className='line-modal-redeem-btn' style={{marginTop: '1vh'}}>
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
                    <svg t="1753691747789" onClick={()=>{
                        setCouponModal(true)
                    }} className="question" viewBox="0 0 1024 1024" version="1.1"
                         xmlns="http://www.w3.org/2000/svg" p-id="10567" width="200" height="200">
                        <path
                            d="M514 114.3c-219.9 0-398.8 178.9-398.8 398.9C115.2 733.1 294.1 912 514 912s398.9-178.9 398.9-398.8c-0.1-219.9-179-398.9-398.9-398.9z m13.3 652.3c-33.5 7.3-66.7-13.9-74-47.4-7.3-33.5 13.9-66.7 47.4-74 33.5-7.3 66.7 13.9 74 47.4 7.4 33.5-13.9 66.7-47.4 74z m158.1-320.8c0 60.5-49.2 109.7-109.7 109.7-7.5 0-13.6 6.1-13.6 13.6v36.5h-96.2v-36.5c0-60.5 49.2-109.7 109.7-109.7 7.5 0 13.6-6.1 13.6-13.6v-60.5c0-7.5-6.1-13.6-13.6-13.6H452.4c-7.5 0-13.6 6.1-13.6 13.6v57.6h-96.2v-57.6c0-60.5 49.2-109.7 109.7-109.7h123.3c60.5 0 109.7 49.2 109.7 109.7v60.5z"
                            fill="#1296db" p-id="10568"></path>
                    </svg>
                </div>
            </div>
            <div className='line-modal'>
                <div className='line-modal-title'>{getText(Text.LineTask)} 100<div className='star'>
                    <img className='star-img' src={require("@/assets/line/star.png")} alt='star'/>
                </div></div>
                <div className='line-modal-text' style={{marginTop: '2vh'}}>{getText(Text.LineFollow)}</div>
                {1===1?<><div className='line-modal-input-box'>
                    <input type='text' onChange={(e)=>{setInputText(e.target.value)}} value={inputText}/>
                    <div className='line-modal-input-btn' onClick={()=>{}}>{getText(Text.LineClaim)}</div>
                </div></>:<>
                    <div className='line-modal-claimed'>{getText(Text.LineClaimed)}</div>
                </>}
            </div>
            <div className='line-modal'>
                <div className='line-modal-title'>{getText(Text.LineTask)} 100 <div className='star'>
                    <img className='star-img' src={require("@/assets/line/star.png")} alt='star'/>
                </div></div>
                <div className='line-modal-text' style={{marginTop: '2vh'}}>{getText(Text.LineShareDesc)}</div>
                <div className='line-modal-share' onClick={()=>{
                    window.open(`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(`https://player.netshort.online/#/activity/line?invite`)}`)
                }}>
                    <div className='line-modal-btn-mask' />
                    {getText(Text.LineInvite)}
                </div>
            </div>
            <div className='line-modal'>
                <div className='line-modal-title'>{getText(Text.LineFollowGroup)}</div>
                <div className='line-modal-text' style={{marginTop: '2vh'}}>{getText(Text.LineGroupDesc)}</div>
                <div className='line-modal-share' onClick={()=>{
                    window.open(`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(`https://player.netshort.online/#/activity/line?invite`)}`)
                }}>
                    <div className='line-modal-btn-mask' />
                    {getText(Text.LineGo)}
                </div>
            </div>
        </div>
    </>
}