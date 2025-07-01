import "./style.less"
import {useEffect, useState} from "react";
import {apiAdmin} from "@/api";
import {Toast} from "react-vant";

export default function ({onClose,setLoading}){
    const [claimNum,setClaimNum] = useState(null);
    const [activityUniq,setActivityUniq] = useState(null);
    const [cdkNum,setCDKNum] = useState(null);
    const [effectTime,setEffectTime] = useState(null);
    return <>
        <div className='create-cdk'>
            <div className='dc-row'>
                <div className='dc-col'>
                    <div className='dc-title'>
                        可领取次数*：
                    </div>
                    <input onChange={(e) => setClaimNum(e.target.value)} value={claimNum} placeholder='可领取次数'/>
                </div>
                <div className='dc-col'>
                    <div className='dc-title'>
                        活动去重标示：
                    </div>
                    <input onChange={(e) => setActivityUniq(e.target.value)} value={activityUniq}
                           placeholder='活动去重标示'/>
                </div>
                <div className='dc-col'>
                    <div className='dc-title'>
                        创建CDK数*：
                    </div>
                    <input onChange={(e) => setCDKNum(e.target.value)} value={cdkNum} placeholder='创建CDK数'/>
                </div>
                <div className='dc-col'>
                    <div className='dc-title'>
                        看剧有效期*：
                    </div>
                    <input onChange={(e) => setEffectTime(e.target.value)} value={effectTime} placeholder='看剧有效期'/>
                </div>
            </div>
            <div className='dc-upload' onClick={async () => {
                setLoading(true)
                const resp = await apiAdmin.createCDK({
                    type: "CDKTypeVideo",
                    effect_time: Number(effectTime),
                    claim_num: Number(claimNum),
                    activity_uniq: activityUniq,
                    cdk_num: Number(cdkNum),
                })
                if (resp.success) {
                    Toast.info("创建成功")
                }else {
                    Toast.info("创建失败")
                }
                onClose()
                setLoading(false)
            }}>
                创建剧目
            </div>
        </div>
    </>
}