import "./style.less"
import {useEffect, useState} from "react";
import {apiAdmin} from "@/api";

export default function ({onClick,onClose}){
    const [lastId,setLastId] = useState(0);
    const [seriesList,setSeriesList] = useState([])
    const [whereIdx,setWhereIdx] = useState("");
    const [total,setTotal] = useState(0)

    async function getNextSeriesList(){
        const resp = await apiAdmin.listDramaSeries({
            pre_id: lastId,
            page_size: 10,
            where_idx: whereIdx,
        })
        if(resp.success){
            console.log(resp)
            if(resp.data.list?.length){
                setSeriesList([...seriesList,...resp.data.list])
                setLastId(resp.data.last_id)
                setTotal(resp.data.total)
            }
        }
    }
    async function init(){
        await getNextSeriesList()
    }
    useEffect(() => {
        init()
    }, []);
    return <>
        <div className='series-manager'>
            <svg onClick={onClose} t="1750844733291" className="sm-close" viewBox="0 0 1024 1024" version="1.1"
                 xmlns="http://www.w3.org/2000/svg" p-id="2477" width="88" height="88">
                <path
                    d="M512 42.666667a469.333333 469.333333 0 1 0 469.333333 469.333333A469.333333 469.333333 0 0 0 512 42.666667z m0 864a394.666667 394.666667 0 1 1 394.666667-394.666667 395.146667 395.146667 0 0 1-394.666667 394.666667z"
                    p-id="2478"></path>
                <path
                    d="M670.4 300.8l-154.666667 154.666667a5.333333 5.333333 0 0 1-7.573333 0l-154.666667-154.666667a5.333333 5.333333 0 0 0-7.52 0l-45.173333 45.28a5.333333 5.333333 0 0 0 0 7.52l154.666667 154.666667a5.333333 5.333333 0 0 1 0 7.573333l-154.666667 154.666667a5.333333 5.333333 0 0 0 0 7.52l45.28 45.28a5.333333 5.333333 0 0 0 7.52 0l154.666667-154.666667a5.333333 5.333333 0 0 1 7.573333 0l154.666667 154.666667a5.333333 5.333333 0 0 0 7.52 0l45.28-45.28a5.333333 5.333333 0 0 0 0-7.52l-154.666667-154.666667a5.333333 5.333333 0 0 1 0-7.573333l154.666667-154.666667a5.333333 5.333333 0 0 0 0-7.52l-45.28-45.28a5.333333 5.333333 0 0 0-7.626667 0z"
                    p-id="2479"></path>
            </svg>
            <div className='sm-title'>剧单管理</div>
            <div className='sm-list'>
                <div className='sm-ul-header'>
                    <ul>
                        <li className='sm-ul-index sm-ul-index-header'>序号</li>
                        <li className='sm-ul-bak sm-ul-bak-header'>备注</li>
                        <li className='sm-ul-exec sm-ul-exec-header'>操作</li>
                    </ul>
                </div>
                <div className='sm-ul-body'>
                    {seriesList.map((item, index) => {
                        return <ul className='ul-body'>
                            <li className='sm-ul-index sm-ul-index-body'>{item.id}</li>
                            <li className='sm-ul-bak sm-ul-bak-body'>{item.bak}</li>
                            <li className='sm-ul-exec sm-ul-exec-body'>
                                <div className='sm-ul-exec-btn' onClick={() => {
                                    window.open(`https://player.netshort.online/#/series?series=${item.id}`)
                                }}>
                                    跳转剧单
                                </div>
                                <div className='sm-ul-exec-btn' onClick={() => {
                                    onClick(item.id)
                                }}>
                                    管理剧单
                                </div>
                            </li>
                        </ul>
                    })}
                </div>
            </div>
            <div className='sm-ul-bottom'>
                <div className='sm-ul-bottom-btn' onClick={() => {
                    onClick(0)
                }}>新增剧单
                </div>
                <div className='sm-ul-bottom-total'>总共：{total}条</div>
                <div className='sm-ul-bottom-btn' onClick={async ()=>{
                    await getNextSeriesList()
                }}>拉取更多</div>
            </div>
        </div>
    </>
}