// 共通コンポーネントのexport集約
// Vue.js経験者向け解説:
// VueのpluginでglobalComponentsを登録するのと似た役割
// importを簡潔にするためのbarrel export

export { default as LoadingSpinner } from './LoadingSpinner'
export { default as ErrorMessage } from './ErrorMessage'