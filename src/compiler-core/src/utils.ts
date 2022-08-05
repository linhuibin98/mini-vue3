import { NodeTypes } from './ast'

export const isText = node => [NodeTypes.TEXT, NodeTypes.INTERPOLATION].includes(node.type)
