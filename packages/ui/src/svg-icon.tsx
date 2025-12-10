import React from 'react'
import * as LucideIcons from 'lucide-react'
import type { LucideProps } from 'lucide-react'

/**
* SvgIcon
* - 通过传入 name 字符串来动态选择 lucide-react 的图标组件
* - 默认 size=24，strokeWidth=2
*/

type LucideMap = typeof LucideIcons
export type IconName = keyof LucideMap | (string & {})

export interface SvgIconProps extends LucideProps {
  name: IconName
  size?: number | string
  strokeWidth?: number
  color?: string
  className?: string
}

const FALLBACK_ICON = LucideIcons.Circle || (() => null)

export const SvgIcon: React.FC<SvgIconProps> = ({ name, size = 24, strokeWidth = 2, color, className, ...rest }) => {
  // runtime 从导入的对象中取图标组件
  const IconComponent = (LucideIcons as unknown as Record<string, React.ComponentType<LucideProps>>)[name] ?? FALLBACK_ICON

  // 如果传入了非字符串或组件不存在，也不会抛错，只渲染占位
  if (!IconComponent) return null

  // lucide-react 的图标组件支持 size, strokeWidth, className 等 props
  return (
    <IconComponent
      size={size}
      strokeWidth={strokeWidth}
      className={className}
      color={color}
      {...rest}
    />
  )
}

export default SvgIcon
