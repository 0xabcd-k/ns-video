import "./style.less"
import {useHashQueryParams} from "@/utils";
import {Toast} from "react-vant";

export default function (){
    const params = useHashQueryParams();
    return <>
        <div className='fd-main' style={{maxWidth: '500px'}}>
            <div className='fd-header' style={{maxWidth: '500px'}}>
                <img className='fd-header-logo' src={require("@/assets/main/logo.png")} alt='logo'/>
            </div>
            <div className='fd-info'>
                Your identity information has been cleared. The confirmation code is:<br/>
                <span onClick={()=>{
                    navigator.clipboard.writeText(params.code)
                        .then(() => {
                            Toast.info("copy success")
                        })
                        .catch(err => {
                            Toast.info("copy failed")
                        });
                }}>{params.code}</span>
            </div>
        </div>
    </>
}