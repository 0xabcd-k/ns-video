import "./style.less"
import {useEffect, useRef, useState} from "react";
import {apiDrama, apiUser} from "@/api";
import {useParams} from "react-router-dom";
import ss from "good-storage";
import {Toast} from "react-vant";

export default function (){
    const {id} = useParams();
    const [drama, setDrama] = useState(null);
    const videoRef = useRef(null)
    const imgRef = useRef(null)
    const originUID = ss.get("UID","Your UID")
    const [uid,setUID] = useState(originUID)
    const [login,setLogin] = useState(null);
    const [installModal,setInstallModal] = useState(null)
    const [videoRunningModal,setVideoRunningModal] = useState(null)
    const [endModal,setEndModal] = useState(null)

    async function init(){
        const dramaResp = await apiDrama.dramaRecommend({idx: id})
        if (dramaResp.success) {
            setDrama(dramaResp.data)
        }
    }
    async function pay(){
        if(drama){
            window.open(drama.source.pay)
        }
    }
    async function install(){
        if(drama){
            window.open(drama.source.install, "_blank")
        }
    }
    useEffect(() => {
        init()
    }, []);
    return <>
        <div className='main'>
            <div className='m-header'>
                <img className='m-h-logo' src={require("@/assets/main/logo.png")} alt='m-h-logo'/>
                <div className='m-h-login' onClick={()=>{
                    setLogin(true)
                }}>login</div>
            </div>
            {drama&& <>
                <div className='m-show' style={{background: `url("${drama.source.poster}") no-repeat center top`}}>
                    <div className='m-s-blur'/>
                    <div className='m-s-title'>
                        {drama.source.name}
                        <div className='m-s-line'/>
                    </div>
                    <div className='m-s-box' onClick={()=>{
                        if(videoRef.current.paused) {
                            console.log("play")
                            videoRef.current.play()
                        }else {
                            console.log("pause")
                            videoRef.current.pause()
                        }
                    }}>
                        {!videoRunningModal && <>
                            <img className='m-s-c-pause' src={require("@/assets/main/m-s-c-pause.png")} alt='m-s-c-pause'/>
                        </>}
                        {drama.source.video ? <>
                            <video className='m-s-content' style={{maxWidth:"400px"}} ref={videoRef} preload="metadata" controls autoPlay={true} width="300px" onLoadedMetadata={() => {
                                videoRef.current.style.width = "auto"
                            }} onPlay={()=>{
                                setVideoRunningModal(true)
                            }} onPause={()=>{
                                setVideoRunningModal(null)
                            }} onEnded={()=>{
                                setEndModal(true)
                            }}>
                                <source src={drama.source.video} type="video/mp4"/>
                                Your browser does not support the video tag.
                            </video>
                        </> : <>
                            <img ref={imgRef} className='m-s-content' src={drama.source.poster} alt='drama' width="300px" onLoadedMetadata={()=>{
                                imgRef.current.style.width = "auto"
                            }}/>
                        </>}
                    </div>
                </div>
                <div className='m-btn-box'>
                    <div className='m-btn-pay' onClick={pay}>
                        <div className='m-btn-tip m-btn-tip-pay'>
                            <span>Existing user</span>
                        </div>
                        <div className='m-btn-pay-text'>
                            <div className='m-btn-pay-desc'>Group Exclusive:</div>
                            <div className='m-btn-pay-discount'>🔥90% Off!</div>
                        </div>
                    </div>
                    <div className='m-btn-install' onClick={()=>{
                        setInstallModal(true)
                        setTimeout(()=>{
                            install()
                        },3000)
                    }}>
                        <div className='m-btn-tip m-btn-tip-install'>
                            <span>New to APP</span>
                        </div>
                        Download to Watch More Great Shows
                    </div>
                </div>
            </>}
            {installModal && <>
                <div className='m-mask'/>
                <div className='m-modal m-modal-install'>
                    <div className='m-m-install-title'>🔥Enjoy 90% OFF！</div>
                    <div className='m-m-install-desc'>Grab it in the group after app install！</div>
                    <div className='m-m-install-btn' onClick={install}>Ok!l got it.</div>
                    <img className='m-m-close' src={require("@/assets/main/m-modal-close.png")} alt='close' onClick={()=>{
                        setInstallModal(null)
                    }}/>
                </div>
            </>}
            {login && <>
                <div className='m-mask'/>
                <div className='m-modal m-modal-login'>
                    <div className='m-m-login-title'>Bind NetShort UID Claim 100 Bonus Free to watch</div>
                    <input className='m-m-login-input' value={uid} onChange={(e) => {
                        setUID(e.target.value)
                    }} onClick={()=>{
                        if(uid==="Your UID"){
                            setUID("")
                        }
                    }}/>
                    <div className='m-m-login-btn-box' onClick={async ()=>{
                        if (uid?.trim()?.length !== 19) {
                            Toast.info("wrong uid")
                        }
                        const bindResp = await apiUser.bind({
                            uid: uid
                        })
                        if(bindResp.success){
                            Toast.info("bind success, the reward will be credited to your account shortly")
                            ss.set("UID",uid)
                        }else{
                            Toast.info("wrong uid")
                        }
                    }}>
                        <div className='m-m-login-btn-main'>Bind</div>
                        <div className='m-m-login-btn-tip'>Install APP to Get UID</div>
                    </div>
                    <img className='m-m-close' src={require("@/assets/main/m-modal-close.png")} alt='close' onClick={()=>{
                        setLogin(null)
                    }}/>
                </div>
            </>}
            {endModal && <>
                <div className='m-mask'/>
                <div className='m-modal m-modal-end'>
                    <div className='m-m-end-title'>Want to watch the full HD official version?</div>
                    <div className='m-m-end-btn-box'>
                        <div className='m-m-end-btn-pay' onClick={pay}>Existing user</div>
                        <div className='m-m-end-btn-install' onClick={() => {
                            setInstallModal(true)
                            setTimeout(() => {
                                install()
                            }, 3000)
                        }}>New to APP
                        </div>
                    </div>
                    <img className='m-m-close' src={require("@/assets/main/m-modal-close.png")} alt='close'
                         onClick={() => {
                             setEndModal(null)
                         }}/>
                </div>
            </>}
        </div>
    </>
}