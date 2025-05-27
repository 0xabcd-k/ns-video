import "./style.less"
import {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {apiDrama} from "@/api";
export default function () {
    const { idx } = useParams();
    const [drama,setDrama] = useState(null);
    const navigate = useNavigate();
    async function init(){
        if(idx){

        }else{
            navigate('/drama')
        }
    }
    useEffect(() => {
        init()
    }, []);

    return <>
    </>
}