import "./style.less"
import {getText,Text} from "@/utils/i18";
import Item from "@/views/Message/Item";
import {useState} from "react";

export default function (){
    const [modal,setModal] = useState({
        "id": 6,
        "icon": "",
        "title": "test6",
        "text": "test6test6test6test6test6test6test6test6test6test6test6test6test6test6test6test6test6test6test6test6test6test6test6test6test6test6test6test6test6test6test6test6test6test6test6test6test6",
        "link": "https://www.google.com",
        "read": true,
    })
    return <>
        <div className='message'>
            {modal &&<>
                <div className='mask'/>
                <div className='m-modal'>
                    <img className='m-m-close' src={require("@/assets/close.png")} alt='close' onClick={()=>{
                        setModal(null)
                    }}/>
                    {modal.icon?<>
                        <img className='m-m-icon' src={modal.icon} alt='icon'/>
                    </>: <>
                        <svg t="1752206244594" className="icon" viewBox="0 0 1024 1024" version="1.1"
                             xmlns="http://www.w3.org/2000/svg" p-id="9006" width="200" height="200">
                            <path d="M512 512m-512 0a512 512 0 1 0 1024 0 512 512 0 1 0-1024 0Z" fill="#FEB833"
                                  p-id="9007"></path>
                            <path
                                d="M324.408781 655.018925C505.290126 655.018925 651.918244 508.387706 651.918244 327.509463c0-152.138029-103.733293-280.047334-244.329811-316.853972C205.813923 52.463528 47.497011 213.017581 8.987325 415.981977 47.587706 553.880127 174.183098 655.018925 324.408781 655.018925z"
                                fill="#FFFFFF" fill-opacity=".2" p-id="9008"></path>
                            <path
                                d="M512 1024c282.766631 0 512-229.233369 512-512 0-31.765705-2.891385-62.853911-8.433853-93.018889C928.057169 336.0999 809.874701 285.26268 679.824375 285.26268c-269.711213 0-488.357305 218.645317-488.357305 488.357305 0 54.959576 9.084221 107.802937 25.822474 157.10377C300.626556 989.489417 402.283167 1024 512 1024z"
                                fill="#FFFFFF" fill-opacity=".15" p-id="9009"></path>
                            <path
                                d="M732.535958 756.566238c36.389596 0 65.889478-29.499882 65.889477-65.889478 0 36.389596 29.502983 65.889478 65.889478 65.889478-17.053747 0-65.889478 29.502983-65.889478 65.889477 0-36.386495-29.499882-65.889478-65.889477-65.889477zM159.685087 247.279334c25.686819 0 46.51022-20.8234 46.51022-46.51022 0 25.686819 20.8234 46.51022 46.510219 46.51022-12.03607 0-46.51022 20.8234-46.510219 46.510219 0-25.686819-20.8234-46.51022-46.51022-46.510219z"
                                fill="#FFFFFF" fill-opacity=".5" p-id="9010"></path>
                            <path
                                d="M206.195307 333.32324c8.562531 0 15.503407-6.940875 15.503406-15.503407 0 8.562531 6.940875 15.503407 15.503407 15.503407-4.012282 0-15.503407 6.940875-15.503407 15.503406 0-8.562531-6.940875-15.503407-15.503406-15.503406z"
                                fill="#FFFFFF" fill-opacity=".3" p-id="9011"></path>
                            <path
                                d="M787.053687 369.454704c0 2.936345-1.658864 5.62076-4.278941 6.933899L511.741868 511.903104 240.712091 376.388603a7.751703 7.751703 0 0 1-4.285142-6.933899V328.672218c0-12.843797 10.411313-23.25511 23.25511-23.25511h504.119619c12.841472 0 23.252009 10.411313 23.252009 23.25511v40.782486z"
                                fill="#FFFFFF" p-id="9012"></path>
                            <path
                                d="M247.645214 414.278153c-5.154107-2.576666-11.218265 1.171282-11.218265 6.933898v273.93124c0 12.843022 10.411313 23.25511 23.25511 23.25511h504.119619c12.841472 0 23.252009-10.412088 23.252009-23.25511V421.212051c0-5.762616-6.061832-9.510565-11.216715-6.933898L511.741868 546.326868 247.645214 414.278153z"
                                fill="#FFFFFF" p-id="9013"></path>
                        </svg>
                    </>}
                    <div className='m-m-title'>
                        {modal.title}
                    </div>
                    <div className='m-m-content' dangerouslySetInnerHTML={{__html: modal.text}}/>
                    {modal.link&&<div className='m-m-link'>
                        Go
                    </div>}
                </div>
            </>}
            <div className='m-header'>
                <div className='m-h-back' onClick={() => {
                    navigate(-1)
                }}>{getText(Text.Back)}</div>
            </div>
            <div className='m-list'>
                <Item msg={{
                    "id": 6,
                    "icon": "",
                    "title": "test6",
                    "text": "test6test6test6test6test6test6test6test6test6test6test6test6test6test6test6test6test6test6test6test6test6test6test6test6test6test6test6test6test6test6test6test6test6test6test6test6test6",
                    "link": "https://www.google.com",
                    "read": false,
                }}/>
                <Item msg={{
                    "id": 6,
                    "icon": "",
                    "title": "test6",
                    "text": "test6test6test6test6test6test6test6test6test6test6test6test6test6test6test6test6test6test6test6test6test6test6test6test6test6test6test6test6test6test6test6test6test6test6test6test6test6",
                    "link": "https://www.google.com",
                    "read": true,
                }}/>
                <Item msg={{
                    "id": 6,
                    "icon": "",
                    "title": "test6",
                    "text": "test6test6test6test6test6test6test6test6test6test6test6test6test6test6test6test6test6test6test6test6test6test6test6test6test6test6test6test6test6test6test6test6test6test6test6test6test6",
                    "link": "https://www.google.com",
                    "read": true,
                }}/>
            </div>
        </div>
    </>
}