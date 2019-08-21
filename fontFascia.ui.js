/* The UI script */

// init
parent.postMessage({ pluginMessage: { type: 'init' } }, '*')

onmessage = event => {
  const message = event.data.pluginMessage

  const contentEl = document.getElementById('content')

  if (message.content) {
    const list = document.createElement('div')
    list.className = `fontList`
    let count = 1

    Object.keys(message.content).map(key => {
      const refLength = message.content[key].references.length

      let listItem = document.createElement('div')
      listItem.className = 'fontItem'

      let name = document.createElement('div')
      name.className = 'fontLabel'
      //   name.style.fontFamily = message.content[key].fontFamily

      name.addEventListener(`click`, event => {
        event.preventDefault()
        listItem.classList.toggle(`active`)
      })

      // icon
      var nameIcon = document.createElement('span')
      nameIcon.className = `icon`
      nameIcon.innerHTML = `<svg class="svg" width="6" height="6" viewBox="0 0 6 6" xmlns="http://www.w3.org/2000/svg"><path d="M3 5l3-4H0l3 4z" fill-rule="nonzero" fill-opacity="1" fill="#000" stroke="none"></path></svg>`
      name.append(nameIcon)

      // counter
      let counter = document.createElement(`span`)
      counter.className = `counter`
      counter.innerText = `${count}. `
      name.append(counter)
      count++

      name.append(
        `${message.content[key].fontFamily} ${message.content[key].fontStyle}`
      )

      // warning
      let warning = document.createElement('span')
      warning.className = `warning`
      if (refLength < 2) {
        warning.title = `Only one use`
        warning.innerText = `⚠️`
      }
      name.append(warning)

      let refNumber = document.createElement('span')
      refNumber.className = `refNumber`
      refNumber.innerText = `${refLength} use${refLength > 1 ? `s` : ``}`
      name.append(refNumber)

      // nodes
      const refList = document.createElement('ul')
      refList.className = `refList`

      message.content[key].references.map((reference, index) => {
        let refItem = document.createElement('li')

        if (index === 30) {
          refItem.append('…')
          refList.append(refItem)
        }
        if (index > 29) return

        const { nodeName } = reference
        let link = document.createElement('a')
        link.href = ' '
        link.className = 'nodeLink'

        link.append(nodeName)

        link.addEventListener(`click`, event => {
          event.preventDefault()
          parent.postMessage({ pluginMessage: 'anything here' }, '*')
          parent.postMessage(
            {
              pluginMessage: {
                type: 'zoom',
                data: reference
              }
            },
            '*'
          )
        })

        refItem.append(link)
        refList.append(refItem)
      })

      listItem.append(name)
      listItem.append(refList)
      list.append(listItem)
    })

    contentEl.innerHTML = ``
    contentEl.append(list)
  }
}
