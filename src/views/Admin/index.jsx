import "./style.less"
import {useEffect, useState} from "react";
import ss from "good-storage";
import {apiAdmin, apiVideo} from "@/api";
import {Toast} from "react-vant";
import ReactLoading from "react-loading";
import DramaCreator from "@/views/Admin/DramaCreator";

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

    //videManager
    const [videoList,setVideoList] = useState([])
    const [lastId, setLastId] = useState(0)
    const [whereBelongName,setWhereBelongName] = useState("")
    const [total,setTotal]=useState(0)
    async function getNextVideoList(){
        setLoading(true)
        const videoListResp = await apiAdmin.listVideo({
            pre_id:lastId,
            page_size: 10,
            where_belong_name: whereBelongName
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
                    {dramaCreatorModal || 1===1 &&<>
                        <div className='mask' onClick={()=>{
                            setDramaCreatorModal(null)
                        }}></div>
                        <div className='drama-creator-modal'>
                            <DramaCreator />
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
                            <div className={'am-tab-item'+" "+ (tabName.AdminManager===tab?"clicked":"")} onClick={()=>{
                                setTab(tabName.AdminManager);
                            }}>
                                {tabName.AdminManager}
                            </div>
                        </div>
                        <div className='am-content'>
                            {tab === tabName.VideoManager && <>
                                <div className='am-vm-header'>
                                    <div className='am-vm-upload-new'>
                                        上传新剧
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
                                                <li className='am-vm-t-exec am-vm-t-exec-body'></li>
                                            </ul>
                                        })}
                                    </div>
                                </div>
                                {/*<table>*/}
                                {/*    <thead>*/}
                                {/*    <tr>*/}
                                {/*        <th>序号</th>*/}
                                {/*        <th>标题</th>*/}
                                {/*        <th>简介</th>*/}
                                {/*        <th>海报</th>*/}
                                {/*        <th>总集数</th>*/}
                                {/*        <th>试看集数</th>*/}
                                {/*        <th>价格</th>*/}
                                {/*        <th>币种</th>*/}
                                {/*        <th>有效期</th>*/}
                                {/*        <th>归属剧名</th>*/}
                                {/*        <th>语言</th>*/}
                                {/*        <th>操作</th>*/}
                                {/*    </tr>*/}
                                {/*    </thead>*/}
                                {/*    <tbody>*/}
                                {/*    {videoList.map((item,index)=>{*/}
                                {/*        return <tr>*/}
                                {/*            <td className='am-vm-t-index'>{index}</td>*/}
                                {/*            <td>{item.title}</td>*/}
                                {/*            <td><div className='am-vm-t-desc'>{item.desc}</div></td>*/}
                                {/*            <td>{item.poster}</td>*/}
                                {/*            <td>{item.total_no}</td>*/}
                                {/*            <td>{item.free_no}</td>*/}
                                {/*            <td>{item.price}</td>*/}
                                {/*            <td>{item.currency}</td>*/}
                                {/*            <td>{item.effect_time}</td>*/}
                                {/*            <td>{item.belong_name}</td>*/}
                                {/*            <td>{item.lan}</td>*/}
                                {/*            <td></td>*/}
                                {/*        </tr>*/}
                                {/*    })}*/}
                                {/*    </tbody>*/}
                                {/*</table>*/}
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