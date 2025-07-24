import "./style.less"
import {useEffect} from "react";
import {useNavigate} from "react-router-dom";
import ss from "good-storage";

export default function (){
    const navigate = useNavigate()
    window.onloadTurnstileCallback = function (){
        const container = document.getElementById('safe-btn')
        turnstile.render(container,{
            sitekey: "0x4AAAAAABmTbMnbhnNWhBbw",
            callback: function (token){
                ss.set("Safe",token)
                navigate(-1)
            }
        })
    }
    useEffect(() => {
        const script = document.createElement('script')
        script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onloadTurnstileCallback'
        script.defer = true
        document.body.appendChild(script)
    }, []);
    return <>
        <div id='safe-btn' />
    </>
}