import os
import deepspeed
import torch
import openai
import random
import json
import tiktoken
import logging
import time

from transformers import LlamaTokenizer, LlamaForCausalLM, pipeline
from langchain.llms import HuggingFacePipeline
from langchain import OpenAI, PromptTemplate, LLMChain, SQLDatabase, SQLDatabaseChain
from langchain.document_loaders import CSVLoader
from langchain.indexes import VectorstoreIndexCreator
from langchain.vectorstores import Chroma
from langchain.embeddings.openai import OpenAIEmbeddings
from langchain.embeddings import HuggingFaceEmbeddings
from langchain import HuggingFaceHub

from langchain.llms import LlamaCpp
from langchain import PromptTemplate, LLMChain
from langchain.callbacks.manager import CallbackManager
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler

from langchain.chains import RetrievalQA
from langchain.chat_models import ChatOpenAI
# from model.req_res import Usage, Choice, Message, ResponseData

import openai

import os

os.environ["HUGGINGFACEHUB_API_TOKEN"] = "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"

# Set up logging configuration
logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s [%(levelname)s] %(filename)s [%(funcName)s:%(lineno)d] - %(message)s",
    handlers=[logging.StreamHandler()],
)


# exit()

embedding = OpenAIEmbeddings()
model_name = "sentence-transformers/all-mpnet-base-v2"
model_kwargs = {"device": "cuda"}
hf_embedding = HuggingFaceEmbeddings(model_name=model_name, model_kwargs=model_kwargs)

loader = CSVLoader(file_path="./data/csv/Album.csv")
index_creator = VectorstoreIndexCreator(
    vectorstore_cls=Chroma,
    embedding=hf_embedding,
    vectorstore_kwargs={
        "path": "./data/indexes/",
        "persist_directory": "./data/indexes/",
    },
)
docsearch = index_creator.from_loaders([loader])


# docsearch = Chroma(persist_directory="./data/indexes/", embedding_function=embedding)
# callback_manager = CallbackManager([StreamingStdOutCallbackHandler()])
# llm = LlamaCpp(
#     model_path="./ggml-model-q4_0.bin", callback_manager=callback_manager, verbose=True
# )

repo_id = "Writer/camel-5b-hf"  # See https://huggingface.co/Writer for other options
repo_id = "databricks/dolly-v2-3b"
# repo_id = "THUDM/chatglm-6b"
llm = HuggingFaceHub(repo_id=repo_id, model_kwargs={"temperature": 0, "max_length": 64})

# llm = OpenAI(temperature=0)

chain = RetrievalQA.from_chain_type(
    llm=llm,
    chain_type="stuff",
    retriever=docsearch.vectorstore.as_retriever(),
    input_key="question",
)

query = "有多少个Chronicle专辑？详细的信息有什么？用中文回答"
response = chain({"question": query})

print(response["result"])