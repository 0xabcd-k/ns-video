import {useEffect} from "react";
import {Toast} from "react-vant";

export default function (){
    useEffect(() => {
        Toast.info("Test")
    }, []);
    return <></>
}