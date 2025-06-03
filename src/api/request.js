import axios from 'axios'
import {Toast} from "react-vant";
import ss from 'good-storage'

let baseURL;

switch(process.env.NODE_ENV){
    case 'development':baseURL = 'http://localhost:13001';break;
    case 'production':baseURL = 'https://api.netshort.online';break;
}
export const BASE_URL = baseURL;
const instance = axios.create({
    baseURL:BASE_URL
});

instance.interceptors.request.use(function (config,data) {
    config.headers["Authorization"] = ss.get("Authorization","");
    return config;
}, function (error) {
    return Promise.reject(error);
});

instance.interceptors.response.use(function (response) {
    return response.data
}, function (error) {
    try{
        switch(error.response.status){
            case 401:
                break;
            default:
                Toast.info("The server is busy now. try again later.")
        }
    }catch(err){
        console.error(err)
    }
    return {code:0}
});

const tempGet = instance.get
instance.get = function(url,params){
    return tempGet(url,{
        params:params
    });
};
export default instance