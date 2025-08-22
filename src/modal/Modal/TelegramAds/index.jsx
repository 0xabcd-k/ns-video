import "./style.less"
import {getText} from "@/utils/i18";

export const ModalVersion = "202508221622"

const Text = {
    Title: {
        "en-US": "New feature released",
        "zh-TW": "新功能上線了",
        "ja": "新機能がリリースされました",
        "ko": "새 기능이 출시되었습니다",
    },
    TitleAds: {
        "en-US": "1. Watch ads to unlock a single episode for free",
        "zh-TW": "1. 觀看廣告免費解鎖單劇",
        "ja": "1. 広告を見て単話を無料でアンロック",
        "ko": "1. 광고를 보고 단일 에피소드를 무료로 잠금 해제",
    },
    ContentAds: {
        "en-US": "When watching a paid episode, you can choose to watch three ads to unlock it for free. Note that you must click “Claim Reward” on the ad page for it to count as completing one ad. After completing all three ads, the current episode will play automatically.",
        "zh-TW": "觀看付費劇集時，可以選擇觀看三則廣告，免費解鎖劇集。注意，必須在廣告頁面點擊「領取獎勵」才算完成一則廣告。完成三則廣告後，當前劇集將自動播放。",
        "ja": "有料エピソードを視聴する際、3本の広告を見ることで無料でアンロックできます。注意：広告ページで「報酬を受け取る」をクリックしないと、広告1本の視聴は完了とみなされません。3本の広告をすべて視聴すると、現在のエピソードが自動的に再生されます。",
        "ko": "유료 에피소드를 시청할 때, 세 개의 광고를 보면 무료로 잠금을 해제할 수 있습니다. 주의: 광고 페이지에서 \"보상 받기\"를 클릭해야 한 광고 시청이 완료로 인정됩니다. 세 개의 광고를 모두 완료하면 현재 에피소드가 자동으로 재생됩니다.",
    },
    TitlePayerMax: {
        "en-US": "2. New Payment Channel – PayerMax",
        "zh-TW": "2. 新的支付渠道 – PayerMax",
        "ja": "2. 新しい支払いチャネル – PayerMax",
        "ko": "2. 새로운 결제 채널 – PayerMax",
    },
    ContentPayerMax: {
        "en-US": "PayerMax will intelligently find a payment method based on your country, supporting more countries. If you encounter any issues during payment, please contact customer service @NetshortHelpbot.",
        "zh-TW": "PayerMax 會根據您所在的國家智能為您尋找支付方式，支持的國家更多。如果在支付時發生任何問題，請聯繫客服 @NetshortHelpbot。",
        "ja": "PayerMax は、お客様の国に応じて最適な支払い方法を自動で探し、より多くの国に対応します。支払い中に問題が発生した場合は、カスタマーサービス @NetshortHelpbot にご連絡ください。",
        "ko": "PayerMax는 사용자의 국가에 따라 자동으로 결제 수단을 찾아 더 많은 국가를 지원합니다. 결제 중 문제가 발생하면 고객 서비스 @NetshortHelpbot에 문의하세요.",
    }
}
export default function ({onClose}){
    return <>
        <div className='telegram-ads' style={{maxWidth: '450px'}}>
            <div className='ta-scroll'>
                <div className='ta-title'>
                    {getText(Text.Title)}
                </div>
                <div className='ta-title2'>
                    {getText(Text.TitleAds)}
                </div>
                <img className='ta-img' src={require("@/assets/modal/ads_example.png")} alt='ads'/>
                <div className='ta-content'>
                    {getText(Text.ContentAds)}
                </div>
                <div className='ta-title2'>
                    {getText(Text.TitlePayerMax)}
                </div>
                <img className='ta-img' src={require("@/assets/modal/payermax-example.jpg")} alt='ads'/>
                <div className='ta-content'>
                    {getText(Text.ContentPayerMax)}
                </div>
            </div>
            <img className='ta-close' src={require("@/assets/close.png")} alt='close' onClick={()=>{
                onClose?.()
            }}/>
        </div>
    </>
}