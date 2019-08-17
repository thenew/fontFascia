/* The UI script */
console.log('%c UI ', 'background: #000; color: #ffff00; padding: 1px 0;')

// init
// parent.postMessage({ pluginMessage: { type: 'init' } }, '*')

onmessage = event => {
    const message = event.data.pluginMessage

    const contentEl = document.getElementById('content')

    if (message.content) {
        const list = document.createElement('div')

        Object.keys(message.content).map(key => {
            let listItem = document.createElement('div')
            listItem.className = 'fontItem'

            let name = document.createElement('div')
            name.className = 'fontLabel'

            name.append(
                `${message.content[key].fontFamily} ${
                    message.content[key].fontStyle
                }`
            )

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
