import {createHashRouter, Navigate, RouterProvider,} from "react-router-dom";
import App from '@/App'
import Show from "@/views/Show";
import Home from "@/views/Home";
import Login from "@/views/Login";
import History from "@/views/History";
import Series from "@/views/Series";
import Redirect from "@/views/Redirect";
import Admin from "@/views/Admin/index.jsx";
import Login2 from "@/views/Login2";
const router = createHashRouter([
    {path:"/",element:<App />,children:[
        {index: true, element:<Home/>},
        {path: "/login",element:<Login2/>},
        {path: "/login2",element:<Login2/>},
        {path: "/show", element: <Show />},
        {path: "/history", element: <History />},
        {path: "/series", element: <Series/>},
        {path: "/i18",element: <Redirect />},
        {path: "/admin114514", element: <Admin />},
    ]},
    {path:"*",element:<Navigate to="/"/>}
]);

export default <>
    <RouterProvider router={router} />
</>;