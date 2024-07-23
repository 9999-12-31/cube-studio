
import os,requests,json
upload_url = 'http://127.0.0.1:8080/aihub/chat-embedding/api/upload_files'
files=['cube-studio.csv','cube-studio.md']
files_content = [('files', (os.path.basename(file), open(file, 'rb'))) for file in files]
files_content = [
    ('file1',(os.path.basename('cube-studio.csv'), open('cube-studio.csv', 'rb'))),
    ('file2',(os.path.basename('cube-studio.md'), open('cube-studio.md', 'rb'))),
]
data = {"knowledge_base_id": 'cube-studio'}
print(data)
print(files_content)
response = requests.post(upload_url, files=files_content, data=data)
print(json.dumps(json.loads(response.text), ensure_ascii=False, indent=4))


import requests,time
data = {
    "chat_id":"cube-studio",
    "query":"如何部署cube-studio平台？",
    "topn":1,
    "min_Score":0.9
}
begin_time = time.time()
res = requests.post('http://127.0.0.1:8080/aihub/chat-embedding/api/recall',json=data)
print(res.json())
print(time.time()-begin_time)
