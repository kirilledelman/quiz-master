import useAppLoader from "./hooks/useAppLoader"
import { authOnlyLoader } from "./util/common"
import LoadingSpinner from "./components/LoadingSpinner"
import RootLayout from "./pages/RootLayout"
import HomePage from "./pages/HomePage"
import NewUserPage from "./pages/NewUserPage"
import LogInPage from "./pages/LogInPage"
import ErrorPage from "./pages/ErrorPage"
import UserEditPage, { updateUserAction } from "./pages/UserEditPage.jsx"
import QuizzesPage from "./pages/QuizzesPage"
import QuizEditPage, { quizLoader } from "./pages/QuizEditPage"
import QuizPage from "./pages/QuizPage.jsx"
import UserPage, { userLoader } from "./pages/UserPage.jsx"
import QuizStatsPage, { statsLoader } from "./pages/QuizStatsPage.jsx"
import LogOutPage from "./pages/LogOutPage.jsx"
import { createHashRouter, RouterProvider } from "react-router-dom"

/*
    Main router definition
*/
const router = createHashRouter([
    { path: '/', element: <RootLayout />, errorElement: <ErrorPage />,
    children: [
        { index: true, element: <HomePage/> },
        { path: 'user', children: [
            { index: true, loader: userLoader, element: <UserPage/> },
            { path: "edit", loader: authOnlyLoader, action: updateUserAction, element: <UserEditPage/> },
            { path: ":userId", loader: userLoader, element: <UserPage/> },
            { path: "new", element: <NewUserPage/> },
            { path: "login", element: <LogInPage/> },
            { path: "logout", element: <LogOutPage/>},
        ]},
        { path: 'quizzes', element: <QuizzesPage/> },
        { path: 'quiz', children: [
            { index: true, loader: quizLoader, element: <QuizEditPage/> },
            { path: ":quizId/stats", loader: statsLoader, element: <QuizStatsPage/> },
            { path: ":quizId/edit", loader: quizLoader, element: <QuizEditPage/> },
            { path: ":quizId", loader: quizLoader, element: <QuizPage/> },
        ]}
    ]},
] );

/*
    App root
    tries to log in if token is saved, then displays the router
*/

export default function App() {
    const loading = useAppLoader();

    // show loader while waiting
    if ( loading ) return (<LoadingSpinner/>);

    // router
    return (<RouterProvider router={router} />);
};
