#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import binascii
import hashlib
import os
import sys
import time
import json
import logging
import logging.handlers
from urllib import parse
import pysnooper
import requests
from requests.auth import AuthBase
import html2text as ht

def get_logger():
    fmt = '%(asctime)s %(levelname)s[%(filename)s:%(lineno)d][%(funcName)s] %(message)s'
    fmt = logging.Formatter(fmt, '%Y-%m-%d %H:%M:%S')

    folder = os.path.join(os.getcwd(), 'logs')
    if not os.path.exists(folder):
        os.mkdir(folder)
    path = os.path.join(folder, 'iwiki.log')

    file_handler = logging.handlers.TimedRotatingFileHandler(
        path, when='D', backupCount=90, encoding='utf-8'
    )
    file_handler.setFormatter(fmt)
    logger = logging.getLogger('root')

    stream_handler = logging.StreamHandler(sys.stderr)
    stream_handler.setFormatter(fmt)
    logger.addHandler(file_handler)
    logger.addHandler(stream_handler)
    logger.setLevel('DEBUG')
    logger.propagate = False
    return logger


def hexlify(s):
    return binascii.hexlify(s).decode('utf-8')


def calc_signature(token, timestamp, nonce):
    s = u'{timestamp}{token}{nonce}{timestamp}'.format(timestamp=timestamp, token=token, nonce=nonce)
    s = hashlib.sha256(s.encode('utf-8')).digest()
    return hexlify(s)


def prepare_rio_headers(paasid, token):
    timestamp = str(int(time.time()))
    nonce = hexlify(os.urandom(16))
    signature = calc_signature(token, timestamp, nonce)
    return {
        'x-rio-paasid': paasid,
        'x-rio-signature': signature,
        'x-rio-timestamp': timestamp,
        'x-rio-nonce': nonce,
    }


class RioHeaderAuth(AuthBase):
    def __init__(self, paasid, token):
        self.paasid = paasid
        self.token = token

    def __call__(self, r):
        headers = prepare_rio_headers(self.paasid, self.token)
        r.headers.update(headers)
        return r


def dump(rsp):
    print()
    print('status:', rsp.status_code)
    print('headers:')
    for k, v in rsp.headers.items():
        print(k, v)
    print()
    print('body:')
    print(rsp.text)


class ApiSession(requests.Session):
    def __init__(self, base=None, *args, **kwargs):
        super(ApiSession, self).__init__(*args, **kwargs)
        self._base = base.rstrip('/')

    def request(self, method, url, *args, **kwargs):
        if url.startswith('/'):
            url = self._base + url
        return super(ApiSession, self).request(method, url, *args, **kwargs)


