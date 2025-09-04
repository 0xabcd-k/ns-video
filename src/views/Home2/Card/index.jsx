import "./style.less"
import {useEffect, useState} from "react";
import {getText,Text} from "@/utils/i18";

export default function ({time,setTime}){
    function formatTime(seconds) {
        const days = Math.floor(seconds / (24 * 3600));
        const hours = Math.floor((seconds % (24 * 3600)) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        const dDisplay = days > 0 ? `${days}d ` : '';
        const hDisplay = hours > 0 ? `${hours}h ` : '';
        const mDisplay = minutes > 0 ? `${minutes}m ` : '';
        const sDisplay = `${secs}s`;

        return dDisplay + hDisplay + mDisplay + sDisplay;
    }
    const [tick,setTick] = useState(time)
    useEffect(() => {
        const ticker = setInterval(() => {
            setTick(prevTick => {
                if (prevTick <= 0) {
                    clearInterval(ticker); // 停止计时
                    return 0;
                }
                return prevTick - 1;
            });
        },1000)
    }, []);
    return <>
        <div className='h-card'>
            {getText(Text.Free)}<br/>{formatTime(tick)}
        </div>
    </>
}