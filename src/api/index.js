import req from './request'
import {redirect} from "react-router-dom";

export const apiVideo = {
    video:form=>req.get('/video/meta',{lan:navigator.language,...form}),
    drama:form=>req.get('/drama/video',{lan:navigator.language,...form}),
    setHistory:form=>req.post('/drama/history',{lan:navigator.language,...form}),
    listHistory:form=>req.get('/drama/history',{lan:navigator.language,...form}),
    dramaList:form=>req.get('/drama/list',{lan:navigator.language,...form}),
    dramaI18:form=>req.get('/drama/i18',{lan:navigator.language,...form}),
    dramaRedeem:form=>req.post("/drama/redeem",{lan:navigator.language,...form}),
    listComment:form=>req.get('/drama/comment',{lan:navigator.language,...form}),
    addComment:form=>req.post('/drama/comment',{lan:navigator.language,...form}),
    review:form=>req.post('/review',{lan:navigator.language,...form}),
    listNotify:form=>req.get('/notify/list',{lan:navigator.language,...form}),
    readNotify:form=>req.post('/notify/read',{lan:navigator.language,...form}),
    listDramaByKey:form=>req.post('/drama/key',{lan:navigator.language,...form})
}

export const apiAuth = {
    loginDevice:form=>req.post('/login/device',{lan:navigator.language,...form}),
    userInfo:form=>req.get('/user/info',{lan:navigator.language,...form}),
    emailCode:form=>req.post('/email/code/login',{lan:navigator.language,...form}),
    loginEmail:form=>req.post('/login/email',{lan:navigator.language,...form}),
    isAccountExist:form=>req.get('/account/exist',{lan:navigator.language,...form}),
    loginPassword:form=>req.post('/login/password',{lan:navigator.language,...form}),
    loginTelegram:form=>req.post('/login/tg',{lan:navigator.language,...form}),
}

export const apiFinance= {
    recharge:form=>req.post('/recharge/order',{lan:navigator.language,...form}),
    rechargeList:form=>req.get('/recharge/order/list',{lan:navigator.language,...form})
}

export const apiAdmin = {
    login:form=>req.post("/video/admin/login",form),
    listVideo:form=>req.get("/video/admin/drama/list",form),
    createDrama:form=>req.post("/video/admin/create/drama",form),
    createVideo:form=>req.post("/video/admin/create/video",form),
    listDramaSeries:form=>req.get("/video/admin/drama/series/list",form),
    listSeriesDrama:form=>req.get("/video/admin/series/drama",form),
    createDramaSeries:form=>req.post("/video/admin/drama/series",form),
    updateDrama:form=>req.post("/video/admin/drama/update",form),

    listCDK:form=>req.get("/video/admin/cdk/list",form),
    createCDK:form=>req.post("/video/admin/cdk",form),

    VideoUploadToken:form=>req.post('/video/admin/upload/token',form),
}

export const apiTelegramChannelActivity = {
    getUserInfo:form=>req.get('/telegram/user/info',{lan:navigator.language,...form}),
    claimReward:form=>req.post('/telegram/reward/claim',{lan:navigator.language,...form}),
    redeemReward:form=>req.post('/telegram/reward/redeem',{lan:navigator.language,...form}),
    bindTelegram:form=>req.post('/telegram/bind',{lan:navigator.language,...form}),
    listGift:form=>req.get('/telegram/activity/gift',{lan:navigator.language,...form})
}

export const apiLineActivity = {
    getStatus:form=>req.get('/line/status',form),
    listGift:form=>req.get('/line/gift/list',form),
    redeem:form=>req.post('/line/gift/redeem',form),
    followAuthed:form=>req.post("/line/follow/authed",form)
}