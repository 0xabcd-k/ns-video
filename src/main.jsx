import ReactDOM from 'react-dom/client'
import './common.less'
import router from './router'
import {apiAuth} from "@/api";
import ss from "good-storage";
import {getLocalId} from "@/utils";
import {Toast} from "react-vant";
import {getText, Text} from "@/utils/i18";
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
            window.Telegram.WebApp.safeAreaInset = {top: 20}
            window.Telegram.WebApp.contentSafeAreaInset = {top: 20}
        })
        .catch(error => {});
}
if(window.location.hash.split('?')[0] === '#/'){
    if(window.Telegram?.WebApp?.initDataUnsafe?.start_param){
        window.location.hash = "#/"+window.Telegram.WebApp.initDataUnsafe.start_param.replace("-", "?")
    }
}
if(auth){
    root.render(router)
}else if (window.Telegram?.WebApp?.initDataUnsafe?.user){
    const resp = await apiAuth.loginTelegramDirect({...window.Telegram.WebApp.initDataUnsafe.user,hash:window.Telegram.WebApp.initDataUnsafe.hash,auth_date: Number(window.Telegram.WebApp.initDataUnsafe.auth_date)})
    if(resp.success) {
        ss.set("Authorization", resp.data.token)
    }else {
        Toast.info(getText(Text.LoginFail))
    }
    root.render(router);
}else {
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
