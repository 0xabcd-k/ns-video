import {createHashRouter, Navigate, RouterProvider,} from "react-router-dom";
import App from '@/App'
import Show from "@/views/Show";
import Home from "@/views/Home";
import Login from "@/views/Login";
const router = createHashRouter([
    {path:"/",element:<App />,children:[
        {index: true, element:<Home/>},
        {path: "/login",element:<Login/>},
        {path: "/show", element: <Show />}
    ]},
    {path:"*",element:<Navigate to="/"/>}
]);

export default <>
    <RouterProvider router={router} />
</>;