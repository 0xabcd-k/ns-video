import "./style.less"
import {getText,Text} from "@/utils/i18";
import {useEffect} from "react";
import {Toast} from "react-vant";
import { useMediaQuery } from 'react-responsive';

export default function (){
    const isMobile = useMediaQuery({ maxWidth: 767 });
    function addCopy(){
        const elements = document.querySelectorAll(".copy");
        const handleClick = (e)=>{
            const text = e.target.innerText || e.target.textContent;
            navigator.clipboard.writeText(text).then(()=>{
                Toast.info("Copied!");
            }).catch(err=>{
                Toast.info("Failed to copy:",err)
            })
        }
        elements.forEach(el=>el.addEventListener("click", handleClick));
    }
    useEffect(() => {
        addCopy();
    }, []);
    function content(){
        return <div className='koc'>
            <img className='koc-log' src={require("@/assets/koc/logo.png")} alt='logo'/>
            <div className='koc-main'>
                <div className='km-top'>
                    <div className='km-t-title' dangerouslySetInnerHTML={{__html: getText(Text.KocTitle)}} />
                    <div className='km-t-content' dangerouslySetInnerHTML={{__html: getText(Text.KocContent)}} />
                    <div className='km-t-time'>{getText(Text.KocTime)}</div>
                </div>
                <div className='bg-1'/>
                <img className='bg-star' src={require("@/assets/koc/star.png")} alt='star'/>
                <img className='bg-fire-1' src={require("@/assets/koc/fire.png")} alt='fire-1'/>
                <img className='bg-fire-2' src={require("@/assets/koc/fire.png")} alt='fire-2'/>
                <img className='bg-gift' src={require("@/assets/koc/gift.png")} alt='gift'/>
                <div className='bg-modal'>
                    <div className='bg-modal-1'>
                        <div className='bg-modal-title'>{getText(Text.KocEnterHowToEnter)}</div>
                        <div className='bg-modal-line bg-modal-line-first'>
                            <div className='bg-modal-dot' />
                            <div className='bg-modal-text' dangerouslySetInnerHTML={{__html: getText(Text.KocEnterTip1)}}/>
                        </div>
                        <div className='bg-modal-line'>
                            <div className='bg-modal-dot' />
                            <div className='bg-modal-text' dangerouslySetInnerHTML={{__html: getText(Text.KocEnterTip2)}}/>
                        </div>
                        <div className='bg-modal-line'>
                            <div className='bg-modal-dot' />
                            <div className='bg-modal-text' dangerouslySetInnerHTML={{__html: getText(Text.KocEnterTip3)}}/>
                        </div>
                        <div className='bg-modal-line'>
                            <div className='bg-modal-dot' />
                            <div className='bg-modal-text' dangerouslySetInnerHTML={{__html: getText(Text.KocEnterTip4)}}/>
                        </div>
                        <div className='bg-modal-btn-box'>
                            <div className='bg-modal-btn' onClick={()=>{
                                const userLang = navigator.language;
                                if(userLang.includes("zh-TW")) {
                                    window.open("https://forms.gle/pB8pn7QNGQuc541MA","_blank")
                                }else{
                                    window.open("https://forms.gle/3izrveWoVkv3PsmQ9","_blank")
                                }
                            }}>
                                {getText(Text.KocEnterBtn)}
                            </div>
                        </div>
                    </div>
                    <div className='bg-modal-1'>
                        <div className='bg-modal-title'>{getText(Text.KocVideoDemandTitle)}</div>
                        <div className='bg-modal-line bg-modal-line-first'>
                            <div className='bg-modal-dot' />
                            <div className='bg-modal-text' dangerouslySetInnerHTML={{__html: getText(Text.KocVideoDemandTip1)}}/>
                        </div>
                        <div className='bg-modal-line'>
                            <div className='bg-modal-dot' />
                            <div className='bg-modal-text' dangerouslySetInnerHTML={{__html: `${getText(Text.KocTextDemandTitle)}<br/>${getText(Text.KocTextDemandTip1)}<br/>${getText(Text.KocTextDemandTip2)}<br/><br/>${getText(Text.KocHashTagTitle)}<br/><br/>${getText(Text.KocHashTagTip1)}<br/>${getText(Text.KocHashTagTip2)}<br/><br/>${getText(Text.KocHashTagTip3)}<br/><br/>${getText(Text.KocHashTagTip4)}<br/><br/>${getText(Text.KocHashTagTip5)}<br/><br/>${getText(Text.KocHashTagTip6)}`}}/>
                        </div>
                    </div>
                    <div className='bg-modal-1'>
                        <div className='bg-modal-title'>{getText(Text.KocContentTitle)}</div>
                        <div className='bg-modal-line bg-modal-line-first'>
                            <div className='bg-modal-dot' />
                            <div className='bg-modal-text' dangerouslySetInnerHTML={{__html: getText(Text.KocContentTip1)}}/>
                        </div>
                        <div className='bg-modal-line'>
                            <div className='bg-modal-dot' />
                            <div className='bg-modal-text' dangerouslySetInnerHTML={{__html: getText(Text.KocContentTip2)}}/>
                        </div>
                        <div className='bg-modal-btn-box'>
                            <div className='bg-modal-btn' onClick={()=>{
                                window.open("https://drive.google.com/drive/folders/1kLtgA67H7Hnzcb6cVsWGVN4OxnDCvj_5?usp=sharing","_blank")
                            }}>
                                {getText(Text.KocContentBtn)}
                            </div>
                        </div>
                    </div>
                    <div className='bg-modal-1'>
                        <div className='bg-modal-title'>{getText(Text.KocCreateTitle)}</div>
                        <div className='bg-modal-line bg-modal-line-first'>
                            <div className='bg-modal-dot' />
                            <div className='bg-modal-text' dangerouslySetInnerHTML={{__html: getText(Text.KocCreateTip1)}}/>
                        </div>
                        <div className='bg-modal-line'>
                            <div className='bg-modal-dot' />
                            <div className='bg-modal-text' dangerouslySetInnerHTML={{__html: getText(Text.KocCreateTip2)}}/>
                        </div>
                        <div className='bg-modal-line'>
                            <div className='bg-modal-dot' />
                            <div className='bg-modal-text' dangerouslySetInnerHTML={{__html: getText(Text.KocCreateTip3)}}/>
                        </div>
                    </div>
                    <div className='bg-modal-1'>
                        <div className='bg-modal-title'>{getText(Text.KocBonusAlertTitle)}</div>
                        <div className='bg-modal-line bg-modal-line-first'>
                            <div className='bg-modal-dot' />
                            <div className='bg-modal-text' dangerouslySetInnerHTML={{__html: getText(Text.KocBonusAlertTip1)}}/>
                        </div>
                    </div>
                    <div className='bg-modal-1'>
                        <div className='bg-modal-line'>
                            <div className='bg-modal-dot' />
                            <div className='bg-modal-text' dangerouslySetInnerHTML={{__html: getText(Text.KocFinish)}}/>
                        </div>
                        <div className='bg-modal-btn-box'>
                            <div className='bg-modal-btn' onClick={()=>{
                                if(navigator.language.includes("zh-TW")) {
                                    window.open("https://line.me/ti/p/gD_uNtNDs-","_blank")
                                }else {
                                    window.open("https://t.me/NetshortHelpbot")
                                }
                            }}>
                                {getText(Text.KocDMUs)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    }
    return <>
        {isMobile ? <>
            {content()}
        </>:<>
            <div style={{height: '100vh',width: '700px',display: 'flex',justifyContent: 'center',alignItems: 'center'}}>
                {content()}
            </div>
        </>}
    </>
}