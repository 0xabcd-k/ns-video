import "./style.less"
import {useEffect} from "react";

export default function (){
    window.onloadTurnstileCallback = function (){
        const container = document.getElementById('safe-btn')
        turnstile.render(container,{
            sitekey: "0x4AAAAAABmTbMnbhnNWhBbw",
            callback: function (token){
                window.safetoken = token
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