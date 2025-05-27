import req from './request'

export const apiDrama = {
    drama:form=>req.get('/drama',form),
    niceDrama:form=>req.get('/drama/nice',form),
    dramaRecommend:form=>req.get("/drama/recommend",form),
}

export const apiFinance = {
     balance:form=>req.get('/balance',form)
}

export const apiUser = {
    bind:form=>req.post('/bind/netshort',form)
}