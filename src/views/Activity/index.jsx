import "./style.less"
import {getText,Text} from "@/utils/i18";
import {useNavigate} from "react-router-dom";

export default function (){
    const navigate = useNavigate();
    return <>
        <div className='activity'>
            <div className='a-back' onClick={()=>{
                navigate(-1)
            }}>{getText(Text.Back)}</div>
            <div className='a-box'>
                <div className='a-box-content'>
                    <div className='a-box-title'>{getText(Text.Activity)}</div>
                    {/*<img onClick={()=>{*/}
                    {/*    navigate("/koc")*/}
                    {/*}} className='a-box-item' src={require("@/assets/poster/koc-poster.png")} alt='poster'/>*/}
                    <img onClick={()=>{
                        window.open("https://t.me/netshort001bot/app")
                    }} className='a-box-item' src={require("@/assets/poster/fission-poster.png")} alt='poster'/>
                </div>

            </div>
        </div>
    </>
}