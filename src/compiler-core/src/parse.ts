import { NodeTypes } from './ast'

const enum TagType {
  START,
  END,
}

export function baseParse(content: string) {
  const context = createParserContext(content)
  return createRoot(parseChildren(context))
}

function parseChildren(context) {
  const nodes: any[] = []
  const s = context.source
  let node
  if (s.startsWith('{{')) {
    node = parseInterpolation(context)
  }
  else if (s[0] === '<') {
    if (/[a-z]/i.test(s[1]))
      node = parseElement(context)
  }

  if (!node)
    node = parseText(context)

  nodes.push(node)

  return nodes
}

function parseText(context) {
  const content = parserTextData(context, context.source.length)
  return {
    type: NodeTypes.TEXT,
    content,
  }
}

function parseElement(context) {
  const element = parseTag(context, TagType.START)

  parseTag(context, TagType.END)
  return element
}

function parseTag(context, type) {
  const s = context.source
  // 1. 解析 tag
  const match = /^<\/?([a-z]*)/i.exec(s)
  if (!match) return
  const tag = match[1]
  // 2. 删除处理完成代码
  advanceBy(context, match[0].length)
  advanceBy(context, 1)
  if (type === TagType.END) return

  return {
    type: NodeTypes.ELEMENT,
    tag,
  }
}

function parseInterpolation(context) {
  const openDelimiter = '{{'
  const closeDelimiter = '}}'

  const closeIndex = context.source.indexOf(closeDelimiter, closeDelimiter.length)

  advanceBy(context, openDelimiter.length)

  const rawContentLength = closeIndex - openDelimiter.length

  const content = parserTextData(context, rawContentLength)

  advanceBy(context, rawContentLength + closeDelimiter.length)

  return {
    type: NodeTypes.INTERPOLATION,
    content: {
      type: NodeTypes.SIMPLE_EXPRESSION,
      content: content.trim(),
    },
  }
}

function parserTextData(context, length) {
  const content = context.source.slice(0, length)
  advanceBy(context, length)
  return content
}

function advanceBy(context, length) {
  context.source = context.source.slice(length)
}

function createRoot(children) {
  return {
    children,
  }
}

function createParserContext(content: string) {
  return {
    source: content,
  }
}
