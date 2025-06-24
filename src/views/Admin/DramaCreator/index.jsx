import "./style.less"
import {useState} from "react";

export default function ({onUpload}){
    const [title,setTitle] = useState("")
    const [desc,setDesc] = useState("")
    const [poster ,setPoster] = useState("")
    const [total,setTotal] = useState(0)
    const [free,setFree] = useState(0)
    const [price,setPrice]= useState("0.00")
    const [currency,setCurrency] = useState("USD")
    const [belongName,setBelongName] = useState("")
    const [belongLan,setBelongLan] = useState("en-US")
    const [expireTime,setExpireTime] = useState("")
    return <>
        <div className='drama-creator'>
            <div className='dc-row'>
                <div className='dc-col'>
                    <div className='dc-title'>
                        标题*：
                    </div>
                    <input onChange={(e)=>setTitle(e.target.value)} value={title} placeholder='用户看到的名称'/>
                </div>
                <div className='dc-col'>
                    <div className='dc-title'>
                        介绍*：
                    </div>
                    <textarea className='dc-desc' onChange={(e)=>setDesc(e.target.value)} value={desc} placeholder='用户看到的简介'/>
                </div>
                <div className='dc-col'>
                    <div className='dc-title'>
                        海报*：
                    </div>
                    <input onChange={(e)=>setPoster(e.target.value)} value={poster} placeholder='请输入图片在线链接'/>
                </div>
                {poster&&<img className='dc-poster' src={poster} alt='poster'/>}
            </div>
            <div className='dc-row'>
                <div className='dc-col'>
                    <div className='dc-title'>
                        总集数*：
                    </div>
                    <input type='number' onChange={(e)=>setTotal(e.target.value)} value={total} placeholder='剧目总集数'/>
                </div>
                <div className='dc-col'>
                    <div className='dc-title'>
                        试看集数*：
                    </div>
                    <input type='number' onChange={(e)=>setFree(e.target.value)} value={free} placeholder='剧目试看集数'/>
                </div>
                <div className='dc-col'>
                    <div className='dc-title'>
                        价格*：
                    </div>
                    <input onChange={(e)=>setPrice(e.target.value)} value={price} placeholder='价格'/>
                </div>
                <div className='dc-col'>
                    <div className='dc-title'>
                        币种*：
                    </div>
                    <input onChange={(e)=>setCurrency(e.target.value)} value={currency} placeholder='付款币种'/>
                </div>
                <div className='dc-col'>
                    <div className='dc-title'>
                        购买有效期*：
                    </div>
                    <input onChange={(e)=>setExpireTime(e.target.value)} value={expireTime} placeholder='有效期 单位s'/>
                </div>
                <div className='dc-col'>
                    <div className='dc-title'>
                        归属英文剧名：
                    </div>
                    <input onChange={(e)=>setBelongName(e.target.value)} value={belongName} placeholder='所属剧目'/>
                </div>
                <div className='dc-col'>
                    <div className='dc-title'>
                        语言：
                    </div>
                    <input onChange={(e)=>setBelongLan(e.target.value)} value={belongLan} placeholder='语言'/>
                </div>
            </div>
            <div className='dc-upload' ></div>
        </div>
    </>
}