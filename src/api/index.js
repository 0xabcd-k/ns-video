import req from './request'

export const apiVideo = {
    video:form=>req.get('/video',form),
    drama:form=>req.get('/drama/video',form)
}

export const apiAuth = {
    loginDevice:form=>req.post('/login/device',form)
}