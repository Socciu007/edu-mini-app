/// <reference types="vite/client" />

declare module '*.svg?react' {
  import type { FC, SVGProps } from 'react'
  const ReactComponent: FC<SVGProps<SVGSVGElement>>
  export default ReactComponent
}

interface ImportMetaEnv {
  readonly VITE_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

interface Window {}
