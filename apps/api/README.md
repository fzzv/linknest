# Linknest API


## 导入书签

支持谷歌书签导出的 html 文件以及文件格式。

支持json格式如下：

type 支持 folder 和 link 两种类型。
folder 类型支持 children 数组，link 类型支持 url 和 icon 字段。
icon 支持 url 和 base64 两种格式。

```json
[
  {
    "type": "folder",
    "title": "工作",
    "children": [
      {
        "type": "link",
        "title": "title",
        "url": "url",
        "icon": "图标，支持url和base64"
      },
      {
        "type": "folder/link",
        "title": "title",
        "children": [
          {
            "type": "link",
            "title": "title",
            "url": "url",
            "icon": "图标，支持url和base64"
          }
        ]
      }
    ]
  },
  {
    "type": "link",
    "title": "title",
    "url": "url",
    "icon": "图标，支持url和base64"
  }
]
```
