import ReactDOM from 'react-dom/client'
import './common.less'
import router from './router'
import {apiAuth} from "@/api";
import ss from "good-storage";
import {getLocalId} from "@/utils";
const rootDom = document.getElementById('root')
const root = ReactDOM.createRoot(rootDom)

getLocalId().then((ans)=> {
    apiAuth.loginDevice({
        device_id: ans
    }).then((resp)=>{
        if(resp.success){
            ss.set("Authorization", resp.data.token)
            root.render(router);
        }
    })
})
