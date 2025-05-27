import ReactDOM from 'react-dom/client'
import './common.less'
import router from './router'
const rootDom = document.getElementById('root')
const root = ReactDOM.createRoot(rootDom)
root.render(router);
