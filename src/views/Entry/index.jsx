import "./style.less"
import {useNavigate, useParams} from "react-router-dom";
import {useEffect, useRef, useState} from "react";
import {apiDrama, apiUser} from "@/api";
import 'swiper/css';
import {Toast} from "react-vant";
import ss from "good-storage";

export default function () {
    const navigate = useNavigate()
    const {id} = useParams();
    const [drama, setDrama] = useState(null);
    const [modal,setModal] = useState(null)
    const videoRef = useRef(null)
    const imgRef = useRef(null)
    const [login,setLogin] = useState(null);
    const originUID = ss.get("UID","Your UID")
    const [uid,setUID] = useState(originUID)
    const [installModal,setInstallModal] = useState(null)

    async function init() {
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
    return <div className='entry'>
        {modal && <div className='entry-modal'>
            <div className='entry-modal-title'>
                Due to copyright protection, please watch on the app
            </div>
            <div className='entry-modal-btn-box'>
                <div className='entry-modal-pay' onClick={pay}>
                    Pay
                </div>
                <div className='entry-modal-install' onClick={install}>
                    Install
                </div>
            </div>
            <img className='entry-modal-close' src={require("@/assets/close.png")} alt='close' onClick={()=>{
                setModal(null)
            }}/>
        </div>}
        {installModal && <div className='entry-install'>
            <div className='entry-install-text'>Return to the community to enjoy 90% off!</div>
            <div className='entry-install-btn' onClick={install}>Ok!I got it.</div>
            <img className='entry-install-close' src={require("@/assets/close.png")} alt='close' onClick={()=>{
                setInstallModal(false)
            }}/>
        </div>}
        {login && <div className='entry-login'>
            <div className='entry-login-title'>Bind NetShort UID<br/>Claim 100 Bonus<br/>Free to watch</div>
            <img className='entry-login-close' src={require("@/assets/close.png")} alt='close' onClick={() => {
                setLogin(null)
            }}/>
            <input className='entry-login-input' value={uid} onChange={(e) => {
                setUID(e.target.value)
            }}/>
            <div className='entry-login-btn' onClick={async () => {
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
                <div className='entry-login-btn-tip'>Install APP to Get UID</div>
                Bind
            </div>
        </div>}
        {drama && <>
            {/*<div className='entry-activity' onClick={()=>{*/}
            {/*    window.open("https://act.netshort.online", "_blank")*/}
            {/*}}>*/}
            {/*    <img className='entry-activity-background' src={require("@/assets/light.png")} alt='background'/>*/}
            {/*    <img className='entry-activity-content' src={require("@/assets/activity.png")} alt='content'/>*/}
            {/*</div>*/}
            <img className='entry-background' src={drama.source.poster} alt='entry-background'/>
            <div className='entry-title'>
                <img className='entry-logo' src={require("@/assets/logo.png")} alt='entry-logo'/>
                <div className='entry-text' onClick={()=>{
                    setLogin(true)
                }}>login</div>
            </div>
            <div className='entry-show'>
                <div className='entry-show-name'>{drama.source.name}</div>
                {drama.source.video&&!modal ? <>
                    <video ref={videoRef} preload="metadata" controls autoPlay={true} width="300px" onLoadedMetadata={() => {
                        videoRef.current.style.width = "auto"
                    }}>
                        <source src={drama.source.video} type="video/mp4"/>
                        Your browser does not support the video tag.
                    </video>
                </> : <>
                    <img ref={imgRef} className='entry-show-img' src={drama.source.poster} alt='drama' width="300px" onLoadedMetadata={()=>{
                        imgRef.current.style.width = "auto"
                    }}/>
                </>}
            </div>
            {/*<Swiper*/}
            {/*    className='entry-swiper'*/}
            {/*    loop={true}*/}
            {/*    spaceBetween={10}*/}
            {/*    slidesPerView={2}*/}
            {/*    onSlideChange={() => console.log('slide change')}*/}
            {/*    onSwiper={(swiper) => console.log(swiper)}*/}
            {/*    centeredSlides={true}*/}
            {/*    modules={[Pagination, EffectCoverflow]}*/}
            {/*    effect={'coverflow'}*/}
            {/*    coverflowEffect={{*/}
            {/*        rotate: 0,*/}
            {/*        stretch: 0,*/}
            {/*        depth: 200,*/}
            {/*        modifier: 1,*/}
            {/*        scale: 0.8,*/}
            {/*        slideShadows: false,*/}
            {/*    }}*/}
            {/*>*/}
            {/*    {drama.recomments.map((item) => {*/}
            {/*        return <>*/}
            {/*            <SwiperSlide>*/}
            {/*                <img className='swiper-img' src={item.poster} alt={item.name}/>*/}
            {/*            </SwiperSlide>*/}
            {/*        </>*/}
            {/*    })}*/}
            {/*    {drama.recomments.map((item) => {*/}
            {/*        return <>*/}
            {/*            <SwiperSlide>*/}
            {/*                <img className='swiper-img' src={item.poster} alt={item.name}/>*/}
            {/*            </SwiperSlide>*/}
            {/*        </>*/}
            {/*    })}*/}
            {/*    {drama.recomments.map((item) => {*/}
            {/*        return <>*/}
            {/*            <SwiperSlide>*/}
            {/*                <img className='swiper-img' src={item.poster} alt={item.name}/>*/}
            {/*            </SwiperSlide>*/}
            {/*        </>*/}
            {/*    })}*/}
            {/*</Swiper>*/}
            <div className='entry-btn-box'>
                <div className='entry-btn-pay' onClick={pay}>
                    <div className='entry-btn-tip'>
                        Got App
                    </div>
                    Community Exclusive: 90% Off!
                </div>
                <div className='entry-btn-install' onClick={()=>{
                    setInstallModal(true)
                    setTimeout(()=>{
                        install()
                    },3000)
                }}>
                    <div className='entry-btn-tip'>
                        No App
                    </div>
                    Download to Watch More Great Shows
                </div>
            </div>
        </>}
    </div>
}