class Wiki(object):
    @classmethod
    def from_env(cls):
        kwargs = {
            'env': os.getenv('env', 'devnet'),
            'paasid': os.getenv('paasid', ''),
            'token': os.getenv('token', ''),
        }
        return Wiki(**kwargs)

    @classmethod
    def from_file(cls, path):
        with open(path, 'r') as fp:
            data = fp.read()
        kwargs = {}
        if path.endswith('.json'):
            kwargs = json.loads(data)
        else:
            for line in data.splitlines(keepends=False):
                args = line.split('=', maxsplit=2)
                if line.startswith('#') or len(args) != 2:
                    continue
                kwargs[args[0]] = args[1]
        kwargs.setdefault('env', 'devnet')
        return Wiki(**kwargs)

    def __init__(self, env, paasid, token):
        regions = {
            'oa':     'http://api-g.sgw.woa.com',
            'oss':    'http:/api-idc.sgw.woa.com',
            'idc':    'http:/api-g-idc.sgw.woa.com',
            'idcw':   'http://api-g-idcw.sgw.woa.com',
            'devnet': 'http://api-idc.sgw.woa.com',
            'test':   'http://test.devnet.rio.tencent.com',
        }
        base = regions.get(env, None)
        if not base:
            regions = "/".join(regions.keys())
            raise ValueError(f'invalid env "{env}", must be one of {regions}, suggest you try env devnet/idc')
        self.base = f'{regions[env]}/ebus/iwiki/prod'
        s = ApiSession(self.base)
        # s.trust_env = False
        s.auth = RioHeaderAuth(paasid, token)
        self.client = s

    def page_link(self, id, title=None):
        url = f'https://iwiki.woa.com/p/{id}'
        return f'[{title}]({url})' if title else url

    def get_json(self, api, params=None):
        rsp = self.client.get(api, params=params)
        return rsp.json()

    def post_json(self, api, body, params=None):
        rsp = self.client.post(api, json=body, params=params)
        return rsp.json()

    def ping(self):
        return self.client.get('/tencent/api/v2/user/current')

    def get_user_info(self):
        return self.get_json('/tencent/api/v2/user/current')['data']

    def get_doc_body(self, id):
        return self.get_json(f'/tencent/api/v2/doc/body?id={id}')

    def get_doc_metadata(self, id):
        return self.get_json(f'/tencent/api/v2/doc/detail/metadata?id={id}')

    def get_space(self, k):
        try:
            data = self.get_json(f'/tencent/api/space/{k}')
            return data['result']
        except Exception as e:
            msg = f'get space "{k}" failed: {e}'
            logger.exception(msg)
            raise Exception(msg)

    # 遍历获取文档下面的所有文档id
    # @pysnooper.snoop(watch_explode=('pasges'))
    def walk_page(self,id):
        pasges = self.children(id)
        if not pasges:
            return []
        all_pages=pasges
        for page in pasges:
            child_pages = self.walk_page(page['id'])
            if child_pages:
                all_pages+=child_pages

        return all_pages

    def children(self, id):
        try:
            data = self.get_json(f'/tencent/api/v2/pagetree/children?parentid={id}')
            return data['data']['list']
        except Exception as e:
            msg = f'get children of page "{id}" failed: {e}'
            logger.exception(msg)
            raise Exception(msg)

    def find_children(self, id, title):
        children = self.children(id)
        return [i['id'] for i in children if i['title'] == title]

    def mkdir(self, parent, title):
        body = {
            'parentid': parent,
            'name': title,
        }
        try:
            data = self.post_json('/tencent/api/v2/doc/folder/create', body)
            return data['data']['id']
        except Exception as e:
            msg = f'mkdir {title} under {parent} failed: {e}'
            logger.exception(msg)
            raise Exception(msg)

    def create_doc(self, parent_id, title, body, content_type):
        body = {
            'parentid': parent_id,
            'contenttype': content_type,
            'title': title,
            'body': body,
        }
        try:
            data = self.post_json('/tencent/api/v2/doc/create', body)
            return data['data']['id']
        except Exception as e:
            msg = f'create_doc {parent_id} / {title} failed: {e}'
            logger.exception(msg)
            raise Exception(msg)

    def update_doc(self, id, title, body):
        body = {
            'id': id,
            'title': title,
            'body': body,
            'version': 1,
            'force': True,
        }
        try:
            data = self.post_json('/tencent/api/v2/doc/save', body)
            if data['msg'] != 'ok':
                raise Exception('update_doc failed: ' + data['msg'])
        except Exception as e:
            msg = f'update_doc "{title}"({id}) failed: {e}'
            logger.exception(msg)
            raise Exception(msg)

    def upload_attachment(self, doc_id, path, name=None):
        if not name:
            name = os.path.basename(path)
        api = f'/tencent/api/attachments/s3/presign?docid={doc_id}'
        rsp = self.get_json(api)
        attachmentid = rsp['data']['attachmentid']
        url = rsp['data']['url']
        rsp = self.client.put(url, data=open(path, 'rb'))
        ok = rsp.status_code == 200
        body = {
            'attachmentid': attachmentid,
            'status': ok and 'ok' or 'failure',
            'filepath': name
        }
        data = self.post_json('/tencent/api/attachments/notify', body)
        if not ok:
            raise ValueError(f'upload failed: {rsp.text}')
        if data['msg'] != 'ok':
            raise ValueError(f'upload notify failed: {data["msg"]}')
        return attachmentid

# @pysnooper.snoop()
def walk_url(url):

    # wiki = Wiki.from_file('rio.env')
    wiki = Wiki('oa', 'star_tof', 'LYEGMKWTLI3LIQWG7Y5T6I9SOXDI9WMA')


    # 验证连接
    # print(wiki.ping().text)

    homepage_id = None
    if 'space' in url:
        space = url[url.rindex('/'):]
        space = wiki.get_space(space)
        homepage_id = space['homepageid']
    elif 'pageId' in url:
        params = parse.parse_qs(parse.urlparse(url).query)
        homepage_id = params['pageId'][0]

    if homepage_id:
        pages = wiki.walk_page(homepage_id)
        pages = [page['id'] for page in pages]
        if 'pageId' in url:
            pages.append(homepage_id)
        # print(len(pages))
        all_page_content = {}
        for page_id in pages:
            # print(page_id)
            metadata = wiki.get_doc_metadata(page_id)
            content_type = metadata.get('data', {}).get('content_type', 'DOC').lower()
            print(metadata)
            body = wiki.get_doc_body(page_id)
            # if page_id=='4007225970':
            #     print(metadata)
            #     print(body)

            print('文档:', body)
            if content_type=='doc':
                body = json.loads(body.get('data', {}).get('body', '{}'))
                body = body['content']
            elif content_type=='md':
                body = body.get('data', {}).get('body', '')
            elif content_type=='page':
                body = body.get('data', {}).get('body', '')
            # elif content_type=='vika':
            #     body = body.get('data', {}).get('body', '')
            else:
                body=''

            all_page_content[page_id]={
                "link":wiki.page_link(page_id),
                "content_type":content_type,
                "content":body
            }
        return all_page_content
    return {}

