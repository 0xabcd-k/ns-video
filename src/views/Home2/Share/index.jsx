import "./style.less"
import {getText,Text} from "@/utils/i18";

export default function ({onClose,onClick}){
    return <>
        <div className='share-main'>
            <div className='share-close' onClick={() => {
                onClose?.()
            }}>
                <svg t="1756452154498" className="icon" viewBox="0 0 1024 1024" version="1.1"
                     xmlns="http://www.w3.org/2000/svg" p-id="2344" width="200" height="200">
                    <path
                        d="M865.6 809.6c16 16 16 41.6 0 56-8 8-17.6 11.2-28.8 11.2s-20.8-3.2-28.8-11.2L512 568 214.4 865.6c-8 8-17.6 11.2-28.8 11.2s-20.8-3.2-28.8-11.2c-16-16-16-41.6 0-56L456 512 158.4 214.4c-16-16-16-41.6 0-56 16-16 41.6-16 56 0L512 456 809.6 158.4c16-16 41.6-16 56 0 16 16 16 41.6 0 56L568 512l297.6 297.6z"
                        fill="" p-id="2345"></path>
                </svg>
            </div>
            <div className='share-modal'>
                <div className="heart-wrapper">
                    <svg t="1756456909745" className="heart" viewBox="0 0 1024 1024" version="1.1"
                         xmlns="http://www.w3.org/2000/svg" p-id="3359" width="200" height="200">
                        <path
                            d="M512.042667 193.237333a255.914667 255.914667 0 0 1 351.658666 9.728 256 256 0 0 1 10.069334 351.402667l-361.813334 362.325333-361.728-362.325333a256 256 0 0 1 361.813334-361.130667z"
                            fill="#d4237a" p-id="3360"></path>
                    </svg>
                    <svg t="1756456909745" className="heart" viewBox="0 0 1024 1024" version="1.1"
                         xmlns="http://www.w3.org/2000/svg" p-id="3359" width="200" height="200">
                        <path
                            d="M512.042667 193.237333a255.914667 255.914667 0 0 1 351.658666 9.728 256 256 0 0 1 10.069334 351.402667l-361.813334 362.325333-361.728-362.325333a256 256 0 0 1 361.813334-361.130667z"
                            fill="#d4237a" p-id="3360"></path>
                    </svg>
                    <svg t="1756456909745" className="heart" viewBox="0 0 1024 1024" version="1.1"
                         xmlns="http://www.w3.org/2000/svg" p-id="3359" width="200" height="200">
                        <path
                            d="M512.042667 193.237333a255.914667 255.914667 0 0 1 351.658666 9.728 256 256 0 0 1 10.069334 351.402667l-361.813334 362.325333-361.728-362.325333a256 256 0 0 1 361.813334-361.130667z"
                            fill="#d4237a" p-id="3360"></path>
                    </svg>
                    <svg t="1756456909745" className="heart" viewBox="0 0 1024 1024" version="1.1"
                         xmlns="http://www.w3.org/2000/svg" p-id="3359" width="200" height="200">
                        <path
                            d="M512.042667 193.237333a255.914667 255.914667 0 0 1 351.658666 9.728 256 256 0 0 1 10.069334 351.402667l-361.813334 362.325333-361.728-362.325333a256 256 0 0 1 361.813334-361.130667z"
                            fill="#d4237a" p-id="3360"></path>
                    </svg>
                </div>
                <div className='share-box' onClick={() => {
                    onClick?.()
                }}>
                    <div className='share-content'>
                        <div className='share-text'>{getText(Text.ShareDesc)}</div>
                        <div className='share-btn'>{getText(Text.Share)}</div>
                    </div>
                    <div className='share-img'>
                        <img src={require("@/assets/share.png")} alt='share'/>
                    </div>
                </div>
            </div>
        </div>
    </>
}