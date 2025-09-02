import "./style.less"
import {useEffect, useState} from "react";
import ss from "good-storage";
import {apiAdmin, apiAuth, apiVideo} from "@/api";
import {Toast} from "react-vant";
import ReactLoading from "react-loading";
import DramaCreator from "@/views/Admin/DramaCreator";
import VideoUploader from "@/views/Admin/VideoUploader";
import SeriesManager from "@/views/Admin/SeriesManager";
import SeriesUpdate from "@/views/Admin/SeriesUpdate";
import Content from "@/views/Admin/Content";
import CreateCDK from "@/views/Admin/CreateCDK";
import StatsItem from "@/views/Admin/StatsItem";

const tabName = {
    VideoManager: "剧集管理",
    CDKManager: "CDK管理",
    StatsManager: "数据统计",
    AdminManager: "管理员管理",
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
    const [dramaSeriesModal,setDramaSeriesModal] = useState(null)
    const [seriesUpdateModal,setSeriesUpdateModal] = useState(null)

    const [createCDKModal,setCreateCDKModal] = useState(null)

    //videManager
    const [videoList,setVideoList] = useState([])
    const [lastId, setLastId] = useState(0)
    const [whereBelongName,setWhereBelongName] = useState("")
    const [whereIdx,setWhereIdx] = useState("")
    const [whereSeries,setWhereSeries] = useState("")
    const [total,setTotal]=useState(0)
    //cdkManager
    const [cdkList,setCDKList] = useState([])
    const [cdkLastId,setCDKLastID] = useState(0)
    const [cdkTotal,setCDKTotal] = useState(0)

    const [dramaList,setDramaList] = useState([])
    const [bakInfo,setBakInfo] = useState("")

    //statsManager
    const [seriesId,setSeriesId] = useState(0)
    const [statsInfo,setStatsInfo] = useState(null)
    
    async function getNextVideoList(){
        setLoading(true)
        const videoListResp = await apiAdmin.listVideo({
            pre_id:lastId,
            page_size: 10,
            where_belong_name: whereBelongName,
            where_idx: whereIdx.replace("https://player.netshort.online/#/?drama=",""),
            where_series: whereSeries,
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

    async function getNextCDKList(){
        setLoading(true)
        const cdkListResp = await apiAdmin.listCDK({
            pre_id:cdkLastId,
            page_size: 10,
        })
        if(cdkListResp.success){
            if(cdkListResp.data.list?.length){
                setCDKList([...cdkList,...cdkListResp.data.list])
                setCDKLastID(cdkListResp.data.last_id)
                setCDKTotal(cdkListResp.data.total)
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
                        <div className='mask-bg' onDoubleClick={()=>{
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
                        <div className='mask-bg' onDoubleClick={()=>{
                            setVideoUploadModal(null)
                        }}></div>
                        <div className='video-upload-modal'>
                            <VideoUploader cateId={videoUploadModal.cate_id} dramaId={videoUploadModal.drama_id}/>
                        </div>
                    </>}
                    {dramaLinkModal && <>
                        <div className='mask-bg' onDoubleClick={()=>{
                            setDramaLinkModal(null)
                        }}></div>
                        <div className='drama-link-modal' onClick={()=>{
                            window.open(dramaLinkModal.link,"_blank");
                        }}>
                            {dramaLinkModal.link}
                        </div>
                    </>}
                    {dramaSeriesModal && <>
                        <div className='drama-series-modal'>
                            <SeriesManager onClick={(seriesId)=>{
                                setSeriesUpdateModal({seriesId: seriesId})
                                setDramaSeriesModal(null)
                            }} onClose={()=>{
                                setDramaSeriesModal(null)
                            }} setLoading={(n)=>{
                                setLoading(n)
                            }}/>
                        </div>
                    </>}
                    {seriesUpdateModal && <>
                        <div className='series-update-modal'>
                            <SeriesUpdate seriesId={seriesUpdateModal.seriesId} dramaList={dramaList} setDramaList={setDramaList} bak={bakInfo} setBak={setBakInfo} onClose={()=>{
                                setDramaList([])
                                setBakInfo("")
                                setSeriesUpdateModal(null)
                            }} setLoading={(n)=>{
                                setLoading(n)
                            }}/>
                        </div>
                    </>}
                    {createCDKModal && <>
                        <div className='mask-bg' onDoubleClick={() => {
                            setCreateCDKModal(null)
                        }}></div>
                        <div className='create-cdk-modal'>
                            <CreateCDK onClose={() => {
                                setCreateCDKModal(null)
                            }} setLoading={(n)=>{
                                setLoading(n)
                            }}/>
                        </div>
                    </>}
                    <div className='admin-main'>
                        <div className='am-title'>
                            管理员信息：{bak}
                        </div>
                        <div className='am-tab'>
                            <div className={'am-tab-item' + " " + (tabName.VideoManager === tab ? "clicked" : "")}
                                 onClick={async () => {
                                     setTab(tabName.VideoManager);
                                     await getNextVideoList()
                                 }}>
                                {tabName.VideoManager}
                            </div>
                            <div className={'am-tab-item' + " " + (tabName.CDKManager === tab ? "clicked" : "")}
                                 onClick={async () => {
                                     setTab(tabName.CDKManager);
                                     await getNextCDKList()
                                 }}>
                                {tabName.CDKManager}
                            </div>
                            <div className={'am-tab-item' + " " + (tabName.StatsManager === tab ? "clicked" : "")}
                                 onClick={async () => {
                                     setTab(tabName.StatsManager);
                                     setLoading(true)
                                     const resp = await apiAdmin.stats({})
                                     if(resp.success) {
                                        setStatsInfo(resp.data)
                                     }
                                     setLoading(false)
                                 }}>
                                {tabName.StatsManager}
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
                                        <div className='am-vm-upload-new' onClick={async () => {
                                            setDramaCreatorModal(true)
                                        }}>
                                            上传新剧
                                        </div>
                                        <div className='am-vm-upload-new' onClick={async () => {
                                            setDramaSeriesModal(true)
                                        }}>
                                            剧单管理
                                        </div>
                                    </div>
                                    <div className='am-vm-header-right'>
                                        <input onChange={(e) => {
                                            setWhereBelongName(e.target.value)
                                        }} value={whereBelongName} placeholder="搜索归属剧名"/>
                                        <input onChange={(e) => {
                                            setWhereIdx(e.target.value)
                                        }} value={whereIdx} placeholder="搜索链接对应剧目"/>
                                        <input onChange={(e) => {
                                            setWhereSeries(e.target.value)
                                        }} value={whereSeries} placeholder="搜索剧单对应剧目"/>
                                        <div className='am-vm-search-btn' onClick={async () => {
                                            setLoading(true)
                                            const videoListResp = await apiAdmin.listVideo({
                                                pre_id: 0,
                                                page_size: 10,
                                                where_belong_name: whereBelongName,
                                                where_idx: whereIdx.replace("https://player.netshort.online/#/?drama=", ""),
                                                where_series: whereSeries,
                                            })
                                            if (videoListResp.success) {
                                                if (videoListResp.data.list?.length) {
                                                    setVideoList([...videoListResp.data.list])
                                                    setLastId(videoListResp.data.last_id)
                                                    setTotal(videoListResp.data.total)
                                                } else {
                                                    Toast.info("下面没有了~")
                                                }
                                            } else {
                                                Toast.info("系统错误")
                                            }
                                            setLoading(false)
                                        }}>
                                            查询
                                        </div>
                                    </div>
                                </div>
                                <div className='am-vm-table-box'>
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
                                                <li className='am-vm-t-series am-vm-t-series-header'>剧单</li>
                                                <li className='am-vm-t-redeem am-vm-t-redeem-header'>禁止兑换</li>
                                                <li className='am-vm-t-expire am-vm-t-expire-header'>过期</li>
                                                <li className='am-vm-t-keys am-vm-t-keys-header'>关键字</li>
                                                <li className='am-vm-t-weight am-vm-t-weight-header'>排序</li>
                                                <li className='am-vm-t-exec am-vm-t-exec-header'>操作</li>
                                            </ul>
                                        </div>
                                        <div className='am-vm-table-body'>
                                            {videoList.map((item, index) => {
                                                return <ul className='ul-body'>
                                                    <li className='am-vm-t-index am-vm-t-index-body'>{index + 1}</li>
                                                    <li className='am-vm-t-title am-vm-t-title-body'><Content
                                                        type={"text"}
                                                        content={item.title}
                                                        update={async (value) => {
                                                            if (value) {
                                                                setLoading(true)
                                                                videoList[index].title = value
                                                                setVideoList([...videoList])
                                                                const resp = await apiAdmin.updateDrama({
                                                                    drama_id: item.id,
                                                                    title: value,
                                                                })
                                                                if (resp.success) {
                                                                    Toast.info("更新成功")
                                                                } else {
                                                                    Toast.info("更新失败")
                                                                }
                                                                setLoading(false)
                                                            }
                                                        }}/></li>
                                                    <li className='am-vm-t-desc am-vm-t-desc-body'>
                                                        <div>
                                                            <Content type={"text"} content={item.desc}
                                                                     update={async (value) => {
                                                                         if (value) {
                                                                             setLoading(true)
                                                                             videoList[index].desc = value
                                                                             setVideoList([...videoList])
                                                                             const resp = await apiAdmin.updateDrama({
                                                                                 drama_id: item.id,
                                                                                 desc: value,
                                                                             })
                                                                             if (resp.success) {
                                                                                 Toast.info("更新成功")
                                                                             } else {
                                                                                 Toast.info("更新失败")
                                                                             }
                                                                             setLoading(false)
                                                                         }
                                                                     }}/></div>
                                                    </li>
                                                    <li className='am-vm-t-poster am-vm-t-poster-body'><Content
                                                        type={"text"} content={<img
                                                        src={item.poster} alt='poster'/>} update={async (value) => {
                                                        if (value) {
                                                            setLoading(true)
                                                            videoList[index].poster = value
                                                            setVideoList([...videoList])
                                                            const resp = await apiAdmin.updateDrama({
                                                                drama_id: item.id,
                                                                poster: value,
                                                            })
                                                            if (resp.success) {
                                                                Toast.info("更新成功")
                                                            } else {
                                                                Toast.info("更新失败")
                                                            }
                                                            setLoading(false)
                                                        }
                                                    }}/></li>
                                                    <li className='am-vm-t-total-no am-vm-t-total-no-body'><Content
                                                        type={"text"} content={item.total_no} update={async (value) => {
                                                        if (value) {
                                                            setLoading(true)
                                                            videoList[index].total_no = Number(value)
                                                            setVideoList([...videoList])
                                                            const resp = await apiAdmin.updateDrama({
                                                                drama_id: item.id,
                                                                total_no: Number(value),
                                                            })
                                                            if (resp.success) {
                                                                Toast.info("更新成功")
                                                            } else {
                                                                Toast.info("更新失败")
                                                            }
                                                            setLoading(false)
                                                        }
                                                    }}/></li>
                                                    <li className='am-vm-t-free-no am-vm-t-free-no-body'><Content
                                                        type={"text"} content={item.free_no} update={async (value) => {
                                                        if (value) {
                                                            setLoading(true)
                                                            videoList[index].free_no = Number(value)
                                                            setVideoList([...videoList])
                                                            const resp = await apiAdmin.updateDrama({
                                                                drama_id: item.id,
                                                                free_no: Number(value),
                                                            })
                                                            if (resp.success) {
                                                                Toast.info("更新成功")
                                                            } else {
                                                                Toast.info("更新失败")
                                                            }
                                                            setLoading(false)
                                                        }
                                                    }}/></li>
                                                    <li className='am-vm-t-price am-vm-t-price-body'>
                                                        <Content type={"text"} content={item.price}
                                                                 update={async (value) => {
                                                                     if (value) {
                                                                         setLoading(true)
                                                                         videoList[index].price = value
                                                                         setVideoList([...videoList])
                                                                         const resp = await apiAdmin.updateDrama({
                                                                             drama_id: item.id,
                                                                             price: value,
                                                                         })
                                                                         if (resp.success) {
                                                                             Toast.info("更新成功")
                                                                         } else {
                                                                             Toast.info("更新失败")
                                                                         }
                                                                         setLoading(false)
                                                                     }
                                                                 }}/></li>
                                                    <li className='am-vm-t-currency am-vm-t-currency-body'><Content
                                                        type={"text"} content={item.currency} update={async (value) => {
                                                        if (value) {
                                                            setLoading(true)
                                                            videoList[index].currency = value
                                                            setVideoList([...videoList])
                                                            const resp = await apiAdmin.updateDrama({
                                                                drama_id: item.id,
                                                                currency: value,
                                                            })
                                                            if (resp.success) {
                                                                Toast.info("更新成功")
                                                            } else {
                                                                Toast.info("更新失败")
                                                            }
                                                            setLoading(false)
                                                        }
                                                    }}/></li>
                                                    <li className='am-vm-t-effect-time am-vm-t-effect-time-body'>
                                                        <Content type={"text"} content={item.effect_time}
                                                                 update={async (value) => {
                                                                     if (value) {
                                                                         setLoading(true)
                                                                         videoList[index].effect_time = Number(value)
                                                                         setVideoList([...videoList])
                                                                         const resp = await apiAdmin.updateDrama({
                                                                             drama_id: item.id,
                                                                             effect_time: Number(value),
                                                                         })
                                                                         if (resp.success) {
                                                                             Toast.info("更新成功")
                                                                         } else {
                                                                             Toast.info("更新失败")
                                                                         }
                                                                         setLoading(false)
                                                                     }
                                                                 }}/></li>
                                                    <li className='am-vm-t-belong-name am-vm-t-belong-name-body'>
                                                        <Content
                                                            type={"text"} content={item.belong_name}
                                                            update={async (value) => {
                                                                if (value) {
                                                                    setLoading(true)
                                                                    videoList[index].belong_name = value
                                                                    setVideoList([...videoList])
                                                                    const resp = await apiAdmin.updateDrama({
                                                                        drama_id: item.id,
                                                                        belong_name: value,
                                                                    })
                                                                    if (resp.success) {
                                                                        Toast.info("更新成功")
                                                                    } else {
                                                                        Toast.info("更新失败")
                                                                    }
                                                                    setLoading(false)
                                                                }
                                                            }}/></li>
                                                    <li className='am-vm-t-lan am-vm-t-lan-body'><Content type={"text"}
                                                                                                          content={item.lan}
                                                                                                          update={async (value) => {
                                                                                                              if (value) {
                                                                                                                  setLoading(true)
                                                                                                                  videoList[index].lan = value
                                                                                                                  setVideoList([...videoList])
                                                                                                                  const resp = await apiAdmin.updateDrama({
                                                                                                                      drama_id: item.id,
                                                                                                                      belong_lan: value,
                                                                                                                  })
                                                                                                                  if (resp.success) {
                                                                                                                      Toast.info("更新成功")
                                                                                                                  } else {
                                                                                                                      Toast.info("更新失败")
                                                                                                                  }
                                                                                                                  setLoading(false)
                                                                                                              }
                                                                                                          }}/></li>
                                                    <li className='am-vm-t-series am-vm-t-series-body'><Content
                                                        type={"text"} content={item.series_id}
                                                        update={async (value) => {
                                                            if (value) {
                                                                setLoading(true)
                                                                videoList[index].series_id = Number(value)
                                                                setVideoList([...videoList])
                                                                const resp = await apiAdmin.updateDrama({
                                                                    drama_id: item.id,
                                                                    series_id: Number(value),
                                                                })
                                                                if (resp.success) {
                                                                    Toast.info("更新成功")
                                                                } else {
                                                                    Toast.info("更新失败")
                                                                }
                                                                setLoading(false)
                                                            }
                                                        }}/></li>
                                                    <li className='am-vm-t-redeem am-vm-t-redeem-body'><Content
                                                        type={"text"} content={item.no_redeem ? "true" : "false"}
                                                        update={async (value) => {
                                                            if (value) {
                                                                setLoading(true)
                                                                videoList[index].no_redeem = (value === "true")
                                                                setVideoList([...videoList])
                                                                const resp = await apiAdmin.updateDrama({
                                                                    drama_id: item.id,
                                                                    no_redeem: value === "true",
                                                                })
                                                                if (resp.success) {
                                                                    Toast.info("更新成功")
                                                                } else {
                                                                    Toast.info("更新失败")
                                                                }
                                                                setLoading(false)
                                                            }
                                                        }}/></li>
                                                    <li className='am-vm-t-expire am-vm-t-expire-body'><Content
                                                        type={"datetime-local"} content={((t) => {
                                                        const date = new Date(t * 1000);
                                                        return date.toLocaleString();
                                                    })(item.watch_time)} update={async (value) => {
                                                        if (value) {
                                                            setLoading(true)
                                                            const timestamp = new Date(value).getTime() / 1000;
                                                            videoList[index].watch_time = timestamp
                                                            setVideoList([...videoList])
                                                            const resp = await apiAdmin.updateDrama({
                                                                drama_id: item.id,
                                                                watch_time: timestamp,
                                                            })
                                                            if (resp.success) {
                                                                Toast.info("更新成功")
                                                            } else {
                                                                Toast.info("更新失败")
                                                            }
                                                            setLoading(false)
                                                        }
                                                    }}/>
                                                    </li>
                                                    <li className='am-vm-t-keys am-vm-t-keys-body'>
                                                        <Content
                                                            type={"text"} content={item.keys} update={async (value) => {
                                                            if (value) {
                                                                setLoading(true)
                                                                videoList[index].keys = value
                                                                setVideoList([...videoList])
                                                                const resp = await apiAdmin.updateDrama({
                                                                    drama_id: item.id,
                                                                    keys: value,
                                                                })
                                                                if (resp.success) {
                                                                    Toast.info("更新成功")
                                                                } else {
                                                                    Toast.info("更新失败")
                                                                }
                                                                setLoading(false)
                                                            }
                                                        }}/>
                                                    </li>
                                                    <li className='am-vm-t-weight am-vm-t-weight-body'>
                                                        <Content
                                                            type={"number"} content={item.weight} update={async (value) => {
                                                            if (value) {
                                                                setLoading(true)
                                                                videoList[index].weight = Number(value)
                                                                setVideoList([...videoList])
                                                                const resp = await apiAdmin.updateDrama({
                                                                    drama_id: item.id,
                                                                    weight: Number(value),
                                                                })
                                                                if (resp.success) {
                                                                    Toast.info("更新成功")
                                                                } else {
                                                                    Toast.info("更新失败")
                                                                }
                                                                setLoading(false)
                                                            }
                                                        }}/>
                                                    </li>
                                                    <li className='am-vm-t-exec am-vm-t-exec-body'>
                                                        <div className='am-vm-t-exec-btn' onClick={() => {
                                                            setVideoUploadModal({
                                                                drama_id: item.id,
                                                                cate_id: item.cate_id,
                                                            })
                                                        }}>
                                                            更新剧集
                                                        </div>
                                                        <div className='am-vm-t-exec-btn' onClick={() => {
                                                            setDramaLinkModal({
                                                                link: `https://player.netshort.online/#/?drama=${item.idx}`
                                                            })
                                                        }}>
                                                            获取链接
                                                        </div>
                                                        <div className='am-vm-t-exec-btn' onClick={() => {
                                                            Toast.info("请双击删除")
                                                        }} onDoubleClick={async ()=>{
                                                            setLoading(true)
                                                            const resp = await apiAdmin.updateDrama({
                                                                drama_id: item.id,
                                                                is_deleted: Math.floor(Date.now() / 1000),
                                                            })
                                                            if (resp.success) {
                                                                Toast.info("删除成功")
                                                            } else {
                                                                Toast.info("删除失败")
                                                            }
                                                            setLoading(false)
                                                        }}>
                                                            删除剧目
                                                        </div>
                                                        {seriesUpdateModal &&
                                                            <div className='am-vm-t-exec-btn' onClick={() => {
                                                                const list = [...dramaList, {
                                                                    id: item.id,
                                                                    idx: item.idx,
                                                                    title: item.title
                                                                }]
                                                                setDramaList(list)
                                                            }}>
                                                                添加剧单
                                                            </div>
                                                        }
                                                    </li>
                                                </ul>
                                            })}
                                        </div>
                                    </div>
                                </div>
                                <div className='am-vm-bottom'>
                                    <div className='am-vm-total'>总共：{total}条</div>
                                    <div className='am-vm-next' onClick={getNextVideoList}>
                                        拉取更多
                                    </div>
                                </div>
                            </>}
                            {tab === tabName.CDKManager && <>
                                <div className='am-cm-header'>
                                    <div className='am-cm-header-left'>
                                        <div className='am-cm-upload-new' onClick={async () => {
                                            setCreateCDKModal(true)
                                        }}>
                                            创建CDK
                                        </div>
                                    </div>
                                    <div className='am-cm-header-right'></div>
                                </div>
                                <div className='am-cm-table'>
                                    <div className='ul-header'>
                                        <ul>
                                            <li className='am-cm-t-index am-cm-t-index-header'>序号</li>
                                            <li className='am-cm-t-cdk am-cm-t-cdk-header'>CDK</li>
                                            <li className='am-cm-t-limit am-cm-t-limit-header'>可领取数</li>
                                            <li className='am-cm-t-claim am-cm-t-claim-header'>已领取数</li>
                                            <li className='am-cm-t-uniq am-cm-t-uniq-header'>活动去重标示</li>
                                            <li className='am-cm-t-exec am-cm-t-exec-header'>操作</li>
                                        </ul>
                                    </div>
                                    <div className='am-cm-table-body'>
                                        {cdkList.map((item, index) => {
                                            return <ul className='ul-body'>
                                                <li className='am-cm-t-index am-cm-t-index-body'>{index + 1}</li>
                                                <li className='am-cm-t-cdk am-cm-t-cdk-body'>{item.code}</li>
                                                <li className='am-cm-t-limit am-cm-t-limit-body'>{item.num_limit}</li>
                                                <li className='am-cm-t-claim am-cm-t-claim-body'>{item.claim_num}</li>
                                                <li className='am-cm-t-uniq am-cm-t-uniq-body'>{item.activity_uniq}</li>
                                                <li className='am-cm-t-exec am-cm-t-exec-body'></li>
                                            </ul>
                                        })}
                                    </div>
                                </div>
                                <div className='am-cm-bottom'>
                                    <div className='am-cm-total'>总共:{cdkTotal}条</div>
                                    <div className='am-cm-next' onClick={getNextCDKList}>
                                        拉取更多
                                    </div>
                                </div>
                            </>}
                            {tab === tabName.StatsManager && <>
                            {statsInfo &&
                                <div className='am-sm-box'>
                                    <div className='am-sm-input-box'>
                                        <div className='am-sm-input-title'>按剧单统计：</div>
                                        <input type='number' value={seriesId} onChange={(e) => {
                                            setSeriesId(e.target.value)
                                        }} placeholder='输入剧单序号'/>
                                        <div className='am-sm-input-btn' onClick={async () => {
                                            setLoading(true)
                                            const resp = await apiAdmin.stats({
                                                series_id: seriesId,
                                            })
                                            if (resp.success) {
                                                setStatsInfo(resp.data)
                                            }
                                            setLoading(false)
                                        }}>更新统计数据
                                        </div>
                                    </div>
                                    <div className='am-sm-line'>
                                        <StatsItem title={"总充值"} data={`${statsInfo.recharge_total}$`}
                                                   desc={"总计充值，已换算为美元。 ps：范围会根据剧单缩小"}/>
                                        <StatsItem title={"近一周充值"} data={`${statsInfo.recharge_week}$`}
                                                   desc={"最近一周的时间的充值，已换算为美元。 ps：范围会根据剧单缩小"}/>
                                        <StatsItem title={"与上上周环比"} data={`${statsInfo.recharge_week_on_week}%`}
                                                   desc={"（最近一周充值-最近第二周充值）/最近第二周充值 ps：范围会根据剧单缩小"}/>
                                        <StatsItem title={"昨日充值"} data={`${statsInfo.recharge_yesterday}$`}
                                                   desc={"昨日充值 ps：范围会根据剧单缩小"}/>
                                    </div>
                                    <div className='am-sm-line'>
                                        <StatsItem title={"复充比例"} data={`${statsInfo.recharge_again_rate}%`}
                                                   desc={"充值超过1笔的人数/有过充值的人数 ps：范围会根据剧单缩小"}/>
                                        <StatsItem title={"近一周充值订单成功率"}
                                                   data={`${statsInfo.recharge_success_rate_recent_week}%`}
                                                   desc={"用于观察充值渠道是否正常 ps：范围会根据剧单缩小"}/>
                                    </div>
                                    <div className='am-sm-line'>
                                        <StatsItem title={"总点击数"} data={`${statsInfo.click_total}`}
                                                   desc={"剧目点击次数。点击次数用于观察曝光情况。 ps：范围会根据剧单缩小"}/>
                                        <StatsItem title={"上周点击数"}
                                                   data={`${statsInfo.click_week}`}
                                                   desc={"剧目上周点击次数。点击次数用于观察曝光情况。 ps：范围会根据剧单缩小"}/>
                                        <StatsItem title={"点击数环比"}
                                                   data={`${statsInfo.click_week_on_week}%`}
                                                   desc={"（最近一周点击-最近第二周点击）/最近第二周点击。点击次数用于观察曝光情况。 ps：范围会根据剧单缩小"}/>
                                        <StatsItem title={"昨日点击数"}
                                                   data={`${statsInfo.click_yesterday}`}
                                                   desc={"剧目昨日点击次数。点击次数用于观察曝光情况。 ps：范围会根据剧单缩小"}/>
                                    </div>
                                    <div className='am-sm-line'>
                                        <StatsItem title={"总观看数"} data={`${statsInfo.watch_total}`}
                                                   desc={"剧目观看次数。 ps：范围会根据剧单缩小"}/>
                                        <StatsItem title={"上周观看数"}
                                                   data={`${statsInfo.watch_week}`}
                                                   desc={"剧目上周观看次数。 ps：范围会根据剧单缩小"}/>
                                        <StatsItem title={"观看数环比"}
                                                   data={`${statsInfo.watch_week_on_week}%`}
                                                   desc={"（最近一周观看-最近第二周观看）/最近第二周观看。 ps：范围会根据剧单缩小"}/>
                                        <StatsItem title={"昨日观看数"}
                                                   data={`${statsInfo.watch_yesterday}`}
                                                   desc={"剧目上周观看次数。 ps：范围会根据剧单缩小"}/>
                                    </div>
                                </div>}
                            </>}
                        </div>
                    </div>
                </div>
            </> : <>
                <div className='admin-login'>
                    <div className='admin-login-model'>
                        <input className='alm-input' type='password' onChange={(e) => {
                            setKey(e.target.value)
                        }} value={key} placeholder="输入管理员密钥"/>
                        <div className='alm-btn' onClick={async () => {
                            setLoading(true)
                            const resp = await apiAdmin.login({
                                key: key
                            })
                            if (resp.success) {
                                ss.set("Admin", resp.data.token)
                                ss.set("Admin-IsSuper", resp.data.is_super)
                                ss.set("Admin-Bak", resp.data.desc)
                                window.location.reload()
                            } else {
                                Toast.info("登录失败")
                            }
                            setLoading(false)
                        }}>
                            登录
                        </div>
                    </div>
                </div>
            </>
        }
    </>
}