# @pysnooper.snoop()
# doc new转markdown
def doc2markdown(content):
    if not content:
        return ''
    content_type = content['type']
    # 标题
    if content_type=='heading':
        if content.get('content', []):
            content_text = ''.join([doc2markdown(x) for x in content.get('content',[])])
            content_text = "\n"+content['attrs']['level'] * "#" + " " + content_text
            return content_text
    # 单文本
    if content_type=='text':
        if 'code' in str(content.get('marks','')):
            return '`%s`'%content['text']
        return content['text']

    # 引用
    if content_type=='panel':
        if content.get('content', []):
            content_text = ''.join([doc2markdown(x) for x in content.get('content',[])])
            return content_text

    #阻塞块
    if content_type=='blockquote':
        if content.get('content', []):
            content_text = ''.join([doc2markdown(x) for x in content.get('content',[])])
            return content_text

    # 段落
    if content_type=='paragraph':
        if content.get('content',[]):
            content_text = '%s  '%''.join([doc2markdown(x) for x in content.get('content',[])])
            return content_text

    # 无序列表
    if content_type=='bulletList':
        if content.get('content', []):
            content_text = '\n - %s\n'%'\n - '.join([doc2markdown(x) for x in content.get('content',[])])
            return content_text

    # 有序列表
    if content_type=='orderedList':
        if content.get('content', []):
            content_text = '\n - %s\n'%'\n - '.join([doc2markdown(x) for x in content.get('content',[])])
            return content_text

    # 列表每个元素
    if content_type=='listItem':
        if content.get('content', []):
            content_text = '\n'.join([doc2markdown(x) for x in content.get('content',[])])
            return content_text

    # 任务列表
    if content_type=='taskList':
        if content.get('content', []):
            content_text = '\n - %s\n'%'\n - '.join([doc2markdown(x) for x in content.get('content',[])])
            return content_text
    # 任务元素
    if content_type=='taskItem':
        if content.get('content', []):
            content_text = ''.join([doc2markdown(x) for x in content.get('content',[])])
            return content_text

    # 表格
    if content_type=='table':
        if content.get('content', []):
            content_text = '\n%s\n'%'\n'.join([doc2markdown(x) for x in content.get('content',[])])
            return content_text

    if content_type=='tableRow':
        if content.get('content', []):
            content_text = "%s |  "%''.join([doc2markdown(x) for x in content.get('content',[])])
            return content_text

    if content_type=='tableHeader':
        if content.get('content', []):
            content_text = "|%s"%''.join([doc2markdown(x) for x in content.get('content',[])])
            return content_text

    if content_type=='tableCell':
        if content.get('content', []):
            content_text = "|%s"%''.join([doc2markdown(x) for x in content.get('content',[])])
            return content_text

    # 代码块
    if content_type=='codeBlock':
        if content.get('content', []):
            content_text = '```\n%s \n```'%''.join([doc2markdown(x) for x in content.get('content',[])])
            return content_text

    # @符号
    if content_type=='mention':
        return content.get('attrs',{}).get("text",'')

    # 图片
    if content_type=='inlineExtension':
        url = 'https://iwiki.woa.com/tencent/api/attachments/s3/url?attachmentid=%s'%content.get("attrs",{}).get("parameters",{}).get("id",'')
        name = content.get("attrs",{}).get("parameters",{}).get("name",'')
        return '![%s](%s)'%(name,url)

    return ''


# html源码转markdown
def page2markdown(contents):

    text_maker = ht.HTML2Text()
    # text_maker.ignore_links = True
    text_maker.bypass_tables = False
    contents = text_maker.handle(contents)

    # image 转 链接

    return contents


# contents = json.load(open('wiki.json'))
# for content in contents:
#     print(doc2markdown(content))

if __name__ == '__main__':
    logger = get_logger()
    url = 'https://iwiki.woa.com/space/TMEDI'
    url = 'https://iwiki.woa.com/pages/viewpage.action?pageId=4008398501'   # markdown文档
    url = 'https://iwiki.woa.com/pages/viewpage.action?pageId=4008394902'   # doc文档
    # url = 'https://iwiki.woa.com/pages/viewpage.action?pageId=1071611744'   # page文档
    url= 'https://iwiki.woa.com/pages/viewpage.action?pageId=4008518733'    # 表格文档类型

    all_page_content = walk_url(url)
    # exit(1)
    for page_id in all_page_content:
        page_content = all_page_content[page_id]
        # print(page_content['content_type'].lower())

        # doc new格式转markdown
        if page_content['content_type'].lower()=='doc':
            contents = page_content['content']
            # print(contents)
            for content in contents:
                pass
                print(doc2markdown(content))

        # 直接读取markdown
        if page_content['content_type'].lower()=='md':
            contents = page_content['content']
            # print(contents)

        # html转markdown
        if page_content['content_type'].lower()=='page':
            contents = page_content['content']
            contents = page2markdown(contents)
            # print(contents)

