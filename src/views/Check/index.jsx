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
                console.log(token)
                ss.set("Safe",token)
                navigate(-1)
            }
        })
    }
    useEffect(() => {
        setTimeout(()=>{
            if(window.__cloudflare_loading === "loading"){
                return
            }
            window.__cloudflare_loading = "loading";
            (()=>{
                const existingScript = document.querySelector('script[src^="https://challenges.cloudflare.com/turnstile/v0/api.js"]');
                if (existingScript) {
                    return;
                }
                console.log("run")
                // 脚本不存在，创建并加载
                const script = document.createElement('script');
                script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onloadTurnstileCallback';
                script.defer = true;
                script.async = true;
                document.body.appendChild(script);
            })()
            window.__cloudflare_loading = "";
        },1000)
    }, []);
    return <>
        <div id='safe-btn' />
    </>
}