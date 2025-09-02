import "./style.less"
import {useState} from "react";

export default function ({data,title,desc}){
    const [showDesc,setShowDesc] = useState(null)
    return <>
        <div className='am-sm-item'>
            <div className='am-sm-item-title' onMouseOver={()=>{
                setShowDesc(true)
            }} onMouseOut={()=>{
                setShowDesc(false)
            }}>
                {title}
                {showDesc && <div className='am-sm-item-title-desc'>
                    {desc}
                </div>}
            </div>
            <div className='am-sm-item-content'>
                {data}
            </div>
        </div>
    </>
}