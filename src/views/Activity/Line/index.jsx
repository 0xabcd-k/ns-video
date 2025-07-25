import "./style.less"
import {getText,Text} from "@/utils/i18";
import {useState} from "react";

export default function (){
    const [inputText,setInputText] = useState('')
    return <>
        <div className='line'>
            <img className='line-bg' src={require("@/assets/line/bg.png")} alt='line'/>
            {/*<img className='line-bg2' src={require("@/assets/line/bg2.png")} alt='line'/>*/}
            <div className='line-title1'>
                {getText(Text.LineTitle1)}
            </div>
            <div className='line-title2'>
                {getText(Text.LineTitle2)}
            </div>
            <div className='line-gift'>
                <div className='line-gift-btn'>
                    {getText(Text.LineGift)}
                </div>
            </div>
            <div className='line-tip-box'>
                <div className='line-tip'>
                </div>
                <img className='line-tip-icon' src={require("@/assets/line/alarm.png")} alt='icon' />
                <div className='line-tip-text'>{getText(Text.LineTip1)}</div>
            </div>
            <div className='line-modal'>
                <div className='line-modal-title' style={{marginLeft: '5vw'}}>{getText(Text.LinePointBalance)}: 200<div className='star'>
                    <img className='star-img' src={require("@/assets/line/star.png")} alt='star'/>
                </div></div>
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
                    <svg t="1753432326100" className="code" viewBox="0 0 1024 1024" version="1.1"
                             xmlns="http://www.w3.org/2000/svg" p-id="15826" width="200" height="200">
                    <path
                        d="M195.30666667 869.76L39.04 171.30666667l301.65333333-54.08-18.13333333 79.14666666-194.56 33.06666667 100.37333333 485.33333333zM828.16 989.33333333L232.21333333 876.48 391.57333333 34.66666667l595.94666667 112.74666666-159.36 841.92zM319.46666667 817.06666667l449.17333333 85.01333333L900.26666667 206.82666667l-449.17333334-85.01333334L319.46666667 817.06666667z"
                        fill="#FF9F06" p-id="15827"></path>
                    <path d="M478.62933333 457.42613333L517.312 252.39466667l73.37493333 13.8432-38.68266666 205.0304z"
                          fill="#FF9F06" p-id="15828"></path>
                    <path
                        d="M695.86346667 316.81813333l6.4704-28.8288 104.07466666 23.36-6.4704 28.8288zM685.09866667 365.24586667l6.4704-28.8288 104.07466666 23.36-6.4704 28.8288zM673.70026667 412.86186667l6.47146666-28.8288 104.07466667 23.36-6.47146667 28.8288zM663.77706667 460.69866667l6.4704-28.8288 104.07466666 23.36-6.4704 28.8288zM651.7728 510.14506667l6.4704-28.82773334 104.07466667 23.36-6.4704 28.8288zM640.58026667 560.04373333l6.47146666-28.8288 104.07466667 23.36-6.47146667 28.8288zM630.8832 608.47146667l6.4704-28.8288 104.07466667 23.36-6.4704 28.8288zM619.50826667 655.984l6.4704-28.8288 104.07466666 23.36-6.4704 28.8288zM609.45706667 703.9008l6.4704-28.8288 104.07466666 23.36-6.4704 28.8288zM598.54293333 753.24373333l6.47146667-28.8288 104.07466667 23.36-6.47146667 28.8288z"
                        fill="#F7931E" p-id="15829"></path>
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
                <div className='line-modal-title'>{getText(Text.LineTask)} 50 <div className='star'>
                    <img className='star-img' src={require("@/assets/line/star.png")} alt='star'/>
                </div></div>
                <div className='line-modal-share' onClick={()=>{
                    window.open(`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(`https://player.netshort.online/#/activity/line?invite`)}`)
                }}>
                    <div className='line-modal-btn-mask'>

                    </div>
                    {getText(Text.LineInvite)}
                </div>
            </div>
        </div>
    </>
}