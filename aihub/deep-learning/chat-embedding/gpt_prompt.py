import json
import re
import os
import openai
import pysnooper
openai.api_key = "xxx"
openai.base_url = 'https://xxx/v1'
# # list models
# models = openai.Model.list()
# # print the first model's id
# print(models.data)

# 获取实体变量
def get_entry(query):
    prompt=f'''
提取下面内容中主要实体变量和他们同义词或相似词。

```
{query}
```

    '''
    # create a chat completion
    chat_completion = openai.ChatCompletion.create(
        model="gpt-3.5-turbo-16k-0613",
        temperature=0,
        messages=[{"role": "user", "content": prompt}]
    )

    # print the chat completion
    result = chat_completion.choices[0].message.content
    # print(result)
    result = re.split('-|:| |/|\n|：|。|，|！|？|,|\.',result)
    # print(result)
    result = [x.strip() for x in result if len(x)<10 and x.strip()]
    result = list(set(result))
    print(result)
    return result
    # print(result)
    # result = re.split("同义词.*相似词",result)
    # if len(result)==2:
    #     print(result[0])
    #     print(result[1])
    #     return result[0],result[1]

        # entry_var = [x.strip() for x in result[0].split('\n') if x.strip()]
        # synonyms_var = [x.strip() for x in result[1].split('\n') if x.strip()]
        #
        # print('实体变量',entry_var)
        # print('同义词',synonyms_var)

# 尽量以文中的词汇来总结文章内容
# @pysnooper.snoop()
def get_summary(query):
    prompt = f'''
下面[CONTENT]中的内容是一篇文章，详细总结这篇文章的主要内容，在100字以内

[CONTENT]
{query}
[END CONTENT]
    '''
    # create a chat completion
    chat_completion = openai.ChatCompletion.create(
        model="gpt-3.5-turbo-16k-0613",
        temperature=0,
        # presence_penalty=-2,
        # frequency_penalty=-2,
        messages=[{"role": "user", "content": prompt}]
    )

    # print the chat completion
    result = chat_completion.choices[0].message.content
    print(result)
    return result

# 获取新的表达方式，不然embedding模型可能无法理解特殊的写法
def get_express(query):
    prompt = f'''
下面[CONTENT]中的内容是一篇文章，帮我换一种更简洁的表达方式描述文章的内容

[CONTENT]
{query}
[END CONTENT]
    '''
    # create a chat completion
    chat_completion = openai.ChatCompletion.create(model="gpt-3.5-turbo-16k-0613",messages=[{"role": "user", "content": prompt}])

    # print the chat completion
    result = chat_completion.choices[0].message.content
    print(result)
    return result

# 文档分割
def get_split(query):
    prompt = f'''
下面[CONTENT]中的内容是一篇文章，将这篇文章分割成几个相对独立的文本片段，每个片段长度不超过500字。

[CONTENT]
{query}
[END CONTENT]
    '''
    # create a chat completion
    chat_completion = openai.ChatCompletion.create(
        model="gpt-3.5-turbo-16k-0613",
        temperature=0,
        messages=[{"role": "user", "content": prompt}]
    )

    # print the chat completion
    result = chat_completion.choices[0].message.content
    result = [x.strip() for x in result.split("----") if x.strip()]
    for x in result:
        print(x)
    # print(result)
    return result

if __name__=='__main__':
    # content = open('docs/readme.md').read()
    # # print(content)
    #
    # content = get_split(content)

    def get_file_paths(directory):
        file_paths = []
        for root, dirs, files in os.walk(directory):
            for file in files:
                if '.md' in file:
                    file_path = os.path.join(root, file)
                    file_paths.append(file_path)
        return file_paths


    all_file_content = {}
    directory = "docs"
    file_paths = get_file_paths(directory)
    for file_path in file_paths:

        # # 获取实体变量
        # keyword = get_entry(open(file_path).read())
        # all_file_content[file_path] = keyword
        # # print(file_path)
        # # print(keyword)

        summary = get_summary(open(file_path).read())
        all_file_content[file_path]=summary
        # print(file_path)
        # print(summary)

    json.dump(all_file_content,open('summary.json',mode='w'),indent=4,ensure_ascii=False)


