// ==UserScript==
// @name Ylilauta.fi: Piilota tagipostaukset
// @namespace Violentmonkey Scripts
// @match *://ylilauta.org/*
// @grant none
// @version 0.3
// @locale en
// @description Piilottaa kaikki tagipostaukset
// ==/UserScript==

(function() {
  if (localStorage.getItem('tagpostHiderStorage') === 'true') {
    const allowedTags = [
      'postername',
      'tag text postedbyop',
      'tag text sage',
      'postnumber quotelink',
      'posttime'
    ];

    function shouldBeHidden(div) {
      const postinfo = Array.from(div.childNodes).find(c => c.className === 'postinfo');
      const tags = Array.from(postinfo.childNodes).find(c => c.className === 'tags');
      return Array.from(tags.childNodes)
        .map (t => t.className)
        .filter(t => t && !allowedTags.includes(t))
        .length !== 0;
    }

    function hide() {
      Array.from(document.querySelectorAll('div.op_post, div.answer'))
        .filter(div => shouldBeHidden(div))
        .map(div => {
          div.hidden = true;
          if (div.parentElement.classList.contains('thread')) {
            div.parentElement.style.display = 'none';
          }
        });
    } 

    function newRepliesListener(callback) {
      const observer = new MutationObserver(callback);
      
      observer.observe($('.answers')[0], { childList: true });
    }

    function isToggled(name) {
      return localStorage.getItem(name) !== "false";
    }

    hide();

    if ($('.answers').length > 0) {
      newRepliesListener(() => hide());
    }
  }
})();