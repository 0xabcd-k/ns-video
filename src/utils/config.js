export const Base = {
    Bot: ()=>{
        return "towindiabot"
    }
}

export const Twitter = {
    ClientId: ()=>{
        switch(process.env.NODE_ENV) {
            case 'development':
                return "dDZUa1V0TU5IbzNSdVp5YWYzNW86MTpjaQ"
            case 'production':
                return "Tks3NVhCTzQxblBYbDZQSnN1ZWU6MTpjaQ"
        }
    },
    RedirectHost: ()=>{
        switch(process.env.NODE_ENV){
            case 'development':
                return encodeURIComponent("http://localhost:8181")
            case 'production':
                return encodeURIComponent("https://web3.findo.freeland.ai")
        }
    }
}

export const Discord = {
    ClientId: ()=>{
        switch(process.env.NODE_ENV) {
            case 'development':
                return "1328618170394742835"
            case 'production':
                return "1328618170394742835"
        }
    },
    RedirectHost: ()=>{
        switch(process.env.NODE_ENV){
            case 'development':
                return encodeURIComponent("http://localhost:8181")
            case 'production':
                return encodeURIComponent("https://web3.findo.freeland.ai")
        }
    }
}