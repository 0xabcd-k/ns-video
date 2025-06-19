import {createHashRouter, Navigate, RouterProvider,} from "react-router-dom";
import App from '@/App'
import Show from "@/views/Show";
import Home from "@/views/Home";
import Login from "@/views/Login";
import History from "@/views/History";
import Series from "@/views/Series";
const router = createHashRouter([
    {path:"/",element:<App />,children:[
        {index: true, element:<Home/>},
        {path: "/login",element:<Login/>},
        {path: "/show", element: <Show />},
        {path: "/history", element: <History />},
        {path: "/series", element: <Series/>},
    ]},
    {path:"*",element:<Navigate to="/"/>}
]);

export default <>
    <RouterProvider router={router} />
</>;