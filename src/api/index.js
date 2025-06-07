import req from './request'
import {redirect} from "react-router-dom";

export const apiVideo = {
    video:form=>req.get('/video/meta',form),
    drama:form=>req.get('/drama/video',form)
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