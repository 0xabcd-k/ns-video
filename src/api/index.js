import req from './request'

export const apiVideo = {
    video:form=>req.get('/video',form),
}