import 'zmp-ui/zaui.css'
import './css/app.scss'
import './polyfills'
import 'dayjs/locale/vi'

import dayjs from 'dayjs'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import relativeTime from 'dayjs/plugin/relativeTime'
import React from 'react'
import { createRoot } from 'react-dom/client'

import App from './app'

dayjs.locale('vi-VN')
dayjs.extend(localizedFormat)
dayjs.extend(relativeTime)

const root = createRoot(document.getElementById('app')!)
root.render(React.createElement(App))
