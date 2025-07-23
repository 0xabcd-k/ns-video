import "./style.less"
import {getText,Text} from "@/utils/i18";
import {useState} from "react";
import {useNavigate} from "react-router-dom";
import ReactLoading from "react-loading";
import {apiVideo} from "@/api";

function getSearchKeys(){
    let m = {
        "en-US": ["CEO", "boss", "romance", "revenge", "pregnant",
            "emotional", "married", "divorce", "identity", "crush",
            "kiss", "fake", "billionaire", "mistress", "alpha",
            "cold", "queen", "toxic", "rebirth", "time",
            "travel", "knight"],
        "zh-TW": ["總裁", "超能力", "校園", "復仇", "青梅竹馬", "豪門", "甜寵",
            "暗戀", "犯罪", "推理", "靈異", "職場", "愛情",
            "親情", "家族", "黑幫", "醫療", "旅行", "逆襲",
            "魔法", "科幻", "懸疑", "犯罪心理", "戰爭", "喜劇", "情感",
            "宮鬥", "破案", "網戀", "偶像", "復仇者", "冒險", "超自然", "輕喜劇", "都市愛情"]
    }
    if(!m[navigator.language]){
        return m["en-US"]
    }else{
        return m[navigator.language]
    }
}

export default function (){
    const [list,setList] = useState(null)
    const navigate = useNavigate();
    const [searchKey,setSearchKey] = useState("")
    const [loading,setLoading] = useState(false);
    async function search(text){
        setLoading(true);
        const resp = await apiVideo.listDramaByKey({
            key: text,
        })
        if(resp.success){
            setList(resp.data.list)
        }
        setLoading(false)
    }
    return <>
        {loading && <>
            <div className='mask'>
                <div className='loading'>
                    <ReactLoading type="bars" color="#fff"/>
                </div>
            </div>
        </>}
        <div className='search'>
            <div className='search-header'>
                <div className='search-h-back' onClick={()=>{
                    navigate(-1)
                }}>{getText(Text.Back)}</div>
            </div>
            <div className='search-box'>
                <div className='search-box-input'>
                    <input type='text' onChange={(e)=>{setSearchKey(e.target.value)}} value={searchKey}/>
                    <div className='search-box-input-btn' onClick={async ()=>{
                        await search(searchKey)
                    }}>
                        <svg t="1753180834719" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4843" width="200" height="200"><path d="M670.528 760.96a384 384 0 1 1 90.496-90.496l180.224 180.288a64 64 0 0 1-90.496 90.496l-180.224-180.224zM448 704a256 256 0 1 0 0-512 256 256 0 0 0 0 512z" fill="#f5315e" p-id="4844"></path></svg>
                    </div>
                </div>
            </div>
            <div className='search-key'>
                {getSearchKeys().map((item,i)=>{
                    return <div className='search-key-item' onClick={async ()=>{
                        await search(item)
                    }}>
                        {item}
                    </div>
                })}
            </div>
            <div className='search-list'>
                <div className='search-list-items'>
                    {list && list.map((item, index) => {
                        return <div className='search-list-item' onClick={() => {
                            navigate(`/?drama=${item.idx}`)
                        }}>
                            <div className='search-list-item-tip'>
                                {getText(Text.CompleteSeries)}
                            </div>
                            <img className='search-list-item-tip-poster' src={item.poster} alt='poster'/>
                            <div className='search-list-item-tip-name'>{item.name}</div>
                        </div>
                    })}
                </div>
            </div>
        </div>
    </>
}