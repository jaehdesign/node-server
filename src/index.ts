import { createServer } from 'node:http';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { resolve } from 'node:path';
import fs from 'node:fs/promises';
import 'dotenv/config';
import createDebug from 'debug';
import { HtmlError } from './error.js';

const createHtmlString = (title: string, header: string, content?: string) => `
    <!DOCTYPE html>
    <html lang="es">

    <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Node Server">
    <title>${title}</title>
    <link rel="shortcut icon" href="favicon.svg" type="image/svg+xml">
    <style>
        body {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 0;
        }

        header {
        background-color: #333;
        color: #fff;
        padding: 10px;
        text-align: center;
        }
    </style>
    </head>

    <body>
    <header>
        <h1>${header}</h1>
    </header>
    <main>
        ${content ? content : ''}   
    </main>

    </body>

    </html>
`;

const getController = async (
    request: IncomingMessage,
    response: ServerResponse,
) => {
    const { url } = request;
    const __dirname = resolve();
    const publicPath = resolve(__dirname, 'public');
    let title = '';
    let header = '';

    response.statusCode = 200; // Valor por defecto
    response.setHeader('Content-Type', 'text/html; charset=utf-8');

    if (url === '/favicon.svg') {
        const filePath = resolve(publicPath, 'favicon.svg');
        const buffer = await fs.readFile(filePath);
        response.setHeader('Content-Type', 'image/svg+xml');
        return response.end(buffer);
    }

    switch (url) {
        case '/':
            title = 'Home | Node server';
            header = 'Página de inicio';
            break;
        case '/about':
            title = 'About | Node server';
            header = 'Acerca de';
            break;
        default:
            response.statusCode = 404;
            title = '404 | Node server';
            header = 'Página no encontrada';
    }

    response.end(createHtmlString(title, header));
};

const postController = (request: IncomingMessage, response: ServerResponse) => {
    let body = '';

    request.on('data', (chunk) => {
        body += chunk.toString();
    });

    request.on('end', () => {
        // Handle the post data
        const data = JSON.parse(body);
        data.id = crypto.randomUUID();

        const result = {
            message: 'Datos recibidos',
            data,
        };

        response.statusCode = 201;
        response.setHeader('Content-Type', 'application/json; charset=utf-8');
        response.end(JSON.stringify(result));
    });
};

const appRouter = (request: IncomingMessage, response: ServerResponse) => {
    const { url, method } = request;

    if (!url) {
        // response.statusCode = 404;
        // response.end('Not found');

        server.emit(
            'error',
            new HtmlError('Not found url empty', 404, 'Not found'),
        );
        return;
    }

    debug(method, url);

    switch (method) {
        case 'GET':
            getController(request, response);
            break;

        case 'POST':
            postController(request, response);
            break;
        case 'PUT':
        case 'PATCH':
        case 'DELETE':
        default:
            response.statusCode = 405;
            response.setHeader('Content-Type', 'text/plain; charset=utf-8');
            response.end('Método no permitido');
    }
};

const listenManager = () => {
    const addr = server.address();
    if (addr === null) return;
    let bind: string;
    if (typeof addr === 'string') {
        bind = 'pipe ' + addr;
    } else {
        bind =
            addr.address === '::'
                ? `http://localhost:${addr?.port}`
                : `${addr.address}:${addr?.port}`;
    }
    console.log(`Server listening on ${bind}`);
    debug(`Servidor escuchando en ${bind}`);
};

const debug = createDebug('app:server');
const PORT = process.env.PORT || 3000;
// create a loca server to receive data from
const server = createServer(appRouter); // appRouter is the function that will handle the requests
// listen to the server
server.listen(PORT);
server.on('listening', listenManager);
server.on('error', (error: HtmlError, response: ServerResponse) => {
    if ('status'! in error) {
        error = { ...error, statusCode: 500, status: 'Internal Server Error' };
    }
    // console.error(error.message);
    debug(error.message, error.statusCode, error.status);

    const html = createHtmlString('Error', 'Error', error.message);
    response.statusCode = error.statusCode;
    response.statusMessage = error.status;
    response.setHeader('Content-Type', 'text/html; charset=utf-8');
    response.end(html);
});
