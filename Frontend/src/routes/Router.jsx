import { createBrowserRouter } from "react-router-dom";
import PublicLayout from "../layouts/PublicLayout";
import Home from "../pages/public/Home";
import About from "../pages/public/About";
import Courses from "../pages/public/Courses";
import AuthLayout from "../layouts/AuthLayout";
import Register from "../pages/auth/Register";
import Login from "../pages/auth/Login";


const router = createBrowserRouter([

    //public routes
    {
        path:"/",
        element:<PublicLayout/>,
        children:[
            {
                index:true,
                element:<Home/>

                
            },
            {
                path:"about",
                element:<About/>
            },
            {
                path:"courses",
                element:<Courses/>
            }

        ]
    },
    //Auth routes
    {
        path:"/",
        element:<AuthLayout/>,
        children:[
            {
                path:"login",
                element:<Login/>

            },
            {
                path:"register",
                element:<Register/>
            }
        ]
    }
])

export default router
