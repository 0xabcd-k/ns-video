import "./style.less"
import {getText,Text} from "@/utils/i18";
import {useNavigate} from "react-router-dom";

export default function (){
    const navigate = useNavigate();
    return <>
        <div className='activity-main' style={{maxWidth: '500px'}}>
            <div className='a-header' style={{maxWidth: '500px'}}>
                <svg t="1754293807822" onClick={()=>{
                    navigate(-1)
                }} className="a-header-back" viewBox="0 0 1024 1024" version="1.1"
                     xmlns="http://www.w3.org/2000/svg" p-id="12170" width="200" height="200">
                    <path
                        d="M370.432 438.144a42.666667 42.666667 0 0 1-54.058667 65.792l-4.138666-3.413333-170.666667-159.189334a42.624 42.624 0 0 1-13.184-36.949333l-0.341333-3.413333 0.085333-5.546667 0.725333-5.333333 1.28-4.736 1.877334-4.736 2.218666-4.181334 2.730667-3.925333 3.541333-4.010667 170.666667-170.666666a42.666667 42.666667 0 0 1 63.872 56.32l-3.541333 4.010666L273.664 256h289.450667C747.306667 256 896 409.258667 896 597.802667c0 178.901333-134.912 293.546667-321.408 298.069333l-11.477333 0.128H281.6a42.666667 42.666667 0 0 1-4.949333-85.034667L281.557333 810.666667h281.6C711.594667 810.666667 810.666667 729.173333 810.666667 597.802667c0-138.752-106.069333-251.264-238.293334-256.298667L563.114667 341.333333H266.666667l103.765333 96.810667z"
                        fill="#cdcdcd" p-id="12171"></path>
                </svg>
            </div>
            <div className='a-box'>
                <div className='a-box-content'>
                    <div className='a-box-title'>{getText(Text.Activity)}</div>
                    {/*<img onClick={()=>{*/}
                    {/*    navigate("/koc")*/}
                    {/*}} className='a-box-item' src={require("@/assets/poster/koc-poster.png")} alt='poster'/>*/}
                    <img onClick={()=>{
                        window.open("https://t.me/netshort001bot/app")
                    }} className='a-box-item' src={require("@/assets/poster/fission-poster.png")} alt='poster'/>
                    <img onClick={()=>{
                        navigate("/activity/line")
                    }} className='a-box-item' src={require("@/assets/poster/line-poster.jpg")} alt='poster'/>
                </div>
            </div>
        </div>
    </>
}