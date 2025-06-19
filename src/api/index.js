import req from './request'
import {redirect} from "react-router-dom";

export const apiVideo = {
    video:form=>req.get('/video/meta',form),
    drama:form=>req.get('/drama/video',form),
    setHistory:form=>req.post('/drama/history',form),
    listHistory:form=>req.get('/drama/history',form),
    dramaList:form=>req.get('/drama/list',form),
    dramaI18:form=>req.get('/drama/i18n',form),
}

export const apiAuth = {
    loginDevice:form=>req.post('/login/device',form),
    userInfo:form=>req.get('/user/info',form),
    emailCode:form=>req.post('/email/code/login',form),
    loginEmail:form=>req.post('/login/email',form),
}

export const apiFinance= {
    recharge:form=>req.post('recharge/order',form)
}