import ReactDOM from 'react-dom/client'
import './common.less'
import router from './router'
import {apiAuth} from "@/api";
import ss from "good-storage";
import {getLocalId} from "@/utils";
const rootDom = document.getElementById('root')
const root = ReactDOM.createRoot(rootDom)
const auth = ss.get("Authorization","")
if(process.env.NODE_ENV === "development"){
    await fetch("http://local.netshort.online/param.json", {
        method: 'GET',
    })
        .then(response => response.json())
        .then(data => {
            window.Telegram = {
                WebApp: data
            }
            window.Telegram.WebApp.openLink = (link)=>{
                window.open(link, "_blank");
            }
            window.Telegram.WebApp.openTelegramLink = (link)=>{
                window.open(link, "_blank");
            }
            window.Telegram.WebApp.safeAreaInset = 20
            window.Telegram.WebApp.contentSafeAreaInset = 20
        })
        .catch(error => {});
}
if(auth){
    root.render(router)
}else{
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
}
