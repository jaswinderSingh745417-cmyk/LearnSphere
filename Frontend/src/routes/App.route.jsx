import { createBrowserRouter } from "react-router-dom";
import PublicLayout from "../layouts/PublicLayout";
import Home from "../pages/public/Home";
import About from "../pages/public/About";
import Courses from "../pages/public/Courses";
import AuthLayout from "../layouts/AuthLayout";
import Register from "../pages/auth/Register";
import Login from "../pages/auth/Login";
import DashBoarRoute from "./DashBoard.route";
import StudentLayout from "../layouts/StudentLayout";
import ProtectedRoute from "./Protected.route";
import StudentDashboard from "../dashboards/StudentDashboard";
import InstructorLayout from "../layouts/InstructorLayout";
import InstructorDashboard from "../dashboards/InstructorDashboard";
import AdminLayout from "../layouts/AdminLayout";
import AdminDashboard from "../dashboards/AdminDashboard";
import DashBoardRoute from "./DashBoard.route";

const router = createBrowserRouter([
  //public routes
  {
    path: "/",
    element: <PublicLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "about",
        element: <About />,
      },
      {
        path: "courses",
        element: <Courses />,
      },
    ],
  },
  //Auth routes
  {
    path: "/",
    element: <AuthLayout />,
    children: [
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "register",
        element: <Register />,
      },
    ],
  },

  {
    path: "/dashboard",
    element: <DashBoardRoute />,
  },

  // Student
  {
    path: "/student",
    element: (
      <ProtectedRoute role={"student"}>
        <StudentLayout />
      </ProtectedRoute>
    ),

    children: [
      {
        path: "dashboard",
        element: <StudentDashboard />,
      },
    ],
  },

  // Instructor

  {
    path: "/instructor",
    element: (
      <ProtectedRoute role={"instructor"}>
        <InstructorLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "dashboard",
        element: <InstructorDashboard />,
      },
    ],
  },

  // Admin

  {
    path: "/admin",
    element: (
      <ProtectedRoute role={"admin"}>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "dashboard",
        element: <AdminDashboard />,
      },
    ],
  },
]);

export default router;
