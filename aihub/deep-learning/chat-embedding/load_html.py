from bs4 import BeautifulSoup


import html2text as ht
# html源码转markdown
def page2markdown(contents):
    text_maker = ht.HTML2Text()
    # text_maker.ignore_links = True
    text_maker.bypass_tables = False
    contents = text_maker.handle(contents)
    return contents

def load_html(file_path):
    html = open(file_path).read()
    return page2markdown(html)

    # # 使用BeautifulSoup解析html
    # soup = BeautifulSoup(html, 'html.parser')
    # # 获取所有文本内容
    # strings = [string for string in soup.stripped_strings]
    # return strings

if __name__=="__main__":

    file_path = 'load_test/test.html'
    all_content = load_html(file_path)
    print(all_content)
