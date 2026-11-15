import { BaseEdge, type EdgeProps } from '@xyflow/react'

/**
 * Đường nối kiểu phả đồ: từ đáy cha đi thẳng xuống giữa, rẽ ngang, rồi thẳng xuống đỉnh con.
 * Các con cùng cha có cùng midY nên dùng chung một "bus" ngang — không lệch, không đè chồng.
 */
export function TreeEdge({ sourceX, sourceY, targetX, targetY, style }: EdgeProps) {
  const midY = sourceY + (targetY - sourceY) / 2
  const path = `M ${sourceX},${sourceY} L ${sourceX},${midY} L ${targetX},${midY} L ${targetX},${targetY}`

  return <BaseEdge path={path} style={style} />
}
