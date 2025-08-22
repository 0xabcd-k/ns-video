import "./style.less"
import {useEffect, useState} from "react";
import ss from "good-storage";
import TelegramAds, {ModalVersion} from "@/modal/Modal/TelegramAds";
export default function (){
    const [show,setShow] = useState(false)
    useEffect(() => {
        const modalVersion = ss.get("ModalVersion","0")
        if(Number(modalVersion)<Number(ModalVersion) && window.Telegram?.WebApp?.initDataUnsafe){
            setShow(true)
        }
    }, []);
    return <>
        {show && <TelegramAds onClose={()=>{
            setShow(false)
            ss.set("ModalVersion",ModalVersion)
        }}/>}
    </>
}