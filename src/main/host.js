var http = require('http');
const host = {
    mainWindow: null,
    processPost(request, response) {
        var jsonString = '';
        request.on('data', data => jsonString += data);
        request.on('end', () => {
            let post = JSON.parse(jsonString)
            this.mainWindow.webContents.send('articleFromWebApp', post);
            response.writeHead(200, {
                "Content-Type": "text/html",
                "Access-Control-Allow-Origin": "*"
            });
            let msg = {
                "ok": true,
                "msg": "文章保存成功"
            };
            response.end(JSON.stringify(msg));
        });
    },
    start() {
        http.createServer((request, response) => {
            if (request.url == "/newArticleFromWebApp") {
                this.processPost(request, response)
            }
        }).listen(9416)
    }
}
host.start();
export default host;