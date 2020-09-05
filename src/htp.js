module.exports = {
  parseHTML (htmlTP, valuesR) {
    function get (path, values, returnObj = 0) {
      path = path.split("."), tmp = values;
      try {
        path.forEach((a) => {
          tmp = tmp[a];
        });
        if (tmp instanceof Object) {
          if (returnObj) return tmp;
          return JSON.stringify(tmp);
        }
        else
          return tmp;
      }
      catch (a) { return a; }
    }
    function parseStr (string, processingFunc, settings = {}, ...args) {
      let defaultSettings = {
        leftHandStr: "{{{",
        rightHandStr: "}}}"
      }

      for (let i in defaultSettings) if (settings[i] == undefined) settings[i] = defaultSettings[i];
      const IN_TP_STR = 0, REGULAR_HTML = 1, leftHandStr = settings.leftHandStr, rightHandStr = settings.rightHandStr;
      let status = REGULAR_HTML, tmpStr = "", unmatchedSymbolsCount = 0, matches = [];
      for (let i = 0; i <= string.length - Math.max(leftHandStr.length, rightHandStr.length); i++) {
        switch (status) {
          case REGULAR_HTML: {
            if (string.substr(i, leftHandStr.length) == leftHandStr) {
              unmatchedSymbolsCount++;
              tmpStr = leftHandStr[0];
              status = IN_TP_STR;
            }
            break;
          }
          case IN_TP_STR: {
            if (string.substr(i, leftHandStr.length) == leftHandStr) unmatchedSymbolsCount++;
            if (string.substr(i, rightHandStr.length) == rightHandStr) unmatchedSymbolsCount--;
            if (unmatchedSymbolsCount <= 0) {
              status = REGULAR_HTML;
              tmpStr += rightHandStr;
              if (processingFunc instanceof Function)
                matches.push({
                  startPos: i - tmpStr.length + 3,
                  length: tmpStr.length,
                  replacement: processingFunc(tmpStr, ...args)
                })
            }
            tmpStr += string[i];
          }
        }
      }
      let offset = 0;
      for (let i = 0; i < matches.length; i++) {

        string = string.substr(0, matches[i].startPos + offset) +
          matches[i].replacement +
          string.substr(matches[i].length + matches[i].startPos + offset, string.length)
        offset += matches[i].replacement.length - matches[i].length
      }
      return {
        str: string,
        matches: matches
      }
    }
    return parseStr(htmlTP, function parseFn (str, values = valuesR) {
      str = str.substr(3, str.length - 6)
      let content = str[0] == ":" ? str.split(":").slice(2).join(":") : str;
      let type = str[0] == ":" ? str.split(":")[1].split(" ")[0] : "value"
      switch (type) {
        case "for": {
          let args = str.split(":")[1].split(" "), forArgs = {};
          for (let i = 0; i < args.length; i++) {
            function setArg (str, alias = str) {
              if (args[i] == str)
                forArgs[alias] = args[i + 1];
            }
            setArg("for", "forValue");
            setArg("in");
            setArg("sort");
          }

          let forVal = get(forArgs.in, values, 1), htmlTemp = "";
          if (forVal instanceof Array)
            for (let i = 0; i < forVal.length; i++) {
              let tmpObj = {};
              tmpObj[forArgs.forValue] = forVal[i];
              htmlTemp += parseStr(content, parseFn, undefined, tmpObj).str;
            }
          else
            for (let i in forVal) {
              let tmpObj = {};
              tmpObj[forArgs.forValue] = forVal[i];
              htmlTemp += parseStr(content, parseFn, undefined, tmpObj).str;
            }
          return htmlTemp;
        }
        case "value": {
          return get(content, values);
        }
      }
      return "";
    }).str

  }
}


