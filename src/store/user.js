import { proxy,subscribe } from 'valtio'
import {useProxy} from 'valtio/utils'
import ss from 'good-storage'

const key = "USER_STORE"
const state = proxy(ss.get(key) || {
    token: "",
})

subscribe(state, () =>{
    ss.set(key,state)
})

export function useUserStore(){
    return useProxy(state)
}

export const userActions = {
    login:async ()=>{},
    getToken:()=>state.token
}

