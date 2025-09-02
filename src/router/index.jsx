import {createHashRouter, Navigate, RouterProvider, useLocation,} from "react-router-dom";
import App from '@/App'
import Show from "@/views/Show";
import Redirect from "@/views/Redirect";
import Admin from "@/views/Admin/index.jsx";
import Koc from "@/views/Activity/Koc";
import Fission from "@/views/Activity/Fission";
import Check from "@/views/Check";
import Line from "@/views/Activity/Line";
import Home2 from "@/views/Home2";
import Login3 from "@/views/Login3";
import History2 from "@/views/History2";
import Activity2 from "@/views/Activity2";
import Message2 from "@/views/Message2";
import FacebookDeleted from "@/views/Login3/FacebookDeleted";
import Modal from "@/modal/Modal";
import Test from "@/views/Test";

function HomeWrapper() {
    const location = useLocation();
    return <Home2 key={location.search} />;
}

const router = createHashRouter([
    {path:"/",element:<App />,children:[
        {index: true, element:<HomeWrapper />},
        {path: "/home", element: <HomeWrapper />},
        {path: "/show", element: <Show />},
        {path: "/series", element: <Show />},
        {path: "/i18",element: <Redirect />},
        {path: "/admin114514", element: <Admin />},
        {path: "/koc", element: <Koc />},
        {path: "/activity/fission",element: <Fission />},
        {path: "/check", element: <Check />},
        {path: "/activity/line",element: <Line />},
        {path: "/search",element: <Show />},
        {path: "/login",element: <Login3 />},
        {path: "/history",element: <History2 />},
        {path: "/activity",element: <Activity2 />},
        {path: "/message", element: <Message2 />},
        {path: "/facebook/deleted",element: <FacebookDeleted/>},
        {path: "/test114514",element: <Test />}
    ]},
    {path:"*",element:<Navigate to="/"/>}
]);

export default <>
    <Modal/>
    <RouterProvider router={router} />
</>;