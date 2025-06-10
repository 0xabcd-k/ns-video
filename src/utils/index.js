import ss from "good-storage";
import FingerprintJS from '@fingerprintjs/fingerprintjs'
import { v4 as uuidv4 } from 'uuid';

export * from './formater'
export * from './styled-px2rem'
export * from './tools'

export function copyText(text) {
    return new Promise((resolve, reject) => {
        navigator.clipboard.writeText(text)
            .then(() => {
                resolve(1)
            })
            .catch(err => {
                resolve(0)
            });
    })
}

function abbreviateString(str) {
    if (str.length <= 13) {
        return str; // 如果字符串长度小于等于13，直接返回
    }
    const start = str.slice(0, 6); // 前6个字符
    const end = str.slice(-4); // 后4个字符
    return `${start}...${end}`; // 拼接结果
}

export function getWalletAddressText(wallets){
    if(!Array.isArray(wallets)){
        return "       "
    }else{
        for(let i = 0; i < wallets.length; i++){
            if(wallets[i].network !== "WalletTypeTwitter" && wallets[i].network !== "WalletTypeDiscord"){
                return abbreviateString(wallets[i].detail?.address || "       ")
            }
        }
    }
}

export function getRewardText(rewards,isStep){
    if(!Array.isArray(rewards)){
        return ""
    }
    if(isStep){
        for (let i = 0; i < rewards.length; i++){
            if(rewards[i]&&rewards[i].type==="AccountTypeLuckCoin"){
                return `+${rewards[i]?.amount} TOW`
            }
        }
    }else{
        let ans = ""
        for (let i = 0; i < rewards.length; i++){
            if(rewards[i]&&rewards[i].type!=="AccountTypeLuckCoin"){
                switch(rewards[i].type){
                    case "AccountTypeUSDT":
                        ans += `+${rewards[i]?.amount} USDT`
                        break;
                }
            }
        }
        return ans
    }
}

export async function jump(link){
    switch (globalThis.Platform){
    case globalThis.PlatformType.TMA:
        if(link.startsWith("https://t.me/")){
            window.Telegram?.openTelegramLink(link);
        }else{
            window.Telegram.openLink(link);
        }
        break;
    case globalThis.PlatformType.Web:
        window.open(link);
        break;
    }
}

import { useMemo } from 'react';

export function useHashQueryParams() {
    return useMemo(() => {
        const hash = window.location.hash;
        const queryIndex = hash.indexOf('?');
        if (queryIndex === -1) return {};

        const queryString = hash.slice(queryIndex + 1);
        const params = new URLSearchParams(queryString);

        const result = {};
        for (const [key, value] of params.entries()) {
            result[key] = value;
        }
        return result;
    }, [window.location.hash]);
}

export function getSafeTop(){
    return window.Telegram.WebApp.safeAreaInset?(window.Telegram.WebApp.safeAreaInset.top + window.Telegram.WebApp.contentSafeAreaInset.top+ 'px'):0
}

export async function getLocalId(){
    let deviceId = ss.get("DeviceID","")
    if(deviceId){
        return deviceId
    }else{
        try{
            const fp = await FingerprintJS.load()
            const ans = await fp.get()
            deviceId = ans.visitorId
        }catch (e){
            deviceId = uuidv4()
        }
        ss.set("DeviceID",deviceId)
        return deviceId
    }
}

export function getCurrencySignal(currency){
    switch (currency){
        case "USD":
            return "$"
        case "TWD":
            return "NT$"
        default:
            return "$"
    }
}