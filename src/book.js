var pages = PAGES;

var currentPage = 'intro';
var inventory = [];

var textEl = document.querySelector(".content");
var choicesEl = document.querySelector(".choices");
var invEl = document.querySelector(".inventory");

var pagesFound = [];

function renderPage(page) {
  pagesFound.push(page);
  var isToc = page == 'toc';
  if (isToc) {
    page = {
      choices: Object.keys(pages)
    }
  } else {
    page = pages[page];
  }

  var theEnd = !page.choices;

  if (page.text) {
    textEl.innerHTML = '<p>' + page.text.replace(/\n/g,'<p>');

    if (theEnd) {
      textEl.innerHTML += "<p><a href='#' data-link='toc'>THE END</a>";
    }
  } else {
    textEl.innerHTML = "";
  }

  if (page.choices) {
    choicesEl.innerHTML = page.choices.map(function(choice) {
      var id = "" + choice;
      var link = pages[id];
      var page = Object.keys(pages).indexOf(id);
      var isAvailable = !link.requires || inventory.indexOf(link.requires) >= 0;
      var isFound = pagesFound.indexOf(id) >= 0;

      if (isToc && !isFound) {
        return '<li>Page not found' + '... [' + page + ']</a></li>';
      } else if (isAvailable || isToc) {
        return '<li><a href="#" data-link="' + id +'">' + link.title + '... [' + page + ']</a></li>';
      } else {
        return '<li>' + link.title + '...</li>'
      }
    }).join("");
  } else {
    choicesEl.innerHTML = "";
  }

  if (page.add) {
    inventory.push(page.add)
  }
  if (page.remove) {
    page.remove.forEach(function(item) {
      var index = inventory.indexOf(item);
      if (index > -1) {
        inventory.splice(index, 1);
      }
    })
  }
  if (theEnd) {
    inventory = [];
  }

  if (inventory.length) {
    invEl.innerHTML = "ITEMS: " + inventory.join();
  } else {
    invEl.innerHTML = "";
  }

}

renderPage('intro');

document.addEventListener('click', function(event) {
	var target = event.target;
  if (target.dataset.link) {
    renderPage(target.dataset.link)
  }
});
