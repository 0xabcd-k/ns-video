import {useEffect} from "react";

let uploader;
export default function (){
    async function getVideoDuration(file){
        return new Promise((resolve, reject) => {
            const video = document.createElement('video');
            video.preload = 'metadata';

            video.onloadedmetadata = () => {
                URL.revokeObjectURL(video.src);
                resolve(video.duration);
            };

            video.onerror = () => {
                reject(new Error(`无法读取 ${file.name}`));
            };

            video.src = URL.createObjectURL(file);
        });
    }
    async function init(){
        uploader = new AliyunUpload.Vod({
            userId: "1876750065462886",
            region: "us-west-1",
            partSize: 1048576,
            parallel: 5,
            retryCount: 3,
            retryDuration: 2,
            onUploadstarted: async function (uploadInfo) {
                let duration = await getVideoDuration(uploadInfo.file);
            },
            onUploadSucceed: function (uploadInfo) {},
            onUploadFailed: function (uploadInfo, code, message) {},
            onUploadProgress: function (uploadInfo, totalSize, loadedPercent) {},
            onUploadTokenExpired: function (uploadInfo) {},
            onUploadEnd: function (uploadInfo) {},
        })
    }
    useEffect(() => {
        init()
    }, []);
    return <>
        <input type='file' id='videoInput' multiple accept='video/*' onChange={async (e)=>{
            const files = Array.from(e.target.files);
            for (let i = 0; i < e.target.files.length; i++) {
                uploader.addFile(e.target.files[i],null,null,null,null);
            }
            uploader.startUpload();
            // console.log(files);
            // const promises  = files.map(file=>getVideoDuration(file))
            // const result = await Promise.all(promises);
            // console.log(result.reduce((a, b) => a + b, 0));
        }}/>
    </>
}