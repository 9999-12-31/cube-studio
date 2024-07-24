import os
os.environ['OPENAI_API_BASE'] = 'http://xxxxxx/v1'
os.environ['OPENAI_API_KEY']="xxxxxxxxx"
os.environ['NUMEXPR_MAX_THREADS']="8"

import openai
openai.api_key = os.environ['OPENAI_API_KEY']
openai.base_url = os.environ['OPENAI_API_BASE']
