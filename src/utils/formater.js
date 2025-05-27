import { useState, useEffect } from 'react'

export function timeStamp2Time(timeStamp, format) {
    if (typeof timeStamp != 'number') timeStamp = Number(timeStamp)

    if (String(timeStamp).length === 10) {
        timeStamp = Number(timeStamp + '000')
    }

    var date = new Date(timeStamp)

    return format.replace(/ms/g, ('00' + date.getMilliseconds()).slice(-3))
        .replace(/s/g, ('0' + date.getSeconds()).slice(-2))
        .replace(/m/g, ('0' + date.getMinutes()).slice(-2))
        .replace(/h/g, ('0' + date.getHours()).slice(-2))
        .replace(/D/g, ('0' + date.getDate()).slice(-2))
        .replace(/M/g, ('0' + (date.getMonth() + 1)).slice(-2))
        .replace(/Y/g, String(date.getFullYear()))
}

export function getEleDistanceToPageLeft(element) {
    var distance = 0;
    while (element) {
        distance += element.offsetLeft;
        element = element.offsetParent;
    }
    return distance;
}

export function convertToBinary(file) {
    return new Promise((resolve, reject) => {
        if (file) {
            const reader = new FileReader();

            reader.onload = function (event) {
                const binaryString = event.target.result;
                const blob = new Blob([binaryString], { type: 'application/octet-stream' });

                resolve(blob);
            };

            // 以ArrayBuffer格式读取文件内容
            reader.readAsArrayBuffer(file);
        }
    })
}

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


/* react utils */
export function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => clearTimeout(timeout);
    }, [value, delay]);

    return debouncedValue;
}

export function numberToCurrency(num){
    return new Intl.NumberFormat('en-US',{
        style:'currency',
        currency:'USD'
    }).format(Number(num)).replace('$','').replace('.00','')
}

export function timeDifference(timestamp) {
    const now = Date.now();
    const diff = timestamp - now;
    const diffInSeconds = Math.floor(diff / 1000);
    let minutes = Math.floor(diffInSeconds / 60);
    let seconds = diffInSeconds % 60;
    if(minutes<0) minutes = 0 
    if(seconds<0) seconds = 0 
    const minutesFormatted = String(minutes).padStart(2, '0');
    const secondsFormatted = String(seconds).padStart(2, '0');
    // 返回结果
    return `${minutesFormatted}:${secondsFormatted}`;
}



/** 将number转换为string，格式为{00.0 k}，例如: 14.4k */
export function Trans_NumberToKiloNumberStr(num) {
    if(num < 1000) return num.toString();
    else {
        // 14.4k
        return (num / 1000).toFixed(1) +'k'
    }
}
export function LimitShow_Str(str = '', leftShowNum = 6, rightShowNum = 4) {
    // 太短的不限制
    if(str.length < leftShowNum + rightShowNum) return str;
    return str.slice(0, leftShowNum) + '...' + str.slice(str.length - rightShowNum, str.length);
}
export function useToggleText({ str = '', str_Max = 0 }) {
    let text = str || '';
    const need_Toggle_Text = str.length > str_Max;

    const [showFullText, setShowFullText] =  useState(false)
    if(need_Toggle_Text) {
        if(! showFullText) {
            text = str.slice(0, str_Max) + '...';
        }
    }
    return {
        need_Toggle_Text,
        showFullText, setShowFullText,
        text,
        hdl_Toggle_Detail() {
            setShowFullText(! showFullText);
        }
    }
}