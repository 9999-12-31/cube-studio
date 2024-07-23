
import json
import os
import pysnooper

def load_markdown(file_path):
    # 正则表达式
    import re
    # @pysnooper.snoop()
    # 获取存在的深层次的最顶层子标题
    def get_titles(level,max_level,content):
        # 需要先把markdown中的代码部分去掉
        pattern = r"\n\s{0,3}```[\s\S]*?\n\s{0,3}```"  # 匹配代码块的正则表达式
        content = re.sub(pattern, "", content)  # 将代码块替换为空字符串，不然影响判断
        # print(content)

        # 提取目录
        pattern = r'^(\s{0,3}#+\s.*)$'  # 以# 开头的是标题，标签前面最多允许3个空格
        titles = []
        while level < max_level:
            titles = []
            for line in content.split('\n'):
                match = re.match(pattern, line)
                if match:
                    summary = match.group(1)
                    # if re.match('\[.*\]\(.*\)',summary):   # 把特殊的写法去掉[]
                    #     summary = summary
                    summary = summary.lstrip(' ')  # 把前面可能的空格去掉
                    now_level = len(summary) - len(summary.lstrip('#'))  # 获取前面有多少个#
                    if level==now_level:
                        titles.append(summary)
            if titles:
                break
            else:
                level+=1
        return level,titles

    # 按某一级标题就行分割
    def split_content(level,titles,content):

        # 没有标题，那就是纯粹的文本
        if not titles:
            return [{
                "level": level,
                "content": content
            }]

        all_content = []
        # 标签前有一部分纯粹的内容
        first_title = titles[0]
        first_content = content[:content.index(first_title)]
        if first_content.strip():   # level级别标题最前面的可能包括子标题，与用户的写法有关
            all_content.append({
                "level": level,
                "content": first_content
            })

        content = content[len(first_content):]
        # 后面的内容按标题分割
        for index,title in enumerate(titles):
            if not content:
                break
            # print(markdown_text)
            # 以后一个标题，就到结尾
            if index == len(titles) - 1:
                sub_content = content[content.index(title):]
            # 否则到下一个标题前
            else:
                next_title = titles[index + 1]
                sub_content = content[content.index(title):content.index(next_title)]
            # print('----------------------')
            # print(sub_content)

            all_content.append({
                "level": level,
                "title": title,
                "content": sub_content[len(title):].strip('\n')  # 获取的内容，不需要带上标题
            })
            content = content[len(sub_content):]

        return all_content

    # @pysnooper.snoop(watch_explode=('all_sub_content'))
    def read_content(content,level,max_level):
        # 如果已经到了最大深度，直接返回
        if level>=max_level:
            return [{
                "level": level,
                "content": content
            }]


        level,titles = get_titles(level,max_level, content)

        # 如果没有子标题了，就直接返回
        if not titles:
            return [{
                "level": level,
                "content": content
            }]

        all_sub_content = split_content(level, titles, content)
        # print(all_sub_content)
        for sub_content in all_sub_content:
            # 子内容，才向下游继续探索
            if sub_content['content']:
                # 如果有子标题就向下探

                # 下游的内容中，就不要再包含当前的标签了
                deep_content = sub_content['content']
                content_temp = read_content(deep_content,level+1,max_level)
                # 如果下游没有更深层次的标题了，合并不再需要，之前就当前content就可以
                exist_sub_titles = [x.get('title','')!='' for x in content_temp]
                exist_sub_titles = sum(exist_sub_titles)
                if exist_sub_titles:
                    sub_content['sub_content'] = content_temp

                # # 没有标题就探索更深层次的标题
                # else:
                #     level,titles = get_titles(level,max_level,sub_content['content'].strip())
                #     if titles:
                #         for title in titles:
                #

        return all_sub_content

    if '.md' not in file_path:
        return []
    content = open(file_path).read()
    all_sub_content = read_content(content,1,6)
    # print(json.dumps(all_sub_content,indent=4,ensure_ascii=False))
    return all_sub_content




# 将markdown转成并列列表格式
# @pysnooper.snoop()
def markdown2segment(titles,markdown,max_token=1000):
    # print(json.dumps(markdown,indent=4,ensure_ascii=False))
    all_seg=[]
    for seg in markdown:
        # print(seg)
        new_titles = titles
        if seg.get('title',''):
            new_titles = titles + [seg.get('title','')]

        # 如果包含子分片，下钻提取
        if seg.get('sub_content',[]):
            sub_seg = markdown2segment(new_titles,seg['sub_content'],max_token)
            all_seg = all_seg+sub_seg
        else:
            # 没有子分片的长文本，就主题分割，或者不分割，或者随意分割
            # 自己看看是不是做其他分割
            all_seg.append('\n'.join(new_titles)+"\n"+seg['content'])
            pass

    return all_seg





if __name__=="__main__":
    import os

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
        # print(file_path)
        all_content = load_markdown(file_path)
        print(json.dumps(all_content,indent=4,ensure_ascii=False))
        all_file_content[file_path]=all_content

    #
    # for file_path in all_file_content:
    #     # print(json.dumps(all_file_content[file_path],indent=4,ensure_ascii=False))
    #     contents = markdown2segment(titles=[],markdown = all_file_content[file_path])
    #     #
        # markdowns = '\n\n-----------------\n\n'.join(contents)
        # new_path = file_path.replace('docs','docs1')
        # print(new_path)
        # os.makedirs(os.path.dirname(new_path),exist_ok=True)
        # file = open(new_path,mode='w')
        # file.write(markdowns)
        # file.close()

        # print('\n\n-----------------\n\n'.join(contents))

        # print(json.dumps(contents,ensure_ascii=False,indent=4))
    # print(json.dumps(all_file_content,indent=4,ensure_ascii=False))