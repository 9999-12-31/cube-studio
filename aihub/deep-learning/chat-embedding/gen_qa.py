import sys
import pickle
import sys
import pandas as pd
import os
import openai
import common
import sys
import pandas as pd
import os
from common import *

# def gen_qa(docs):
#     for doc in docs:

from llama_index.evaluation import DatasetGenerator
from llama_index import ServiceContext, PromptHelper, LLMPredictor
from langchain.chat_models import ChatOpenAI

# from core.index.readers.csv_parser import CSVParser
file_extractor={}
# # file_extractor[".csv"] = CSVParser()
#
from llama_index import SimpleDirectoryReader

input_files=['cube-studio.md']

reader = SimpleDirectoryReader(input_files=input_files, file_extractor=file_extractor)
documents = reader.load_data()

question_gen_query = '''
You are a Teacher/ Professor.
Your task is to setup {num_questions_per_chunk} questions for an upcoming quiz/examination.
The questions should be diverse in nature across the document.
Restrict the questions to the context information provided.
使用中文生成问题。
'''
print(openai.api_key)

eval_questions = None
llm_predictor = LLMPredictor(llm=ChatOpenAI(temperature=0, model_name="gpt-3.5-turbo-16k-0613"))
service_context = ServiceContext.from_defaults(llm_predictor=llm_predictor, )
data_generator = DatasetGenerator.from_documents(documents=documents, service_context=service_context, question_gen_query=question_gen_query)
print(data_generator)
eval_questions = data_generator.generate_questions_from_nodes(num=10)

# eval_questions = dump_it(eval_questions, 'eval_questions_10')

print(eval_questions)
