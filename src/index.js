import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import routes from './routes';

const router = createBrowserRouter(routes, {
    future: {
        v7_relativeSplatPath: true,
    },
});

ReactDOM.render(
    <RouterProvider router={router} />,
    document.getElementById('root')
);
