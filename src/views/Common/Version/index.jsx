import "./style.less"
import {Toast} from "react-vant";

export default function (){
    return <>
        <div className='version' style={{maxWidth: "500px"}}>
            Version: {__BUILD_VERSION__}
        </div>
    </>
}