// vue-login-skill 命名导出（v2：5 个 wrapper 组件 + LoginForm）
//
// 不导出 default —— 避免 consumer 命名歧义。
export { default as LoginForm } from '../templates/LoginForm.vue'
export { default as FlipLoginContainer } from '../templates/wrappers/FlipLoginContainer.vue'
export { default as SplitLayout } from '../templates/wrappers/SplitLayout.vue'
export { default as SplitProLayout } from '../templates/wrappers/SplitProLayout.vue'
export { default as ParticleBackground } from '../templates/wrappers/ParticleBackground.vue'
export { default as PuzzleCaptcha } from '../templates/wrappers/PuzzleCaptcha.vue'