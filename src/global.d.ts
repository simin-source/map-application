declare module '*.vue' {
  import { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module 'eruda';

declare module '@/assets/main.dart.js';

declare var centmap;

// source
declare module '*.scss';