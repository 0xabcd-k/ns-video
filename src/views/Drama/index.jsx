import "./style.less"
import {useEffect, useRef, useState} from "react";
import {apiDrama} from "@/api";
import {useNavigate} from "react-router-dom";
import ss from "good-storage";
export default function () {
    const videoRef = useRef(null);
    const navigate = useNavigate()
    const [showPlay,setShowPlay] = useState(true)
    const [drama,setDrama] = useState(null)
    async function init(){
        const dramaIdx = ss.get("LikeDrama","")
        const niceDramaResp = await apiDrama.niceDrama({
            idx: dramaIdx
        })
        if(niceDramaResp.success){
            setDrama(niceDramaResp.data)
        }
    }
    useEffect(() => {
        init()
    }, []);
    return <div className='drama' style={drama?{backgroundImage: `url(${drama?.poster})`}:{}}>
        {drama?<>
            <div className='title'>
                <img className='logo' src={require("@/assets/logo.png")} alt='logo'/>
                <div className='text2'>{drama.name}</div>
            </div>
            <video
                ref={videoRef}
                autoPlay={true}
                onEnded={() => {
                    ss.set("LikeDrama",drama.idx)
                    navigate(`/share/${drama.idx}`)
                }}
                onClick={() => {
                    const video = videoRef.current;
                    if (!video) return;
                    if (video.paused) {
                        video.play()?.then(() => {
                            setShowPlay(false)
                        });
                    } else {
                        video.pause()
                        setShowPlay(true)
                    }
                }}
                onLoadedData={() => {
                    const video = videoRef.current;
                    if (!video) return;
                    video.play().then(() => {
                        setShowPlay(false)
                    }).catch(() => {
                        setShowPlay(true)
                    });
                }}
            >
                <source src={drama.video} type="video/mp4"/>
                Your browser does not support the video tag.
            </video>
            <div className='desc'>
                <div className='info'>
                    <div className='title1'>
                        <img src={require('@/assets/netshort.jpg')} alt='icon'/>
                        <div className='text'>
                            Overview:
                        </div>
                    </div>
                    <div className='text3'>
                        {drama.desc}
                    </div>
                </div>
                <div className='btn' onClick={() => {
                    ss.set("LikeDrama",drama.idx)
                    navigate(`/share/${drama.idx}`)
                }}>
                    More
                </div>
            </div>
        </>:<>
            Pls wait...
        </>}
        {showPlay && <div className='play-btn' />}
    </div>
}