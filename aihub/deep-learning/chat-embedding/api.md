
所有接口中chat_id用于区分不同知识库的场景名，可自行定义

# 上传私有知识库文件接口

允许已授权的用户通过此接口上传文件
```
curl --location 'http://xx.xx.xx/chat-embedding/api/upload_files' \
--header 'Authorization: admin' \
--form 'chat_id="native"' \
--form 'files=@"/Users/pengluan/Desktop/安全/safe.csv"'
```
**响应**：上传成功，返回json
**状态码**：200 OK
**响应示例**：
```
{
    "message": "success",
    "result": null,
    "status": 0
}
```
# 从之前上传的私有知识库中召回


```
curl --location 'http://xx.xx.xx/chat-embedding/api/inference' \
--header 'Authorization: admin' \
--header 'Content-Type: application/json' \
--data '{
    "chat_id":"native",
    "query": "吴亦凡审核规则"
}
'
```

**响应**：召回列表，并获取分数，返回json
**状态码**：200 OK
**响应示例**：
```
{
    "message": "success",
    "result": [
        {
            "markdown": "id: 726\ntitle: 专辑封面审核规则-通报人物\ndesc: 专辑封面审核规则的“通报人物”主要包括高危黑名单人物、劣迹失德艺人等内容\nkey_word: 高危黑名单&郭文贵&郝海东&劣迹艺人&失德艺人&郑爽&吴亦凡",
            "text": "得分：0.99"
        },
        {
            "markdown": "id: 87\ntitle: 吴亦凡-失德艺人\ndesc: 涉偷税漏税、聚众淫乱\nkey_word: 吴亦凡&Kris&凡凡&强奸&梅格妮",
            "text": "得分：0.96"
        },
        {
            "markdown": "id: 253\ntitle: 吴亦凡\ndesc: 强奸罪、逃税漏税\nkey_word: 吴亦凡&Kris&凡凡&梅格妮",
            "text": "得分：0.93"
        },
        ...
    ],
    "status": 0
}
```
# 文件分割


```
curl --location 'http://xx.xx.xx/chat-embedding/api/files_seg' \
--header 'Authorization: admin' \
--form 'chat_id="linshi"' \
--form 'files=@"/Users/pengluan/平台单机部署.md"'
```
**响应**：排序列表，并获取分数，返回json
**状态码**：200 OK
**响应示例**：
```
{
    "message": "success",
    "result": [
        {
            "file": "/data/k8s/kubeflow/global/knowledge/linshi/平台单机部署.md",
            "id": "0",
            "len": 411,
            "text": "平台单机部署\n# 基础环境依赖\n - docker >= 19.03  \n - kubernetes = 1.18~1.24\n - kubectl >=1.18  \n - cfs/ceph等分布式文件系统 挂载到每台机器的 /data/k8s/ （单机可忽略）\n - 单机 磁盘>=200G 单机磁盘容量要求不大，仅做镜像容器的的存储  \n - 控制端机器 cpu>=8 mem>=16G  \n - 任务端机器，根据需要自行配置  \n \n平台完成部署之后如下:\n\n<img width=\"100%\" alt=\"167874734-5b1629e0-c3bb-41b0-871d-ffa43d914066\" src=\"https://user-images.githubusercontent.com/20157705/168214806-b8aceb3d-e1b4-48f0-a079-903ef8751f40.png\">"
        },
        {
            "file": "/data/k8s/kubeflow/global/knowledge/linshi/平台单机部署.md",
            "id": "1",
            "len": 116,
            "text": "平台单机部署\n# 1、对于不熟悉k8s的同学\n可以参考视频，先使用rancher部署k8s，再部署cube-studio\n\n[单机部署视频](https://www.bilibili.com/video/BV18r4y147oj/)"
        },
        ...
    ],
    "status": 0
}
```
# 现场上传问题+文本分片数组，获取排序结果


```
curl --location 'http://xx.xx.xx/chat-embedding/api/ranking' \
--header 'Authorization: admin' \
--header 'Content-Type: application/json' \
--header 'Cookie: x-client-ssid=5011630a:018a967ddd98:01b8f6; x_host_key_access=71dd4e60793ae8769816cc587f1967b7e6f5842c_s' \
--data '{
    "source_sentence": "吴亦凡的艺人等级",
    "sentences_to_compare":["id: 87\ntitle: 吴亦凡-失德艺人\ndesc: 涉偷税漏税、聚众淫乱\nkey_word: 吴亦凡&Kris&凡凡&强奸&梅格妮","id: 666\ntitle: Q音粉丝社区相关处理规则补充\ndesc: Q音粉丝社区相关处理规则补充主要包含黄明志、陈芳语等反华艺人，吴亦凡、霍尊等违禁艺人等内容\nkey_word: 反华艺人&违禁艺人&邪教&宗教&涉政&色情低俗&广告黑产","id: 726\ntitle: 专辑封面审核规则-通报人物\ndesc: 专辑封面审核规则的“通报人物”主要包括高危黑名单人物、劣迹失德艺人等内容\nkey_word: 高危黑名单&郭文贵&郝海东&劣迹艺人&失德艺人&郑爽&吴亦凡","id: 253\ntitle: 吴亦凡\ndesc: 强奸罪、逃税漏税\nkey_word: 吴亦凡&Kris&凡凡&梅格妮"]
}
'
```
**响应**：排序列表，并获取分数，返回json
**状态码**：200 OK
**响应示例**：
```
{
    "message": "success",
    "result": [
        [
            "id: 87\ntitle: 吴亦凡-失德艺人\ndesc: 涉偷税漏税、聚众淫乱\nkey_word: 吴亦凡&Kris&凡凡&强奸&梅格妮",
            0.99
        ],
        [
            "id: 666\ntitle: Q音粉丝社区相关处理规则补充\ndesc: Q音粉丝社区相关处理规则补充主要包含黄明志、陈芳语等反华艺人，吴亦凡、霍尊等违禁艺人等内容\nkey_word: 反华艺人&违禁艺人&邪教&宗教&涉政&色情低俗&广告黑产",
            0.99
        ],
        [
            "id: 726\ntitle: 专辑封面审核规则-通报人物\ndesc: 专辑封面审核规则的“通报人物”主要包括高危黑名单人物、劣迹失德艺人等内容\nkey_word: 高危黑名单&郭文贵&郝海东&劣迹艺人&失德艺人&郑爽&吴亦凡",
            0.92
        ],
        [
            "id: 253\ntitle: 吴亦凡\ndesc: 强奸罪、逃税漏税\nkey_word: 吴亦凡&Kris&凡凡&梅格妮",
            0.92
        ]
    ],
    "status": 0
}
```