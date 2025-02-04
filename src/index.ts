import http from 'node:http';
import { IncomingMessage, ServerResponse } from 'node:http';
import 'dotenv/config';

const PORT = process.env.PORT || 3000;

const appRouter = (request: IncomingMessage, response: ServerResponse) => {
    const { url } = request;

    if (!url) {
        response.statusCode = 404;
        response.end('Not Found');
        return;
    }

    console.log('Request received', url);
    // response.statusCode = 200;
    response.end('Hola Amigos del Mundo');
};

const server = http.createServer(appRouter);

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
