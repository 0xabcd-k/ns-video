import ReactLoading from "react-loading";
import {useEffect} from "react";
import {apiVideo} from "@/api";
import {useHashQueryParams, useTelegramStartParams} from "@/utils";
import {useNavigate} from "react-router-dom";

export default function (){
    const params = {...useHashQueryParams(),...useTelegramStartParams()};
    const navigate = useNavigate();
    async function init(){
        const dramaResp = await apiVideo.dramaI18({
            drama_name: params.name,
            lan: navigator.language,
        })
        if(dramaResp.success){
            navigate(`/?drama=${dramaResp.data.idx}`);
        }
    }
    useEffect(() => {
        init()
    }, []);
    return <>
        <div className='mask'>
            <div className='loading'>
                <ReactLoading type="bars" color="#fff"/>
            </div>
        </div>
    </>
}