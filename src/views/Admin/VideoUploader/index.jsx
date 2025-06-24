import "./style.less"
import {useEffect, useState} from "react";
import {apiAdmin} from "@/api";

let uploader;
export default function ({cateId,dramaId}){
    const [filesMap,setFilesMap] = useState(null);
    async function init(){
        uploader = new AliyunUpload.Vod({
            userId: "1876750065462886",
            region: "us-west-1",
            partSize: 1048576,
            parallel: 5,
            retryCount: 3,
            retryDuration: 2,
            onUploadstarted: async function (uploadInfo) {
                const resp = await apiAdmin.createVideo({
                    file_name: uploadInfo.file.name,
                    drama_id: dramaId,
                    cate_id: cateId,
                })
                if(resp.success){
                    uploader.setUploadAuthAndAddress(uploadInfo, resp.data.upload_auth, resp.data.upload_address,resp.data.video_id)
                }
            },
            onUploadSucceed: function (uploadInfo) {},
            onUploadFailed: function (uploadInfo, code, message) {},
            onUploadProgress: function (uploadInfo, totalSize, progress) {
                setFilesMap(prev => {
                    const newMap = new Map(prev || []); // prev 可能是 null
                    newMap.set(uploadInfo.file.name, {
                        Progress: progress,
                        Started: true,
                        File: uploadInfo.file,
                    });
                    console.log("onUploadProgress:file:" + uploadInfo.file.name + ", fileSize:" + totalSize + ", percent:" + Math.ceil(progress * 100) + "%")
                    return newMap;
                });
            },
            onUploadTokenExpired: function (uploadInfo) {},
            onUploadEnd: function (uploadInfo) {},
        })
    }
    useEffect(() => {
        init()
    }, []);
    return <>
        <div className='video-upload'>
            <div className='vu-title'>
                上传剧集
            </div>
            <div className='vu-files'>
                {filesMap&&Array.from(filesMap.entries()).map(([key,value]) => {
                    return <>
                       <div className='vu-f-item'>
                           <div className='vu-f-item-left'>{key}</div>
                           {value.Started ? <div className='vu-f-item-right'>{Math.ceil(value.Progress * 100)}%</div>:
                               <div className='vu-f-item-right'>
                                   <div className='vu-f-item-right-btn' onClick={async ()=>{
                                       const newMap = new Map(filesMap)
                                       newMap.delete(key)
                                       setFilesMap(newMap);
                                   }}>取消</div>
                               </div>
                           }
                       </div>
                   </>
                })}
            </div>
            <div className='vu-upload'>
                <div className='vu-upload-btn'>
                    选择文件
                    <input type='file' id='videoInput' multiple accept='video/*' onChange={async (e)=>{
                        const files = Array.from(e.target.files);
                        const newMap = new Map(filesMap)
                        files.forEach(file => {
                            newMap.set(file.name,{
                                Progress: 0,
                                Started: false,
                                File: file,
                            })
                        })
                        setFilesMap(newMap)
                        e.target.value = null
                    }} />
                </div>
                <div className='vu-confirm-btn' onClick={()=>{
                    const newMap = new Map(filesMap);
                    filesMap&&Array.from(filesMap.entries()).forEach(([key,value]) => {
                        if(!value.Started){
                            uploader.addFile(value.File,null,null,null,null);
                            newMap.set(key,{
                                Progress: 0,
                                Started: true,
                                File: value.File,
                            });
                        }
                    })
                    uploader.startUpload();
                    setFilesMap(newMap)
                }}>
                    确认上传
                </div>
            </div>
        </div>
    </>
}