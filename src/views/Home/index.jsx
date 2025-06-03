import "./style.less"
import {useHashQueryParams} from "@/utils";
import {useEffect, useState} from "react";
import {apiVideo} from "@/api";
import { useMediaQuery } from 'react-responsive';
import ReactLoading from "react-loading";

export default function (){
    const params = useHashQueryParams()
    const isMobile = useMediaQuery({ maxWidth: 767 });
    const [loading,setLoading] = useState(false)
    const [drama,setDrama] = useState(null)
    async function init(){
        setLoading(true)
        if(params.drama){
            const dramaResp = await apiVideo.drama({
                idx: params.drama
            })
            if(dramaResp.success){
                setDrama(dramaResp.data)
            }
        }
        setLoading(false)
    }
    useEffect(() => {
        init()
    }, []);
    return <>
        {loading && <>
            <div className='mask'>
                <div className='loading'>
                    <ReactLoading type="bars" color="#fff"/>
                </div>
            </div>
        </>}
        {drama&&(isMobile?<>
            <div className='m-home'>
                <div className='m-h-header'>
                    <div className='m-h-h-left'>
                        <img className='m-h-h-logo' src={require("@/assets/logo.png")} alt='logo'/>
                    </div>
                    <div className='m-h-h-right'>
                        <div className='m-h-h-history'>
                            <svg t="1748934937683" className="icon" viewBox="0 0 1024 1024" version="1.1"
                                 xmlns="http://www.w3.org/2000/svg" p-id="2656" width="88" height="88">
                                <path
                                    d="M511.215 62.066c-247.841 0-448.76 200.919-448.76 448.766 0 247.841 200.919 448.76 448.76 448.76 247.847 0 448.766-200.919 448.766-448.76 0-247.847-200.919-448.766-448.766-448.766zM734.022 733.632c-5.145 5.145-11.888 7.718-18.625 7.718-6.743 0-13.486-2.573-18.63-7.718l-211.887-211.893v-267.967c0-14.558 11.803-26.348 26.342-26.348 14.545 0 26.348 11.791 26.348 26.348v246.152l196.452 196.452c10.289 10.278 10.289 26.971 0 37.256z"
                                    p-id="2657" fill="#f5315e"></path>
                            </svg>
                        </div>
                        <div className='m-h-h-login'>
                            login
                        </div>
                    </div>
                </div>
                <div className='m-h-content'>
                    <div className='m-h-title'>{drama.name}</div>
                    <img className='m-h-poster' src={drama.poster} alt='poster'/>
                    <div className='m-h-desc'>{drama.desc}</div>
                </div>
                <div className='m-h-video'>
                    {Array.from({length: drama.pay_num}).map((item, index) => {
                        return <div className='m-h-video-item free'>
                            <span>{index + 1}</span>
                        </div>
                    })}
                    {Array.from({length: drama.video_num - drama.pay_num}).map((item, index) => {
                        return <div className='m-h-video-item pay'>
                            <span>{index + drama.pay_num + 1}</span>
                        </div>
                    })}
                </div>
                <div className='m-h-btn-box'>
                    {drama.pay_num <= drama.video_num && <div className='m-h-btn-pay'>
                        <svg t="1748600990112" viewBox="0 0 1024 1024" version="1.1"
                             xmlns="http://www.w3.org/2000/svg" p-id="2342" width="88" height="88">
                            <path
                                d="M237.358431 284.464797l131.472334 375.310851-27.569916-19.554358L890.249275 640.22129c16.136515 0 29.212322 13.0799 29.212322 29.213345 0 16.129352-13.075807 29.205159-29.212322 29.205159L341.259826 698.639794c-12.409634 0-23.465434-7.836479-27.566846-19.549242L109.05016 94.8963l27.567869 19.553335L77.586564 114.449635c-16.129352 0-29.207206-13.074783-29.207206-29.212322 0-16.129352 13.077853-29.207206 29.207206-29.207206l59.032488 0c12.409634 0 23.466458 7.842619 27.566846 19.555381l52.728922 150.525272 710.724017 0c18.48705 0 32.326243 16.962324 28.612665 35.077913l-46.633087 227.389894c-2.547009 12.408611-12.796444 21.75549-25.382087 23.160489l-431.515944 48.065715c-16.036231 1.786693-30.482245-9.761318-32.266891-25.797549-1.783623-16.030092 9.764388-30.475082 25.798573-32.257681l410.798087-47.145763c0 0 20.75879-96.119151 35.926234-170.074513C893.311007 282.900162 362.038058 284.149619 237.358431 284.464797L237.358431 284.464797zM407.438061 818.372759c23.362081 0 42.36897 19.004843 42.36897 42.3659 0 23.360034-19.006889 42.364877-42.36897 42.364877-23.360034 0-42.363853-19.004843-42.363853-42.364877C365.073184 837.377602 384.078027 818.372759 407.438061 818.372759M407.438061 762.594385c-54.202483 0-98.142228 43.941791-98.142228 98.144274 0 54.207599 43.939745 98.143251 98.142228 98.143251s98.147344-43.936675 98.147344-98.143251C505.584382 806.536176 461.640544 762.594385 407.438061 762.594385L407.438061 762.594385zM816.372707 818.372759c23.357987 0 42.360783 19.004843 42.360783 42.3659 0 23.360034-19.002796 42.364877-42.360783 42.364877-23.360034 0-42.364877-19.004843-42.364877-42.364877C774.007831 837.377602 793.012673 818.372759 816.372707 818.372759M816.372707 762.594385c-54.206576 0-98.143251 43.941791-98.143251 98.144274 0 54.207599 43.937698 98.143251 98.143251 98.143251 54.200436 0 98.139158-43.936675 98.139158-98.143251C914.512888 806.536176 870.573143 762.594385 816.372707 762.594385L816.372707 762.594385zM816.372707 958.88191"
                                fill="#ffffff" p-id="2343"></path>
                        </svg>
                        <span>Purchase</span>
                    </div>}
                    <div className='m-h-btn-play'>
                        <img
                            src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAAAXNSR0IArs4c6QAAAWRJREFUWEft2L0uBUEYxvH/kygULkBBKNyAe3ABCoULUCrodSLhUkSBxCkkVBqlC1DQ6RUUkpdJbLIRZ3dm5+PMSXaqLWZ3fvs+uzO7IypvqtzHCIxNaP4raGYrwDGwBSwAd8CRpNfY6vic31lBM1sDHoHlPxf7BE6BM0nuOFvrA14C2x2jvwAHkq5zCfuA78CSx+BXv9DksfcBzQPXdMkSe0pgA00aew5gA00Se06gg0bHnhsYHXsp4ODYSwODY58FsB37nqT7rqlslsDGtSvpfBqyBuAbsCrp6z9kDUDn2pT0NAID1u121+ojrvYleQb2Jd3WNs0Erc+l3+Ib4FCSq55XKwV0IPdrMPFStTrlBgbFWXoeDI6zFHBwnLmB0XEOAX78/KAvejzYSeIcArwAdjqASeMcAtwAHqrd+nB3ZGbrrc0j983mNo9OQiZbj0dkapf5336LufsU544VjK1i9RX8Bm7FuSnbLuzHAAAAAElFTkSuQmCC"
                            alt='play-icon'/>
                        <span>Play Now</span>
                    </div>
                </div>
            </div>
        </> : <>
            <div className='p-home'>
                <div className='ph-header'>
                    <div className='ph-h-left'>
                        <img className='ph-h-logo' src={require("@/assets/logo.png")} alt='logo'/>
                        <div className='ph-h-home'>Home</div>
                    </div>
                    <div className='ph-h-right'>
                        <div className='ph-h-history'>
                            <svg t="1748934937683" className="icon" viewBox="0 0 1024 1024" version="1.1"
                                 xmlns="http://www.w3.org/2000/svg" p-id="2656" width="88" height="88">
                                <path
                                    d="M511.215 62.066c-247.841 0-448.76 200.919-448.76 448.766 0 247.841 200.919 448.76 448.76 448.76 247.847 0 448.766-200.919 448.766-448.76 0-247.847-200.919-448.766-448.766-448.766zM734.022 733.632c-5.145 5.145-11.888 7.718-18.625 7.718-6.743 0-13.486-2.573-18.63-7.718l-211.887-211.893v-267.967c0-14.558 11.803-26.348 26.342-26.348 14.545 0 26.348 11.791 26.348 26.348v246.152l196.452 196.452c10.289 10.278 10.289 26.971 0 37.256z"
                                    p-id="2657" fill="#f5315e"></path>
                            </svg>
                        </div>
                        <div className='ph-h-login'>Login</div>
                    </div>
                </div>
                <div className='ph-content'>
                    <img className='ph-c-poster' src={drama.poster} alt='poster'/>
                    <div className='ph-c-info'>
                        <div className='ph-c-i-name'>{drama.name}</div>
                        <div className='ph-c-i-desc'>{drama.desc}</div>
                        <div className='ph-c-i-btn-box'>
                            {drama.pay_num <= drama.video_num && <div className='ph-c-i-btn-pay'>
                                <svg t="1748600990112" viewBox="0 0 1024 1024" version="1.1"
                                     xmlns="http://www.w3.org/2000/svg" p-id="2342" width="88" height="88">
                                    <path
                                        d="M237.358431 284.464797l131.472334 375.310851-27.569916-19.554358L890.249275 640.22129c16.136515 0 29.212322 13.0799 29.212322 29.213345 0 16.129352-13.075807 29.205159-29.212322 29.205159L341.259826 698.639794c-12.409634 0-23.465434-7.836479-27.566846-19.549242L109.05016 94.8963l27.567869 19.553335L77.586564 114.449635c-16.129352 0-29.207206-13.074783-29.207206-29.212322 0-16.129352 13.077853-29.207206 29.207206-29.207206l59.032488 0c12.409634 0 23.466458 7.842619 27.566846 19.555381l52.728922 150.525272 710.724017 0c18.48705 0 32.326243 16.962324 28.612665 35.077913l-46.633087 227.389894c-2.547009 12.408611-12.796444 21.75549-25.382087 23.160489l-431.515944 48.065715c-16.036231 1.786693-30.482245-9.761318-32.266891-25.797549-1.783623-16.030092 9.764388-30.475082 25.798573-32.257681l410.798087-47.145763c0 0 20.75879-96.119151 35.926234-170.074513C893.311007 282.900162 362.038058 284.149619 237.358431 284.464797L237.358431 284.464797zM407.438061 818.372759c23.362081 0 42.36897 19.004843 42.36897 42.3659 0 23.360034-19.006889 42.364877-42.36897 42.364877-23.360034 0-42.363853-19.004843-42.363853-42.364877C365.073184 837.377602 384.078027 818.372759 407.438061 818.372759M407.438061 762.594385c-54.202483 0-98.142228 43.941791-98.142228 98.144274 0 54.207599 43.939745 98.143251 98.142228 98.143251s98.147344-43.936675 98.147344-98.143251C505.584382 806.536176 461.640544 762.594385 407.438061 762.594385L407.438061 762.594385zM816.372707 818.372759c23.357987 0 42.360783 19.004843 42.360783 42.3659 0 23.360034-19.002796 42.364877-42.360783 42.364877-23.360034 0-42.364877-19.004843-42.364877-42.364877C774.007831 837.377602 793.012673 818.372759 816.372707 818.372759M816.372707 762.594385c-54.206576 0-98.143251 43.941791-98.143251 98.144274 0 54.207599 43.937698 98.143251 98.143251 98.143251 54.200436 0 98.139158-43.936675 98.139158-98.143251C914.512888 806.536176 870.573143 762.594385 816.372707 762.594385L816.372707 762.594385zM816.372707 958.88191"
                                        fill="#ffffff" p-id="2343"></path>
                                </svg>
                                <span>Purchase</span>
                            </div>}
                            <div className='ph-c-i-btn-play'>
                                <img
                                    src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAAAXNSR0IArs4c6QAAAWRJREFUWEft2L0uBUEYxvH/kygULkBBKNyAe3ABCoULUCrodSLhUkSBxCkkVBqlC1DQ6RUUkpdJbLIRZ3dm5+PMSXaqLWZ3fvs+uzO7IypvqtzHCIxNaP4raGYrwDGwBSwAd8CRpNfY6vic31lBM1sDHoHlPxf7BE6BM0nuOFvrA14C2x2jvwAHkq5zCfuA78CSx+BXv9DksfcBzQPXdMkSe0pgA00aew5gA00Se06gg0bHnhsYHXsp4ODYSwODY58FsB37nqT7rqlslsDGtSvpfBqyBuAbsCrp6z9kDUDn2pT0NAID1u121+ojrvYleQb2Jd3WNs0Erc+l3+Ib4FCSq55XKwV0IPdrMPFStTrlBgbFWXoeDI6zFHBwnLmB0XEOAX78/KAvejzYSeIcArwAdjqASeMcAtwAHqrd+nB3ZGbrrc0j983mNo9OQiZbj0dkapf5336LufsU544VjK1i9RX8Bm7FuSnbLuzHAAAAAElFTkSuQmCC"
                                    alt='play-icon'/>
                                <span>Play Now</span>
                            </div>
                        </div>
                        <div className='ph-c-i-video'>
                            {Array.from({length: drama.pay_num}).map((item,index)=>{
                                return <div className='ph-c-i-video-item free'>
                                    <span>{index+1}</span>
                                </div>
                            })}
                            {Array.from({length: drama.video_num-drama.pay_num}).map((item,index)=>{
                                return <div className='ph-c-i-video-item pay'>
                                    <span>{index+drama.pay_num+1}</span>
                                </div>
                            })}
                        </div>
                    </div>
                </div>
                <div className='ph-bottom-1'>
                    <div className='ph-bottom-2'>
                        <div className='ph-b-list'>
                            <div className='ph-b-l-header'>
                                About
                            </div>
                            <div className='ph-b-l-item' onClick={()=>{
                                window.open("https://www.netshort.com/agreement/4","_blank")
                            }}>
                                Terms of Service
                            </div>
                            <div className='ph-b-l-item' onClick={()=>{
                                window.open("https://www.netshort.com/agreement/2","_blank")
                            }}>
                                Privacy Policy
                            </div>
                            <div className='ph-b-l-item' onClick={()=>{
                                window.open("https://www.netshort.com/faq","_blank")
                            }}>
                                FAQ
                            </div>
                        </div>
                        <div className='ph-b-list'>
                            <div className='ph-b-l-header'>
                                Contact Us
                            </div>
                            <div className='ph-b-l-item' onClick={()=>{
                                window.location.href = "mailto:support@netshort.com";
                            }}>
                                support@netshort.com
                            </div>
                            <div className='ph-b-l-item' onClick={()=>{
                                window.location.href = "mailto:business@netshort.com";
                            }}>
                                business@netshort.com
                            </div>
                        </div>
                        <div className='ph-b-list'>
                            <div className='ph-b-l-header'>
                                Community
                            </div>
                            <div className='ph-b-l-icon-box'>
                                <div className='ph-b-l-icon-item' onClick={()=>{
                                    window.open("https://www.facebook.com/profile.php?id=61564956644828","_blank")
                                }}>
                                    <img className='ph-b-l-icon-item-hover'
                                         src="data:image/png;base64,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"/>
                                    <img className='ph-b-l-icon-item-normal'
                                         src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAMAAACdt4HsAAAAhFBMVEUAAAA6Ojo5OTlAQEA5OTkwMDA6Ojo5OTk5OTk6Ojo6Ojo5OTk4ODg5OTk5OTk5OTkgICA5OTk6Ojo4ODg4ODg6Ojo3Nzc6Ojo5OTk4ODg3Nzc1NTU3Nzc4ODg6Ojp0dHRFRUVpaWlBQUFPT09wcHBeXl5mZmZXV1c9PT1sbGxLS0tJSUk4tIo8AAAAHnRSTlMA940EthDv6eHNx62FeWdZCNvbf19TNycjIBwYPDsYUHBRAAAB0UlEQVRYw6XX2XKjMBAF0Cs5bGEL3pfMJTh4Seb//28KiplxbLUs0HmyH/qWBF1UNyS7MkuTSJEqTtJstccoaz3nnUr/gqMgr2gU54FL+SKkSOkD7GZFSKuomMFi88qnXrcQlYoO1FI6vqYjbbzG2wudvbwJ9R4JM6FeTLi/heZIGj8sOVqJG1vF0dTm5gFY+ufjcm7ruv06Xx466v9jKCi5nuq/Gt4rMDhElJxrS0AYPH0Dp9oWwAV6gRLvX9sDhiPklFz+Vbdte+ajHJ2YkmYoPx1pVnX17xS1Qz1Fa3sTDwf4bW/o6mnAB0VzYE+fAO6w8gsokfkFZEhp8v3ZGQIu/R9zTIpE6IAHnzRJELsEyC8zgnINuNJEgY4BLc2cAxohwPkKJwpXiGhy7A21393vK41iJH6NlCD1C0j9W7n0C1hh5xewB+Y+ARUA7ROgAax9Avrhs5oeEKOTTw/I0QnCqQEqQG8xNUADwxGmBUQHDIppAcXTEaf56j5FzZEDccTBZsqQtcWNkqMtfQdN71HXd9j2Hfe9Fw6zpdvKU0K0dVm6Nva1L6JVWMxgd9DKUr4InFbfmEZVHsDR++PyPddrjLJfZWkSK1JFSZqVOwj+AN7id+gXcsVLAAAAAElFTkSuQmCC"/>
                                </div>
                                <div className='ph-b-l-icon-item' onClick={()=>{
                                    window.open("https://www.youtube.com/@NetShort-app","_blank")
                                }}>
                                    <img className='ph-b-l-icon-item-hover'
                                         src="data:image/png;base64,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"/>
                                    <img className='ph-b-l-icon-item-normal'
                                         src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAAXNSR0IArs4c6QAACQVJREFUeF7lW2toXMcVPnNX0pVl47fBsmVbcuW3YwvX8t67SsE/+6OlCW1oIIEkJBBDfrSFhjjE0IQkNKGFpj8KCbSQ0hZaWmig+dGfhuK9d63Ylh0ZPyTbsiV7ZSzb8mu9euxM97vZWd9d72rP3ZfW5MBlV9qZOWe+OXPOmTPnCqoxWZbVGQqFwqlUaqcQAk+HUqpDCLGUiFoz7JNKqQkhxIRSapiIhoUQX6VSqVgsFhurpYiiFoNblhUWQjyfnsQPiKi7Eh4ZQL5QSn3huu6RSsYq1LdqAPT09CxtbW19QwjxshCiokkXm6RSakQI8WkikfhsYGBgshpgVAxAZuI/Mwzj50QEta4HYct8Ojs7+3F/f/94JQzLBmD//v1NU1NTrwohPqrjxPPnCptxyDTNPx0+fHi2HCDKAqCvr2+LUupzIrLKYVqDPm7acL4YjUYvBB07MACWZb1gGMYffRY8KM9atU9KKQ+4rvvnIAzYAGRU/jdCCOz1hiWl1G9N03ybuyVYAHR2dra2t7f/M+PWGnbyWjCl1H/j8fizIyMjyVLClgQgM/l/CyG+X2qwRvqdC8KcAGTU/j9P2uR9mvClaZrPzrUd5gTAtm3s+V820soGlUUp9YnjOL8o1q8oAJZlvWQYBlzdE09Syhdd1/1boYkUBCASiXyHiAYb0NWVuxhJIUTPkSNHzuUP8BgA2PfT09P/a6Agp9xJ5/dzW1pavpdvDx4DwLbt13HgqBbXRhpHKXXAcZzP/DLlANDb27u6ubn5ayJaGVTw5uZmam1tJXziaWpqolAo5D36u2EYJITw/i5Es7PfhPOpVCr74H/4G594ZmZmKJlM0vT0dFAR0X4ykUh0+U+SOQDYtv27oJHeqlWrqL29nRYtWlSOQGX3SSQSND4+TtevXyelFHscKeW7ruu+pztkAcCxtq2tLc41fFjNLVu20LJly9jMa9Hwzp07dP78eU8zmJSjBVkAIpHIW+nJ42hbkqDG27Zto6VL63X8n1ukBw8e0KlTp9iaIKU85Lruhxg1C4Bt25eEEJ0lZ09Ea9eupQ0bNuQ0hRrev3/fWwk8es/69zO+ox0+CxHsBQg2Ao+2F/i/tiumaVJbWxtBA/107do1GhkZ4YgPGYYdx9mUBSAcDj8dCoXg+koShOrt7c0xZHfv3qXh4WHPONWDAEZ3d3fO9gOwR48eLQpuvlxSSst13ZinAUFCXux5qL8mWOOBgQFvxetJWIienh5asGBBlu3Q0BDduHGDJYYOkTUAQ9xEZkdHB61fvz7LJB6P06VLl1hMq91o3bp1hEfT1atX6fLly1w2w9FodJMIh8MdoVBolNurq6vLc3uaMHmAMB8EF7xpk7eVPZqYmPA8ApeklF0iEon8mIj+xe20efNmWrnyUZwEhmA8HwQvtH379izr27dv05kzZ9iieHcXtm3/WghxkNsLDP3u7/Tp0wRfzCV4j8WLFxPU9datW9xuBdstXLiQdu/enf0N7vDkyZPsMaWUHwAApLp+wu21a9eunKgPDMGYS/v27ct6EACHLYSorhxC6L1nz55s16mpKTp27Bh7KNw2YQucIKIebi8wBGNNx48fD+T+/ABgDLgvhLOjo6NBojmPPeKDcDiclQWeCK4wAH0FDRjFhSW30969e6mlpSXbvL+/P5Dg+QDogSA8QEB8z43t4Qpt287Kgn6O43CnAj7j0ICH3PgfI+dPIBaLsYOPQv3zpcV2unLlCsGgcSgSieQ0i0ajnG66TRIA8I9SdQBAS8b16ZZl5YTF0ACuBoFXwwIAAwkPU4pgA/QZAm1d16X0kbdUt+zvDbcFIBnCWUR0nKRHxVsgnQKLp1Ngq7mQ1dIG3Lt3z3OLOFVyqRIAlFJj0IB+ItrLZZjvBuF34X+5VMgLoD8MH/cgo3lVwQ0OwA3i2usZ7gQQeSEC01RJIIS9inM8DF6xHMFccsEdwy1rChoI4QggLMt63zCMQ1wAdu7c6YWymgYHBwn5AC7hCIuEBs4PWPVKcggYB+NpevjwIZ04gbiOR0qpj0RfX99PlVJ/53Uh2rp1Ky1fvjzb/OzZs4Fieqgtsjrlhr9+OZcsWUI7duzI/gsLgQUJQM9BAzoNw2Af6Ddu3EirVz+ymRcuXPBC2fmgFStWeIlZTTdv3qRz5x67/CkqWiqVWuclRCKRyBC3nA3JECRFNCF8xTMfhLwE8hOaEEZfvHiRJYrOC+qMEPs+ID8JAZeFjOx8EFJz/rR8kOQMKkkcx3nTAyAcDluhUIh1isD+hSvEQUQTjNnYWE0LOh/Dd82aNdTZmZvERm6Sa1uklE+j8NKfFmfnBfOzQpAOBgiW3Z8S96fGy9EQfbXmv2rDAsAIwwD6iRs6ow8KLh3H8faO/2LknXRK/gOOoPC/cD/F7vgKjQGfr+8I8Hu+39f3hpg0vvvj+1IyYWxsQ+7qE9HBaDT6cQ4AmasxeAPWdQ9WAC4xiKClJlLO75g8XPHkJLtyNpkutW3XF6Q5l6OWZf0qjf67XEGgjtiHcEfzQVB7WH0EQFzKL5nJASCoFmimiMigEfjU11rYt/7rca6A/nawIVhhbUvwiRMiQl5MPsihKTPuxMzMzFP++uK6FUhgX/v3dr798N8bYtJBzvRccEsWSGCgb32JDECwbXurEAKnikfpXy7MjdkO5fVPOY6Dt1FyaK4yORRF/7Ux5xNMKinly8WKqEsVSrJD5GAi1a+1DnmLceSUyiJhgnd/njhCvbBpmj8su1QWM/5WF0vrJX/SQFBKfRmPx5+rSrm8BiFTOY6b5IYunkakZ5rmm1V9YcK/+TNF1KgkbTQXiVdmXitWFF2WESzWybbtbiHEXxqonthVSr3iOM7ZoJa65BsjxQb0vTaHI3Tg0tqgghZpP6mUOlj31+b8wqC+uKmp6S0hxIE6bgucfT9JJBK/r/QN0rI1IH9FMifJ13Hg4BZcBtUCJDLTY3+eSCT+UOnENe+qAeCfDAovDcP4UebGqdL3iIfh1qSU/4jFYnhBsqpUEwDywEAZnqWU+m6mFhGAwGbg8b8+PymEQGZ1TEo5aBjGaSml67our/61TFj+DyeXdtq6TYSmAAAAAElFTkSuQmCC"/>
                                </div>
                                <div className='ph-b-l-icon-item' onClick={()=>{
                                    window.open("https://www.instagram.com/netshortdrama","_blank")
                                }}>
                                    <img className='ph-b-l-icon-item-hover'
                                         src="data:image/png;base64,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"/>
                                    <img className='ph-b-l-icon-item-normal'
                                         src="data:image/png;base64,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"/>
                                </div>
                                <div className='ph-b-l-icon-item' onClick={()=>{
                                    window.open("https://www.tiktok.com/@netshortdramas","_blank")
                                }}>
                                    <img className='ph-b-l-icon-item-hover'
                                         src="data:image/png;base64,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"/>
                                    <img className='ph-b-l-icon-item-normal'
                                         src="data:image/png;base64,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"/>
                                </div>
                            </div>
                        </div>
                        <div className='ph-b-list'>
                            <div className='ph-b-l-header'>
                                Download App
                            </div>
                            <img className='ph-b-l-ios-download' src={require("@/assets/ios-donwload.png")} alt='ios' />
                            <img className='ph-b-l-android-download' src={require("@/assets/android-download.png")} alt='android'/>
                        </div>
                    </div>
                    <div className='ph-bottom-line'>
                        NetShort | All Rights Reserved | 2024 NETSTORY PTE. LTD.
                    </div>
                </div>
            </div>
        </>)}
    </>
}