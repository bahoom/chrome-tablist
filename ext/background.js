var windowId;

function open() {
  // if(windowId) {
  //   chrome.windows.get(windowId, {}, function(win) {
  //     console.log("win: " +  win);
  //    if (chrome.runtime.lastError) {
        // console.log(chrome.runtime.lastError.message);
    // } else {
        // Tab exists
    // }
  //   });
  // }
  
  chrome.windows.create({'url': 'main.html', 'type': 'panel'}, function(window) {
    windowId = window.id;
  });
}

chrome.browserAction.onClicked.addListener(open);
chrome.commands.onCommand.addListener(open);