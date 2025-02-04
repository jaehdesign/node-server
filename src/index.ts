import http from 'node:http';
import { IncomingMessage, ServerResponse } from 'node:http';
import 'dotenv/config';
import createDebug from 'debug';
const debug = createDebug('app:server');

const PORT = process.env.PORT || 3000;

const creatHtmlString = (title: string, header: string, content?: string) => `
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Node server">
  <title>${title}</title>
  <link rel="shortcut icon" href="favicon.svg" type="image/svg+xml">
</head>

<body>
  <header>
    <h1>
${header}
    </h1>
  </header>
  <main>${content}</main>
</body>

</html>
`;

const getController = (request: IncomingMessage, response: ServerResponse) => {
    const { url } = request;
    let header = '';

    switch (url) {
        case '/':
            title = 'Home | Node Server';
            header = 'Página de inicio';
            break;
        case '/about':
            title = 'About | Node Server';
            header = 'Acerca de';
            break;
        default:
            response.statusCode = 404;
            response.setHeader('Content-Type', 'text/html; charset=utf-8');
            response.end(
                creatHtmlString('Node Server', 'Página no encontrada'),
            );
    }
};

const appRouter = (request: IncomingMessage, response: ServerResponse) => {
    const { url, method } = request;

    if (!url) {
        response.statusCode = 404;
        response.end('Not Found');
        return;
    }

    debug(method, url);

    switch (method) {
        case 'GET':
            break;

        default:
            response.statusCode = 405;
            response.end('Method not allowed');
    }
};

const server = http.createServer(appRouter);

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    debug(`Server is running on http://localhost:${PORT}`);
});
