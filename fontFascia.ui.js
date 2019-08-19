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
      let listItem = document.createElement('div')
      listItem.className = 'fontItem'

      let name = document.createElement('div')
      name.className = 'fontLabel'
      //   name.style.fontFamily = message.content[key].fontFamily

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
      if (message.content[key].references.length < 2) {
        warning.title = `Only one use`
        warning.innerText = `⚠️`
      }
      name.append(warning)

      // nodes
      const refList = document.createElement('ul')

      message.content[key].references.map((reference, index) => {
        let refItem = document.createElement('li')

        if (index === 9) {
          refItem.append('…')
          refList.append(refItem)
        }
        if (index > 8) return

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
