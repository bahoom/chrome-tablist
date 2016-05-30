
function activateTab(tabId, focusWindow=true, finished_callback) {
  chrome.tabs.update(tabId, {active: true}, function() {});
  
  if(focusWindow) {
    chrome.tabs.get(tabId, function(tab) {
      var windowId = tab.windowId;
    
      chrome.windows.get(windowId, function(win) {
        chrome.windows.update(windowId, {focused: true}, function() {
          finished_callback();
        });
      });
    });
  }
  else {
    finished_callback();
  }
}

function closeClicked(evt) {
  evt.stopPropagation();
  evt.preventDefault();
  
  var a = evt.target;
  var tabId = parseInt(a.parentNode.dataset.id);

  chrome.tabs.remove(tabId, function() {
    a.parentNode.remove();
  });

  return false;  
}

function tabClicked(evt) {
  evt.stopPropagation();
  evt.preventDefault();
  
  var a = evt.target;
  var tabId = parseInt(a.parentNode.dataset.id);

  activateTab(tabId);
  
  return false;
}

function onSearch(evt) {
  var query = evt.target.value.toLowerCase();
  var div = document.getElementById("res");
  
  [].forEach.call(div.children, function(child) {
    var content = child.innerHTML.toLowerCase()
    var matches = !!~content.indexOf(query)
    child.style.display = matches ? 'block' : 'none';
  });
  
  var selected = document.getElementsByClassName("selected")[0];
  selected.classList.remove("selected");
}

function reload() {
  var container = document.getElementById("res");
  while (container.hasChildNodes()) {
    container.removeChild(container.lastChild);
  }
  
  chrome.windows.getAll({populate: true}, function(wins){
    wins.forEach(win => {
      var winp = document.createElement("hr")
      // winp.className = "winrow";
      // winp.appendChild(document.createTextNode("window"));
      container.appendChild(winp)
      
      win.tabs.forEach(tab => {
        var row = document.createElement("div");
        row.className = "tabrow";
        if(tab.selected) {
          row.className += " current";
        }        
        
        row.setAttribute("data-id", tab.id);
       
        var a = document.createElement("a");
        a.className = 'close';
        a['href'] = "#";
        a.setAttribute("onclick", "return false;");
        a.setAttribute("data-id", tab.id);
        a.appendChild(document.createTextNode("x"));
        a.addEventListener('click', closeClicked);
        row.appendChild(a);
     
        var icon = document.createElement("img");
        icon.className = "favicon";
        icon['src'] = tab.favIconUrl;
        row.appendChild(icon);
     
        var title = document.createElement("a");
        title['href'] = "#";
        title.setAttribute("data-id", tab.id);
        title.appendChild(document.createTextNode(tab.title));
        title.addEventListener('click', tabClicked);
     
        row.appendChild(title);
     
        container.appendChild(row);
      })
    })
  })
}

window.addEventListener ("load", function() {
  reload();
  
  var search = document.getElementById("search");
  search.addEventListener('search', onSearch);
  search.focus();
}, false);

chrome.tabs.onCreated.addListener(reload);
// chrome.tabs.onRemoved.addListener(reload);

document.addEventListener("keydown", function (evt) {

  if(evt.keyCode == 40) { // down
    var rows = document.getElementsByClassName("tabrow");
    rows = Array.prototype.slice.call(rows);
    rows = rows.filter(e => {
      return e.style.display != 'none'
    })
    
    var selected = document.getElementsByClassName("selected")[0];
    
    if(selected) {
      selected.classList.remove("selected");
      var selectedIdx = rows.indexOf(selected);
      rows[selectedIdx+1].classList.add('selected');
      rows[selectedIdx+1].scrollIntoViewIfNeeded();
    }
    else {
      rows[0].classList.add('selected');
      document.getElementById("search").blur();
    }
    
    evt.preventDefault();
  }
  else if(evt.keyCode == 38) { // up
    var rows = document.getElementsByClassName("tabrow");
    rows = Array.prototype.slice.call(rows);
    rows = rows.filter(e => {
      return e.style.display != 'none'
    })
    
    var selected = document.getElementsByClassName("selected")[0];
    var selectedIdx = rows.indexOf(selected);
    
    if(selected) {
      selected.classList.remove("selected");
      if(selectedIdx == 0) {
        document.getElementById("search").focus();
      }
      else {
        rows[selectedIdx-1].classList.add('selected');
        rows[selectedIdx-1].scrollIntoViewIfNeeded();
      }
    }
    else {
      rows[0].classList.add('selected');
    }
    
    evt.preventDefault();
  }
  else if(evt.keyCode == 13) { // enter
    var selected = document.getElementsByClassName("selected")[0];
    if(selected) {
      var tabId = parseInt(selected.dataset.id);
      activateTab(tabId, true, function() {
        window.close();
      });
    }
    evt.preventDefault();
  }
  else if(evt.keyCode == 70 && evt.ctrlKey) { // ctrl+f
    window.scrollTo(0, 0);
    document.getElementById("search").focus();
  }
  else if(evt.keyCode == 8 || evt.keyCode == 46) { // del
    if(document.activeElement != document.getElementById("search")) {
      var selected = document.getElementsByClassName("selected")[0];
      var tabId = parseInt(selected.dataset.id);
      chrome.tabs.remove(tabId, function() {
        selected.remove();
      });
    }
  }
  else {
    document.getElementById("search").focus();
  }
});

