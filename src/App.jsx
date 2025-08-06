import React, {useEffect} from 'react'
import {Outlet, useNavigate} from 'react-router-dom'
import {useHashQueryParams, useTelegramStartParams} from "@/utils";
import ss from "good-storage";

export default function(){
    const navigate = useNavigate()
    const params = {...useHashQueryParams(),...useTelegramStartParams()};
    async function init(){
        if(params.token){
            ss.set("Authorization", params.token)
        }
    }
    useEffect(() => {
        init()
    }, []);
    return <>
        <Outlet></Outlet>
    </>
}