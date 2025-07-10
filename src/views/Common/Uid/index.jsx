import "./style.less"
import {Toast} from "react-vant";

export default function ({uid}){
    return <>
        <div className='uid' onClick={()=>{
            navigator.clipboard.writeText(text)
                .then(() => {
                    Toast.info("copy success")
                })
                .catch(err => {
                    Toast.info("copy failed")
                });
        }}>
            UID: {uid}
        </div>
    </>
}