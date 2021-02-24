import React from 'react';
import ReactDOMServer from 'react-dom/server';
import express from 'express';
import { StaticRouter } from 'react-router-dom';
import App from './App';
import path from 'path';
import fs from 'fs';

const manifest = JSON.parse(
    fs.readFileSync(path.resolve('./build/asset-manifest.json'), 'utf8')
);

const chunks = Object.keys(manifest.files)
    .filter(key => /chunk\.js$/.exec(key)) // chunk.js 로 끝나는 키를 찾아서
    .map(key => `<script src="${manifest.files[key]}"></script>`) // 스크립트 태그로 변환 후 
    .join(''); // 합침

function createPage(root) {
    return
    `<!DOCTYPE html>
        <html lang="en">
            <head>
                <meta charset="utf-8" />
                <title>Serevr Side Rendering</title>
                <link href="${manifest.files['main.css']}" rel="stylesheet" />
            </head>
            <body>
                <div id='root'>${root}</div>
                <script src="${manifest.files['runtime~main.js']}"></script>
                ${chunks}
                <script src="${manifest.files['main.js']}"></script>
            </body>
        </html>`;
}

const app = express();

// 서버사이드 레더링 처리 함수 
const serverRender = (req, res, next) => {
    const context = {};
    const jsx = (
        <StaticRouter location={req.url} context={context}>
            <App />
        </StaticRouter>
    );
    // renderToString(): React 엘리먼트의 초기 html을 렌더링
    const root = ReactDOMServer.renderToString(jsx);
    res.send(createPage(root));
};

const serve = express.static(path.resolve('./build'), {
    index: false   // '/' 경로에서 index.html을 보여주지 않도록 설정
})

app.use(serve);
app.use(serverRender);

app.listen(5000, () => {
    console.log('Running on http://localhost:5000');
});
