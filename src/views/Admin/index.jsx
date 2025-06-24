import "./style.less"
import {useEffect, useState} from "react";
import ss from "good-storage";
import {apiAdmin, apiVideo} from "@/api";
import {Toast} from "react-vant";
import ReactLoading from "react-loading";
import DramaCreator from "@/views/Admin/DramaCreator";
import VideoUploader from "@/views/Admin/VideoUploader";

const tabName = {
    VideoManager: "剧集管理",
    AdminManager: "管理员管理"
}

export default function (){
    const [logined, setLogined] = useState(false)
    const [key,setKey] = useState("")
    const isSuper = ss.get("Admin-IsSuper","")
    const bak = ss.get("Admin-Bak","")

    const [loading,setLoading] = useState(false)
    const [tab,setTab]=useState("")

    const [dramaCreatorModal,setDramaCreatorModal] = useState(null)
    const [videoUploadModal,setVideoUploadModal] = useState(null)
    const [dramaLinkModal,setDramaLinkModal] = useState(null)
    //videManager
    const [videoList,setVideoList] = useState([])
    const [lastId, setLastId] = useState(0)
    const [whereBelongName,setWhereBelongName] = useState("")
    const [whereIdx,setWhereIdx] = useState("")
    const [total,setTotal]=useState(0)
    
    async function getNextVideoList(){
        setLoading(true)
        const videoListResp = await apiAdmin.listVideo({
            pre_id:lastId,
            page_size: 10,
            where_belong_name: whereBelongName,
            where_idx: whereIdx.replace("https://player.netshort.online/#/?drama=",""),
        })
        if(videoListResp.success){
            if(videoListResp.data.list?.length){
                setVideoList([...videoList,...videoListResp.data.list])
                setLastId(videoListResp.data.last_id)
                setTotal(videoListResp.data.total)
            }else{
                Toast.info("下面没有了~")
            }
        }else{
            Toast.info("系统错误")
        }
        setLoading(false)
    }

    async function init(){
        if(ss.get("Admin","")){
            setLogined(true)
        }
    }
    useEffect(() => {
        init()
    }, []);
    return <>
        {loading && <>
            <div className='mask'>
                <div className='loading'>
                    <ReactLoading type="bars" color="#fff"/>
                </div>
            </div>
        </>}
        {
            logined ? <>
                <div className='admin-home'>
                    {dramaCreatorModal &&<>
                        <div className='mask' onDoubleClick={()=>{
                            setDramaCreatorModal(null)
                        }}></div>
                        <div className='drama-creator-modal'>
                            <DramaCreator onUpload={async (title,desc,poster,totalNo,freeNo,price,currency,belongName,belongLan,expireTime)=>{
                                setLoading(true)
                                const resp = await apiAdmin.createDrama({
                                    title: title,
                                    desc: desc,
                                    poster: poster,
                                    total_no: Number(totalNo),
                                    free_no: Number(freeNo),
                                    price: price,
                                    currency: currency,
                                    belong_name: belongName,
                                    belong_lan: belongLan,
                                    expire_time: Number(expireTime),
                                })
                                if(resp.success) {
                                    setVideoUploadModal(resp.data)
                                }else {
                                    Toast.info("创建失败")
                                }
                                setLoading(false)
                            }}/>
                        </div>
                    </>}
                    {videoUploadModal && <>
                        <div className='mask' onDoubleClick={()=>{
                            setVideoUploadModal(null)
                        }}></div>
                        <div className='video-upload-modal'>
                            <VideoUploader cateId={videoUploadModal.cate_id} dramaId={videoUploadModal.drama_id}/>
                        </div>
                    </>}
                    {dramaLinkModal && <>
                        <div className='mask' onDoubleClick={()=>{
                            setDramaLinkModal(null)
                        }}></div>
                        <div className='drama-link-modal' onClick={()=>{
                            window.open(dramaLinkModal.link,"_blank");
                        }}>
                            {dramaLinkModal.link}
                        </div>
                    </>}
                    <div className='admin-main'>
                        <div className='am-title'>
                            管理员信息：{bak}
                        </div>
                        <div className='am-tab'>
                            <div className={'am-tab-item'+" "+ (tabName.VideoManager===tab?"clicked":"")} onClick={async ()=>{
                                setTab(tabName.VideoManager);
                                await getNextVideoList()
                            }}>
                                {tabName.VideoManager}
                            </div>
                            {/*<div className={'am-tab-item'+" "+ (tabName.AdminManager===tab?"clicked":"")} onClick={()=>{*/}
                            {/*    setTab(tabName.AdminManager);*/}
                            {/*}}>*/}
                            {/*    {tabName.AdminManager}*/}
                            {/*</div>*/}
                        </div>
                        <div className='am-content'>
                            {tab === tabName.VideoManager && <>
                                <div className='am-vm-header'>
                                    <div className='am-vm-header-left'>
                                        <div className='am-vm-upload-new' onClick={async ()=>{
                                            setDramaCreatorModal(true)
                                        }}>
                                            上传新剧
                                        </div>
                                    </div>
                                    <div className='am-vm-header-right'>
                                        <input onChange={(e)=>{
                                            setWhereBelongName(e.target.value)
                                        }} value={whereBelongName} placeholder="搜索归属剧名"/>
                                        <input onChange={(e)=>{
                                            setWhereIdx(e.target.value)
                                        }} value={whereIdx} placeholder="搜索链接对应剧目"/>
                                        <div className='am-vm-search-btn' onClick={async ()=>{
                                            setLoading(true)
                                            const videoListResp = await apiAdmin.listVideo({
                                                pre_id:0,
                                                page_size: 10,
                                                where_belong_name: whereBelongName,
                                                where_idx: whereIdx.replace("https://player.netshort.online/#/?drama=",""),
                                            })
                                            if(videoListResp.success){
                                                if(videoListResp.data.list?.length){
                                                    setVideoList([...videoListResp.data.list])
                                                    setLastId(videoListResp.data.last_id)
                                                    setTotal(videoListResp.data.total)
                                                }else{
                                                    Toast.info("下面没有了~")
                                                }
                                            }else{
                                                Toast.info("系统错误")
                                            }
                                            setLoading(false)
                                        }}>
                                            查询
                                        </div>
                                    </div>
                                </div>
                                <div className='am-vm-table'>
                                    <div className='ul-header'>
                                        <ul>
                                            <li className='am-vm-t-index am-vm-t-index-header'>序号</li>
                                            <li className='am-vm-t-title am-vm-t-title-header'>标题</li>
                                            <li className='am-vm-t-desc am-vm-t-desc-header'>简介</li>
                                            <li className='am-vm-t-poster am-vm-t-poster-header'>海报</li>
                                            <li className='am-vm-t-total-no am-vm-t-total-no-header'>总集数</li>
                                            <li className='am-vm-t-free-no am-vm-t-free-no-header'>试看集数</li>
                                            <li className='am-vm-t-price am-vm-t-price-header'>价格</li>
                                            <li className='am-vm-t-currency am-vm-t-currency-header'>币种</li>
                                            <li className='am-vm-t-effect-time am-vm-t-effect-time-header'>有效期</li>
                                            <li className='am-vm-t-belong-name am-vm-t-belong-name-header'>归属剧名</li>
                                            <li className='am-vm-t-lan am-vm-t-lan-header'>语言</li>
                                            <li className='am-vm-t-exec am-vm-t-exec-header'>操作</li>
                                        </ul>
                                    </div>
                                    <div className='am-vm-table-body'>
                                        {videoList.map((item,index)=>{
                                            return <ul className='ul-body'>
                                                <li className='am-vm-t-index am-vm-t-index-body'>{index+1}</li>
                                                <li className='am-vm-t-title am-vm-t-title-body'>{item.title}</li>
                                                <li className='am-vm-t-desc am-vm-t-desc-body'><div>{item.desc}</div></li>
                                                <li className='am-vm-t-poster am-vm-t-poster-body'><img src={item.poster} alt='poster'/></li>
                                                <li className='am-vm-t-total-no am-vm-t-total-no-body'>{item.total_no}</li>
                                                <li className='am-vm-t-free-no am-vm-t-free-no-body'>{item.free_no}</li>
                                                <li className='am-vm-t-price am-vm-t-price-body'>{item.price}</li>
                                                <li className='am-vm-t-currency am-vm-t-currency-body'>{item.currency}</li>
                                                <li className='am-vm-t-effect-time am-vm-t-effect-time-body'>{item.effect_time}</li>
                                                <li className='am-vm-t-belong-name am-vm-t-belong-name-body'>{item.belong_name}</li>
                                                <li className='am-vm-t-lan am-vm-t-lan-body'>{item.lan}</li>
                                                <li className='am-vm-t-exec am-vm-t-exec-body'>
                                                    <div className='am-vm-t-exec-btn' onClick={()=>{
                                                        setVideoUploadModal({
                                                            drama_id: item.id,
                                                            cate_id: item.cate_id,
                                                        })
                                                    }}>
                                                        更新剧集
                                                    </div>
                                                    <div className='am-vm-t-exec-btn' onClick={()=>{
                                                        setDramaLinkModal({
                                                            link: `https://player.netshort.online/#/?drama=${item.idx}`
                                                        })
                                                    }}>
                                                        获取链接
                                                    </div>
                                                </li>
                                            </ul>
                                        })}
                                    </div>
                                </div>
                                <div className='am-vm-bottom'>
                                    <div className='am-vm-total'>总共：{total}条</div>
                                    <div className='am-vm-next' onClick={getNextVideoList}>
                                        拉取更多
                                    </div>
                                </div>
                            </>}
                        </div>
                    </div>
                </div>
            </>: <>
                <div className='admin-login'>
                    <div className='admin-login-model'>
                        <input className='alm-input' type='password' onChange={(e)=>{
                            setKey(e.target.value)
                        }} value={key} placeholder="输入管理员密钥"/>
                        <div className='alm-btn' onClick={async ()=>{
                            const resp = await apiAdmin.login({
                                key: key
                            })
                            if(resp.success) {
                                ss.set("Admin",resp.data.token)
                                ss.set("Admin-IsSuper",resp.data.is_super)
                                ss.set("Admin-Bak",resp.data.desc)
                                window.location.reload()
                            }else{
                                Toast.info("登录失败")
                            }
                        }}>
                            登录
                        </div>
                    </div>
                </div>
            </>
        }
    </>
}