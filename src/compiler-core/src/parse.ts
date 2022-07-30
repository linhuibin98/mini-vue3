import { NodeTypes } from './ast'

interface Context {
  source: string
}

const enum TagType {
  START,
  END,
}

export function baseParse(content: string) {
  const context = createParserContext(content)
  return createRoot(parseChildren(context, []))
}

function parseChildren(context: Context, ancestors: string[]) {
  const nodes: any[] = []

  while (!isEnd(context, ancestors)) {
    let node
    const s = context.source
    if (s.startsWith('{{')) {
      node = parseInterpolation(context)
    }
    else if (s[0] === '<') {
      if (/[a-z]/i.test(s[1]))
        node = parseElement(context, ancestors)
    }

    if (!node)
      node = parseText(context)

    nodes.push(node)
  }

  return nodes
}

function isEnd(context: Context, ancestors: string[]) {
  const s = context.source
  // 是否是结束标签
  if (s.startsWith('</')) {
    for (let i = ancestors.length - 1; i >= 0; i--) {
      if (startsWidthEndTag(s, ancestors[i]))
        return true
    }
  }
  return s.length === 0
}

function parseText(context: Context) {
  const s = context.source
  const l = s.length
  let endIndex = l
  const endTokens = ['{{', '</']

  for (const t of endTokens) {
    const index = s.indexOf(t)

    if (index !== -1 && index < endIndex)
      endIndex = index
  }

  const content = parserTextData(context, endIndex)
  return {
    type: NodeTypes.TEXT,
    content,
  }
}

function parseElement(context: Context, ancestors: string[]) {
  // 处理开始标签
  const element = parseTag(context, TagType.START)!
  // 保存标签解析栈
  ancestors.push(element.tag)

  // 孩子节点递归
  element.children = parseChildren(context, ancestors)
  // 标签处理结束，移出栈
  ancestors.pop()

  // 处理结束标签
  if (startsWidthEndTag(context.source, element.tag))
    parseTag(context, TagType.END)

  else
    throw new Error(`缺少结束标签：${element.tag}`)

  return element
}

function startsWidthEndTag(source: string, tag: string) {
  return source.startsWith('</') && tag === source.slice(2, 2 + tag.length)
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
    children: [] as any,
  }
}

function parseInterpolation(context) {
  const openDelimiter = '{{'
  const closeDelimiter = '}}'

  const closeIndex = context.source.indexOf(closeDelimiter)

  advanceBy(context, openDelimiter.length)

  const rawContentLength = closeIndex - openDelimiter.length

  const content = parserTextData(context, rawContentLength)

  advanceBy(context, closeDelimiter.length)

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

function advanceBy(context: Context, length: number) {
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
