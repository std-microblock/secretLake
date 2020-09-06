
const { basename, extname } = require("path");

async function main (root) {

  const { readFileSync, existsSync, fstat, writeFileSync } = require("fs");
  const { parseHTML } = require("./htp");
  const { readJSON } = require("./jsonmgr")(root);
  let express = require("express")
  let app = express()
  let bodyParser = require('body-parser');
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  function read (path) { return readFileSync(path).toString() }

  createServer();
  function createServer () {
    let server = require("./route")(app, [
      {
        path: "/favicon.ico",
        get (req, res) {
          res.sendFile(root + "/favicon.ico")
        }
      },
      {
        path: "/",
        get (req, res) {
          let tpl = read(root + "/html/index.html")
          res.send(parseHTML(tpl, {
            articles: readJSON("/data/articles.json")
          }))
        }
      }, {
        path: "/article/*",
        get (req, res) {
          let name = /\/article\/(\S+)/.exec(req._parsedUrl.path)[1], article = findArticle(name);
          function findArticle (name) {
            let article;
            let articles = readJSON("/data/articles.json");
            for (let x = 0; x < articles.length; x++) {
              if (articles[x].alias == name/*|| basename(articles[x]._content, extname(articles[x]._content)) == name*/) {
                article = articles[x];
                break;
              }
            }
            return article;
          }
          let html = parseHTML(
            readFileSync(root + "/html/article.html").toString(),
            {
              article: article,
              content: readFileSync(root + "/data/content/" + article._content).toString()
            });
          res.send(html);
        }
      }, {
        path: "/lib/*",
        get (req, res) {
          let name = /\/lib\/(\S+)/.exec(req._parsedUrl.path)[1]
          if (name == "") return 0;
          if (existsSync(root + "/html/lib/" + name)) { res.sendFile(root + "/html/lib/" + name); return 0; }
          else {
            res.send(`
          <!DOCTYPE html>
          <html lang="en">
          <head>
          <meta charset="utf-8">
          <title>Error</title>
          </head>
          <body>
          <pre>Cannot GET ${req._parsedUrl.path}</pre>
          </body>
          </html>`)
            res.statusCode = 404;
          }
          res.end()
        }
      }, {
        path: "/release/*",
        get (req, res) {
          let name = /\/release\/(\S+)/.exec(req._parsedUrl.path)[1]
          if (name == "" || name == undefined) return 0;
          if (name.split("/").length <= 2)
            res.sendFile(root + "/html/release/" + name + "/index.html")
          else
            res.sendFile(root + "/html/release/" + name)
        }
      },
      //-----------API-------------
      {
        path: "/api/releaseArticle",
        post (req, res) {
          req.body.createTs = req.body.lastEdit = new Date().valueOf();
          let articles = readJSON("/data/articles.json");

          let ext = ".md"
          writeFileSync(root + "/data/content/" + req.body.alias + ext, req.body.content)
          req.body._content = req.body.alias + ext
          req.body.content = undefined
          req.body._detail = req.body.alias + ".json"
          req.body.detail = undefined
          writeFileSync(root + "/data/detail/" + req.body.detail, "")
          articles.push(req.body)
          writeFileSync(root + "/data/articles.json", JSON.stringify(articles))
          res.end("a")
        }
      }
    ]);

    app.get('*', function (req, res) {
      res.statusCode = 404
      res.send(`<style>
      *{overflow:hidden;cursor:url("https://s1.ax1x.com/2020/08/30/dqmuwT.png"),auto;}
      .a404{
        left: 0;
        top: 0;
        width: 100vw;
        height: 60px;
        margin-top: calc(50vh - 80px);
        text-align: center;
        font-weight:700;
        font-size:40px;
        user-select:none;
    }
.nfound{
  width: 100vw;
  font-weight:500;
  color:gray;
  text-align: center;
  user-select:none;
}
    </style><div class="a404">404</div><div class="nfound">Not Found</div>`);
    });
    app.listen(80, () => { console.log("服务器已经运行 | 端口 80"); });
  }


}




module.exports = main
