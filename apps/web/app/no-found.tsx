'use client';

import Error from 'next/error';

// 当请求一个不存在的路由时，会渲染这个页面
export default function GlobalNotFound() {
  return (
    <html lang="en">
      <body>
        <Error statusCode={404} />;
      </body>
    </html>
  );
}
