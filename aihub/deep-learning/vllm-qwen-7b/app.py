
import io,sys,os,base64,pysnooper
from cubestudio.aihub.model import Model,Validator,Field_type,Field
import numpy
import os
import platform
from flask import g
from transformers import AutoTokenizer, AutoModel
from vllm import LLM, SamplingParams


class VLLM_Model(Model):
    # 模型基础信息定义
    name='vllm-qwen-7b'   # 该名称与目录名必须一样，小写
    label='中文大模型qwen-7b'
    describe="中文大模型qwen-7b"
    field="大模型"  # [机器视觉，听觉，自然语言，多模态，大模型]
    scenes="聊天机器人"
    status='online'
    version='v20221001'
    images = 'ccr.ccs.tencentyun.com/cube-studio/aihub:vllm'
    pic='example.jpg'  # 离线图片，作为模型的样式图，330*180尺寸比例
    # 和train函数的输入参数对应，并且会对接显示到pipeline的模板参数中
    # 和inference函数的输入参数对应，并且会对接显示到web界面上
    inference_inputs = [
        Field(Field_type.text, name='prompts', label='你的问题', describe='你的问题，最长200字，只支持英文',default='',validators=Validator(max=200))
    ]
    inference_outputs = ['markdown']

    # 会显示在web界面上，让用户作为示例输入
    web_examples=[
        {
            "label": "示例一描述",
            "input": {
                "prompts": '你是谁？'
            }
        }
    ]

    # 加载模型，所有一次性的初始化工作可以放到该方法下。注意save_model_dir必须和训练函数导出的模型结构对应
    from cubestudio.aihub.model import check_has_load

    @check_has_load
    def load_model(self,save_model_dir=None,**kwargs):
        # self.llm = LLM(model="lmsys/vicuna-7b-v1.5",trust_remote_code=True,tensor_parallel_size=1)  # tensor_parallel_size 指定gpu数量
        # self.llm = LLM(model="baichuan-inc/Baichuan2-13B-Chat",trust_remote_code=True,tensor_parallel_size=1,gpu_memory_utilization=0.9,dtype='float16')  # tensor_parallel_size 指定gpu数量
        # self.llm = LLM(model="THUDM/chatglm3-6b",trust_remote_code=True,tensor_parallel_size=1,gpu_memory_utilization=0.9,dtype='float16')  # tensor_parallel_size 指定gpu数量
        # self.llm = LLM(model="THUDM/chatglm2-6b",trust_remote_code=True,tensor_parallel_size=1,gpu_memory_utilization=0.9,dtype='float16')  # tensor_parallel_size 指定gpu数量
        self.llm = LLM(model="Qwen/Qwen-7B-Chat",trust_remote_code=True,tensor_parallel_size=1,gpu_memory_utilization=0.9,dtype='float16')  # tensor_parallel_size 指定gpu数量
        # self.llm = LLM(model="01-ai/Yi-6B", trust_remote_code=True, tensor_parallel_size=1,gpu_memory_utilization=0.9, dtype='float16')  # tensor_parallel_size 指定gpu数量
        # self.llm = LLM(model="BAAI/AquilaChat-7B", trust_remote_code=True, tensor_parallel_size=1, gpu_memory_utilization=0.9,dtype='float16')  # tensor_parallel_size 指定gpu数量
        # self.llm = LLM(model="FlagAlpha/Llama2-Chinese-7b-Chat", trust_remote_code=True, tensor_parallel_size=1, gpu_memory_utilization=0.9,dtype='float16')  # tensor_parallel_size 指定gpu数量

        # self.llm = LLM(model="/app/chatglm2-new/", trust_remote_code=True, tensor_parallel_size=1,gpu_memory_utilization=0.9, dtype='float16')  # tensor_parallel_size 指定gpu数量

    # web每次用户请求推理，用于对接web界面请求
    # @pysnooper.snoop()
    def inference(self,prompts,**kwargs):
        # qwen
        sampling_params = SamplingParams(temperature=1, top_p=0.95,max_tokens=100,stop=['<|im_end|>','<|im_start|>', '<|endoftext|>'])
        # sampling_params = SamplingParams(temperature=0.8, top_p=0.95,max_tokens=1000)
        message = f'<|im_start|>user\n{prompts}<|im_end|>\n<|im_start|>assistant\n'
        outputs = self.llm.generate(message,sampling_params)  # Generate texts from the prompts.
        result = ''
        for output in outputs:
            prompt = output.prompt
            generated_text = output.outputs[0].text
            result+=generated_text
            print(f"Prompt: {prompt!r}, Generated text: {generated_text!r}")

        print(f"回答：{result}")
        # 推理的返回结果只支持image，text，video，audio，html，markdown几种类型
        back=[
            {
                "markdown":result
            }
        ]
        return back

model=VLLM_Model()


# 容器中调试训练时
# save_model_dir = "result"
# model.train(save_model_dir = save_model_dir,arg1=None,arg2=None)  # 测试

# 容器中运行调试推理时
# model.load_model(save_model_dir=None)
# result = model.inference(prompts='Hello, my name is ')  # 测试
# print(result)

# 模型启动web时使用
if __name__=='__main__':
    # python app.py train --arg1 xx --arg2 xx
    # python app.py web --save_model_dir xx
    model.run()

