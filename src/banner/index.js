import ss from "good-storage";
import Activity20250705, {Version as Activity20250705Version} from "@/banner/activity20250705";

export function GetBanner(){
    const version = Number(ss.get("ActivityModel",0))
    if(version < Activity20250705Version){
        return <>
            <Activity20250705 />
        </>
    }
}