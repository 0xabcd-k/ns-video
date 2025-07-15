import "./style.less"
import {getText,Text} from "@/utils/i18";

export default function (){
    return <>
        <div className='fission'>
            <img className='f-bg' src={require("@/assets/fission/bg.png")} alt='bg'/>
            <img className='f-logo' src={require("@/assets/fission/logo.png")} alt='logo'/>
            <div className='f-main'>
                <div className='f-m-title'>{getText(Text.FissionTitle)}</div>
                <div className='f-m-time'><span>{getText(Text.FissionTime)}</span></div>
                <div className='f-m-modal-1 f-balance'>
                    <div className='f-m-modal-2'>
                        <div className='f-balance-modal'>
                            <div className='f-balance-modal-title'>
                                {getText(Text.FissionBalance)}: 200
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </>
}