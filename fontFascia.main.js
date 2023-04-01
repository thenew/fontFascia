/* The main script */
console.log('main')
// Open the UI window
figma.showUI(__html__, { width: 400, height: 700 })

let currentPage
let scope = `page`
let settings = {
  order: `descending`,
  sort: `count`
}
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

function init() {
  currentPage = figma.currentPage
  search()
}

function search() {

  // reset
  fontInfos = {}
  const containers = scope === `all` ? figma.root.children : [currentPage]

  containers.map(pageNode => {
    pageNode
      .findAll(node => node.type === `TEXT`)
      .map(node => {
        if (node.fontName === figma.mixed) {
          const fontInfosMixed = getFontInfosFromMixed(node)
          fontInfosMixed.forEach(node => saveFontInfos(node, pageNode))
        } else {
          saveFontInfos(node, pageNode)
        }
      })
  })

  fontInfos = sortSearch(fontInfos)

  postSearch(fontInfos)
}

function sortSearch(fontInfos) {
  let array =  [...Object.values(fontInfos)]

  if(settings.sort === `name`) {
    array = array.sort((a, b) => (a.fontFamily < b.fontFamily) ? 1 : -1)
  } else if(settings.sort === `count`) {
    array = array.sort((a, b) => (a.references.length > b.references.length) ? 1 : -1)
  }

  if(settings.order === `descending`) {
    array = array.reverse()
  }

  return Object.assign({},array)
}

function postSearch(fontInfos) {
  figma.ui.postMessage({ type: `fontInfos`, content: fontInfos })
}

// events
figma.on("currentpagechange", () => {
  currentPage = figma.currentPage
  search()
})

// messages

figma.ui.onmessage = (pluginMessage, props) => {
  const { type, data } = pluginMessage
  switch (type) {
    case `init`:
      init()
      break

    case `zoom`:
      const { pageNodeId, nodeId } = data
      const node = { id: nodeId }
      figma.currentPage = { id: pageNodeId }
      figma.viewport.scrollAndZoomIntoView([node])
      figma.currentPage.selection = [node]

      break

    case `formUpdate`:
      const { scopePage = false } = data
      scope = scopePage ? `page` : `all`
      search()
      break

    case `sort`:
      const { sort = `count`, order = `descending` } = data
      settings.sort = sort
      settings.order = order

      fontInfos = sortSearch(fontInfos)

      postSearch(fontInfos)
      break

    default:
      break
  }
}
