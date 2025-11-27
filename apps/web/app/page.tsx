import { redirect } from 'next/navigation';

// 当应用被构建为静态文件时，会渲染这个页面
export default function RootPage() {
  redirect('/en');
}
