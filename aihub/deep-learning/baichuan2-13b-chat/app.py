import json
import subprocess
import base64
import io,sys,os
from cubestudio.aihub.model import Model,Validator,Field_type,Field

import pysnooper
import os, time, numpy

class Baichuan2_13b_chat_Model(Model):
    # 模型基础信息定义
    name='baichuan2-13b-chat'   # 该名称与目录名必须一样，小写
    label='百川2-13B-Chat'
    describe="Baichuan 2 是百川智能推出的新一代开源大语言模型，采用 2.6 万亿 Tokens 的高质量语料训练"
    field="大模型"    # [机器视觉，听觉，自然语言，多模态，大模型]
    scenes=""
    status='online'
    images='ccr.ccs.tencentyun.com/cube-studio/modelscope:base-cuda12.1-python3.10'
    version='v20221001'
    pic='example.png'  # 离线图片，作为模型的样式图，330*180尺寸比例
    hot = "1254"
    frameworks = "pytorch"
    doc = "https://modelscope.cn/models/baichuan-inc/Baichuan2-13B-Chat/summary"

    # 和train函数的输入参数对应，并且会对接显示到pipeline的模板参数中
    train_inputs = []
    inference_outputs= ['text']

    # 和inference函数的输入参数对应，并且会对接显示到web界面上
    inference_inputs = [
        Field(type=Field_type.text, name='text', label='prompt文本',describe='prompt文本',default='',validators=None)
    ]

    inference_resource = {
        "resource_gpu": "1",
        "resource_memory": "7G",
        "resource_cpu": "43"
    }
    # 会显示在web界面上，让用户作为示例输入
    web_examples=[
        {
            "label": "示例1",
            "input": {
                "text": "讲解一下“温故而知新”"
            }
        }
    ]

    # 训练的入口函数，此函数会自动对接pipeline，将用户在web界面填写的参数传递给该方法
    def train(self,save_model_dir,arg1,arg2, **kwargs):
        pass
        # 训练的逻辑
        # 将模型保存到save_model_dir 指定的目录下

    # 加载模型，所有一次性的初始化工作可以放到该方法下。注意save_model_dir必须和训练函数导出的模型结构对应
    def load_model(self,save_model_dir=None,**kwargs):
        import torch
        from modelscope import snapshot_download, AutoModelForCausalLM, AutoTokenizer, GenerationConfig
        model_dir = snapshot_download("baichuan-inc/Baichuan2-13B-Chat", revision='v2.0.1')
        self.tokenizer = AutoTokenizer.from_pretrained(model_dir, device_map="auto", trust_remote_code=True, torch_dtype=torch.float16)
        self.model = AutoModelForCausalLM.from_pretrained(model_dir, device_map="auto", trust_remote_code=True, torch_dtype=torch.float16)
        self.model.generation_config = GenerationConfig.from_pretrained(model_dir)


    # web每次用户请求推理，用于对接web界面请求
    @pysnooper.snoop(watch_explode=('result'))
    def inference(self, text, history=None, **kwargs):
        messages=[]
        messages.append({"role": "user", "content": text})
        response = self.model.chat(self.tokenizer, messages)
        print(response)

        back = [
            {
                "text": response
            }
        ]
        return back

model=Baichuan2_13b_chat_Model()

# 容器中调试训练时
# save_model_dir = "result"
# model.train(save_model_dir = save_model_dir,arg1=None,arg2=None)  # 测试

# 容器中运行调试推理时
# model.load_model(save_model_dir=None)
# result = model.inference(text="讲解一下“温故而知新”")  # 测试
# print(result)

# 模型启动web时使用
if __name__=='__main__':
    model.run()


