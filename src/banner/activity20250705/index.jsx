import "./style.less"
import {useEffect} from "react";
import ss from "good-storage";

export const Version = 20250705
export default function (){
    useEffect(() => {
        ss.set("ActivityModel",Version)
    }, []);
    return <>
        <div className='banner-activity20250705'>

        </div>
    </>
}