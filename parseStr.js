function parseStr (string, processingFunc, settings = {}) {
  let defaultSettings = {
    leftHandStr: "<",
    rightHandStr: ">"
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
              startPos: i - tmpStr.length + 1,
              length: tmpStr.length,
              replacement: processingFunc(tmpStr)
            })
        }
        tmpStr += string[i];
      }
    }
  }
  for (let i = 0; i < matches.length; i++)string = string.substr(0, matches[i].startPos) + matches[i].replacement + string.substr(matches[i].length + matches[i].startPos + 2, string.length)
  return {
    str: string,
    matches: matches
  }
}