import "./style.less"
import {useState} from "react";
import {Toast} from "react-vant";
import {apiAdmin} from "@/api";

export default function ({type,content,update}){
    const [dbClicked,setDbClicked] = useState(false)
    const [v,setV] = useState(null)
    return <>
        {dbClicked?<>
            <input className='content-edit' type={type} onChange={(e)=>{
                setV(e.target.value)
            }} value={v} onBlur={async ()=>{
                await update(v)
                setDbClicked(false)
            }}/>
        </>:<>
            <div className='content-origin' onDoubleClick={()=>{
                setDbClicked(true)
            }}>
                {content}
            </div>
        </>}
    </>
}