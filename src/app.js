
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
  function errorPage (code = "404", title = "Not Found", subtitle = "This is NOT your problem! Please contect the blog owner.", cursor = "https://s1.ax1x.com/2020/08/30/dqmuwT.png") {

    return `
    
    
    <!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width">
  <title>${code} ${title} - SecretLake</title>
  <style>
  *{overflow:hidden;cursor:url("${cursor}"),auto;}
    div {width: 100vw;text-align: center;user-select:none;}
    a, a:hover, a:visited, a:active, a:link {text-decoration: none;color: #000;}
    .a404{height: 66px;margin-top: calc(50vh - 80px);font-weight:700;font-size:36px;}
    .hcode {font-size:55px;font-weight: 800;}
    .nfound{font-weight:500;color:gray;font-size:13px;}
    .powby {
      position:fixed;bottom:20px;left:0;
      font-size:12px;color:gray;
    }
  </style>
</head>
<body>
  <div class='a404'><span class='hcode'>${code}</span> ${title}</div>
  <div class='nfound'>${subtitle}</div>
  <div class='powby'>powered by <a href='//secretlake.org?form=errorPage_${code}'>SecretLake</a></div>
</body>
</html>`
  }
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
          let name = /\/article\/(\S+)/.exec(req._parsedUrl.pathname)[1], article = findArticle(name);
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
          console.log(name, article)
          if (article == undefined) {
            res.send(errorPage());
            return 0;
          }
          if (article.private && req._parsedUrl.path.split("?").pop() != "password") {
            res.send(errorPage("401", "Unauthorized", "This is a private article. Only its owner can see it."));
            return 0;
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

          let name = /\/lib\/(\S+)/.exec(req._parsedUrl.pathname)[1]
          if (name == "") return 0;
          if (existsSync(root + "/html/lib/" + name)) { res.sendFile(root + "/html/lib/" + name); return 0; }
          else {
            res.send(errorPage());
            res.statusCode = 404;
          }
          res.end()
        }
      }, {
        path: "/release/*",
        get (req, res) {
          let name = /\/release\/(\S+)/.exec(req._parsedUrl.path)[1]
          if (name == "" || name == undefined) return 0;
          if (name.indexOf(".") == -1)
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
      res.send(errorPage());
    })
    app.listen(80, () => { console.log("服务器已经运行 | 端口 80"); });
  }


}





module.exports = main
