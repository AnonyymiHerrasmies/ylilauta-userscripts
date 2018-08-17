// ==UserScript==
// @name Ylilauta: Lataa kaikki
// @namespace Violentmonkey Scripts
// @match *://ylilauta.org/*
// @require https://gitcdn.xyz/repo/Stuk/jszip/9fb481ac2a294f9c894226ea2992919d9d6a70aa/dist/jszip.js
// @require https://github.com/AnonyymiHerrasmies/ylilauta-userscripts/raw/64e3859524210c693fbc13adca01edc6acf42c80/script-toggler/runsafely.user.js
// @grant none
// @version 1.0
// @description Lataa kaikki mediatiedostot langasta
// ==/UserScript==

runSafely(() => {
  const buttonsRight = document.querySelector('.buttons_right')

  if (localStorage.getItem('downloadAllStorage') === 'true'
    && buttonsRight) {

    function afterLastSlash(text) {
      const parts = text.split('/')
      return decodeURI(parts[parts.length - 1])
    }

    function downloadContent(content, filename) {
      const href = window.URL.createObjectURL(content)
      const link = document.createElement('a')
      link.href = href
      link.download = filename

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(href)
    }

    async function downloadAll(event) {
      const el = event.target
      el.innerText = 'Ladataan...'
      el.disabled = true

      const mediaUris = [...document.querySelectorAll('a.file-content')]
        .map(e => e.href)
        .filter(uri => (!downloads.alreadySaved.includes(uri)) && (!uri.match(/youtube.com/)))

      let ex_msg = ''
      console.log(mediaUris)
      if (mediaUris.length === 0) {
        el.innerText = 'Tiedostoja ei löytynyt!'
      } else {
        const zip = new JSZip()

        let i = 0
        let ex_count = 0

        for (uri of mediaUris) {
          el.innerText = 'Ladataan... ('+ (++i) +'/'+ mediaUris.length +')'

          try {
            downloads.alreadySaved.push(uri)

            /*
                This causes a CORS-error, which I have yet to fix.
             */
            const response = await fetch(uri)

            const blob = await response.blob()
            console.log(response)
            const filename = afterLastSlash(response.url)
            console.log(filename)
            zip.file(filename, blob)
            console.log(blob)
          } catch (ex) {
            console.log('Zip-loader: ' + ex.toString().match(/(\w+(Error|Exception))/g).pop() + ' @ ' + uri)
            ex_count++
          }
        }

        if (ex_count !== 0) {
          ex_msg = ' <sup>(' +ex_count+ '!)</sup><span class="hoverlabel">' +ex_count+ ' filun lataus epäonnistui, tarkista konsolista lisätiedot</span>'
        }

        el.innerHTML = 'Luodaan zip...' + ex_msg

        downloads.timesDone++

        const zipFile = await zip.generateAsync({ type: 'blob' })
        const zipName = document.title +'-'+ afterLastSlash(window.location.href) + (downloads.timesDone === 1 ? '' : '-'+ downloads.timesDone) +'.zip'

        el.innerHTML = 'Zip luotu!' + ex_msg

        downloadContent(zipFile, zipName)
      }
      el.innerHTML = 'Lataa tiedostot' + ex_msg
      el.disabled = false
    }

    const downloadAllButton = document.createElement('button')
    downloadAllButton.innerText = 'Lataa tiedostot'
    downloadAllButton.className = 'linkbutton'
    downloadAllButton.onclick = (e) => downloadAll(e)

    const downloads = {
      alreadySaved: [],
      timesDone: 0
    }
    buttonsRight.insertBefore(downloadAllButton, buttonsRight.firstChild)
  }
})