import "./style.less"
import {useEffect, useState} from "react";
import {apiAdmin} from "@/api";
import {Toast} from "react-vant";

export default function ({seriesId,onClose,dramaList,setDramaList,bak,setBak}){
    async function init(){
        if(seriesId){
            const resp = await apiAdmin.listSeriesDrama({
                series_id: seriesId,
            })
            if(resp.success){
                setDramaList(resp.data.list)
                setBak(resp.data.bak)
            }
        }
    }
    useEffect(() => {
        init()
    }, []);
    return <>
        <div className='series-update'>
            <div className='su-title'>剧单管理-剧目列表</div>
            <textarea className='su-bak' onChange={(e)=>{setBak(e.target.value)}} value={bak} placeholder="备注" />
            <div className='su-list'>
                <div className='su-ul-header'>
                    <ul>
                        <li className='su-ul-index su-ul-index-header'>序号</li>
                        <li className='su-ul-bak su-ul-bak-header'>标题</li>
                        <li className='su-ul-exec su-ul-exec-header'>操作</li>
                    </ul>
                </div>
                <div className='su-ul-body'>
                    {dramaList.map((item, index) => {
                        return <ul className='ul-body'>
                            <li className='su-ul-index su-ul-index-body'>{index + 1}</li>
                            <li className='su-ul-bak su-ul-bak-body'>{item.title}</li>
                            <li className='su-ul-exec su-ul-exec-body'>
                                <div className='su-ul-exec-btn' onClick={() => {
                                    window.open(`https://player.netshort.online/#/?drama=${item.idx}`)
                                }}>
                                    跳转剧目
                                </div>
                                <div className='su-ul-exec-btn' onClick={() => {
                                    const list = dramaList
                                    list.splice(index, 1)
                                    const newDramaList = [...list]
                                    console.log(newDramaList)
                                    setDramaList(newDramaList)
                                }}>
                                    移除剧目
                                </div>
                            </li>
                        </ul>
                    })}
                </div>
            </div>
            <div className='su-ul-bottom'>
                <div className='su-ul-bottom-btn' onClick={async ()=>{
                    const ids = []
                    dramaList.forEach((item, index) => {
                        ids.push(item.id)
                    })
                    const resp = await apiAdmin.createDramaSeries({
                        id: seriesId,
                        bak: bak,
                        names: ids,
                    })
                    if(resp.success) {
                        Toast.info("上传成功")
                    }else {
                        Toast.info("上传失败")
                    }
                }}>确认</div>
                <div className='su-ul-bottom-btn' onClick={onClose}>关闭</div>
            </div>
        </div>
    </>
}