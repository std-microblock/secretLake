module.exports = (app, paths) => {
  let tmp = []
  for (let i in paths) {
    if (paths[i].get != undefined)
      tmp.push(app.get(paths[i].path, paths[i].get))
    else
      tmp.push(app.post(paths[i].path, paths[i].post))
  }
  return tmp;
}