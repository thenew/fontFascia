/* The main script */

// Open the UI window
figma.showUI(__html__, { width: 400, height: 700 })

let fontInfos = {}

function getFontInfosFromMixed(node) {
  let fontInfos = []
  let start = 0
  let end = parseInt(node.characters.length, 10)

  const loopRange = function(start, end) {
    let data = []

    let from = start
    let to = end
    while (from < end) {
      let infos = node.getRangeFontName(from, to)

      // if results are stil mixed, decrease the range value
      while (typeof infos === `symbol`) {
        // divide by 2 the range
        to = Math.floor(from + (to - from) / 2)
        if (to > end) {
          to = end
        }
        infos = node.getRangeFontName(from, to)
      }

      // save in data array
      const infosId = `${infos.family}${infos.style}`
      if (
        data.filter(
          dataInfo =>
            dataInfo.fontName.family === infos.family &&
            dataInfo.fontName.style === infos.style
        ).length === 0
      ) {
        const nodeClone = Object.assign({}, node)
        nodeClone.name = node.name
        nodeClone.fontName = {}
        nodeClone.fontName.family = infos.family
        nodeClone.fontName.style = infos.style
        data.push(nodeClone)
      }

      // start searching again from new value
      from = to

      // reset to
      to = end
    }
    return data
  }

  fontInfos = loopRange(start, end)

  return fontInfos
}

function saveFontInfos(node, pageNode) {
  const fontFamily = node.fontName.family
  const fontStyle = node.fontName.style
  const id = `${fontFamily}${fontStyle}`

  const reference = {
    pageNodeId: pageNode.id,
    nodeId: node.id,
    nodeName: node.name
  }

  const fontInfo = {
    fontFamily: fontFamily,
    fontStyle: fontStyle,
    references: [reference]
  }

  // add uniq
  if (typeof fontInfos[id] === `undefined`) {
    fontInfos[id] = fontInfo
  } else {
    // add uniq reference
    // if (
    //   fontInfos[id].references.filter(
    //     ref => ref.nodeName === reference.nodeName
    //   ).length === 0
    // ) {
      fontInfos[id].references = [...fontInfos[id].references, reference]
    // }
  }
}

function initSearch() {
  figma.root.children.map(pageNode => {
    pageNode
      .findAll(node => node.type === `TEXT`)
      .map(node => {
        console.log('node: ', node)
        if (node.fontName === figma.mixed) {
          const fontInfosMixed = getFontInfosFromMixed(node)
          fontInfosMixed.forEach(node => saveFontInfos(node, pageNode))
        } else {
          saveFontInfos(node, pageNode)
        }
      })
  })

  fontInfos = objectSort(fontInfos)

  figma.ui.postMessage({ type: `fontInfos`, content: fontInfos })
}

// messages

figma.ui.onmessage = (pluginMessage, props) => {
  //   console.log('pluginMessage: ', pluginMessage)

  const { type, data } = pluginMessage
  switch (type) {
    case `init`:
      initSearch()
      break
    case `zoom`:
      const { pageNodeId, nodeId } = data
      const node = { id: nodeId }
      figma.currentPage = { id: pageNodeId }
      figma.viewport.scrollAndZoomIntoView([node])
      figma.currentPage.selection = [node]

      break

    default:
      break
  }
}

// utils

function objectSort(object) {
  const ordered = {}
  Object.keys(object)
    .sort()
    .forEach(key => {
      ordered[key] = object[key]
    })

  return ordered
}
