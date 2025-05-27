export function delay(time=0){
    return new Promise((resolve)=>{
        setTimeout(()=>resolve(1),time)
    })
}