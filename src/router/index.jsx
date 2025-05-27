import {createBrowserRouter, createHashRouter, Navigate, RouterProvider,} from "react-router-dom";
import App from '@/App'
import Entry from "@/views/Entry";
import Drama from "@/views/Drama";
import Share from "@/views/Share";
import EntryV2 from "@/views/EntryV2";
const router = createHashRouter([
    {path:"/",element:<App />,children:[
        {path: "/:id", index: true, element:<EntryV2/>},
        {path: "/entry/:id", element: <Entry />},
        {path: "/drama",element: <Drama />},
        {path: "/share/:idx",element: <Share />}
    ]},
    {path:"*",element:<Navigate to="/"/>}
]);

export default <>
    <RouterProvider router={router} />
</>;