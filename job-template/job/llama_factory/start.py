

import json
import os
import time
import argparse
from datetime import datetime
model_name_or_path=''
def add_dataset(path):
    data = json.load(open('/root/llama_factory/data/dataset_info.json'))
    file_name = os.path.basename(path)
    file_name = file_name.split('.')[0]
    data[file_name]={
        "file_name": path
    }
    json.dump(data,open('/root/llama_factory/data/dataset_info.json',mode='w'))
    return file_name

def download_model(save_dir,model_name):
    os.system(f'cd {save_dir} && sh /root/llama_factory/hfd.sh {model_name} --tool aria2c -x 12')

def set_args():
    parser = argparse.ArgumentParser()

    # 训练参数
    parser.add_argument('--stage', default="sft", type=str, help='')
    parser.add_argument('--do_train', default=True, type=bool, help='')
    parser.add_argument('--model_name', default="THUDM/glm-4-9b-chat", type=str, help='')
    parser.add_argument('--model_path', default="", type=str, help='')
    parser.add_argument('--dataset', default="identity", type=str, help='')
    parser.add_argument('--template', default="glm4", type=str, help='')
    parser.add_argument('--finetuning_type', default="lora", type=str, help='')
    parser.add_argument('--lora_target', default="all", type=str, help='')
    parser.add_argument('--output_dir', default="test_identity", type=str, help='')
    parser.add_argument('--per_device_train_batch_size', default=4, type=int, help='')
    parser.add_argument('--gradient_accumulation_steps', default=4, type=int, help='')
    parser.add_argument('--lr_scheduler_type', default="cosine", type=str, help='')
    parser.add_argument('--logging_steps', default=10, type=int, help='')
    parser.add_argument('--save_steps', default=100, type=int, help='')
    parser.add_argument('--learning_rate', default=5e-5, type=float, help='')
    parser.add_argument('--num_train_epochs', default=3, type=int, help='')
    parser.add_argument('--max_samples', default=300, type=int, help='')
    parser.add_argument('--max_grad_norm', default=1.0, type=float, help='')
    parser.add_argument('--fp16', default='true', type=str, help='')
    parser.add_argument('--merge_lora', default='false', type=str, help='')

    return parser.parse_args()


def merge_job(user_args, export_dir):
    global model_name_or_path
    import json
    export_dir = os.path.join(user_args.output_dir,export_dir)
    if not os.path.exists(export_dir):
        os.makedirs(export_dir,exist_ok=True)

    args_json = dict(
        model_name_or_path=model_name_or_path,
        adapter_name_or_path=user_args.output_dir,  # 加载之前保存的 LoRA 适配器
        template=user_args.template,  # 和训练保持一致
        finetuning_type=user_args.finetuning_type,  # 和训练保持一致
        export_dir=export_dir,  # 合并后模型的保存目录
        export_size=2,  # 合并后模型每个权重文件的大小（单位：GB）
        export_device="cpu",  # 合并模型使用的设备：`cpu` 或 `cuda`
    )
    print('lora模型合并的配置文件',args_json)
    json.dump(args_json, open("/root/llama_factory/merge_model.json", "w", encoding="utf-8"), indent=2)


def work_file(user_args):
    global model_name_or_path
    file_name = add_dataset(user_args.dataset)
    args_json = dict(
        stage=user_args.stage,    # 进行指令监督微调
        do_train=user_args.do_train,
        model_name_or_path=model_name_or_path,
        dataset=file_name,
        template=user_args.template,
        finetuning_type=user_args.finetuning_type,  # 使用 LoRA 适配器来节省显存
        lora_target=user_args.lora_target,  # 添加 LoRA 适配器至全部线性层
        output_dir=args.output_dir,  # 保存 LoRA 适配器的路径
        per_device_train_batch_size=user_args.per_device_train_batch_size,  # 批处理大小
        gradient_accumulation_steps=user_args.gradient_accumulation_steps,  # 梯度累积步数
        lr_scheduler_type=user_args.lr_scheduler_type,  # 使用余弦学习率退火算法
        logging_steps=user_args.logging_steps,  # 每 10 步输出一个记录
        warmup_ratio=0.1,  # 使用预热学习率
        save_steps=user_args.save_steps,  # 每 1000 步保存一个检查点
        learning_rate=user_args.learning_rate,  # 学习率大小
        num_train_epochs=user_args.num_train_epochs,  # 训练轮数
        max_samples=user_args.max_samples,  # 使用每个数据集中的 300 条样本
        max_grad_norm=user_args.max_grad_norm,  # 将梯度范数裁剪至 1.0
        quantization_bit=4,  # 使用 4 比特 QLoRA
        loraplus_lr_ratio=16.0,  # 使用 LoRA+ 算法并设置 lambda=16.0
        fp16=str(user_args.fp16).lower()=='true',  # 使用 float16 混合精度训练
    )
    print('模型训练的配置文件', args_json)
    json.dump(args_json, open("/root/llama_factory/train_model.json", "w", encoding="utf-8"), indent=2)


if __name__ == '__main__':
    args = set_args()

    print(f'开始清理目录{args.output_dir}下的历史文件...')
    if os.path.exists(args.output_dir):
        os.system(f'rm -rf {args.output_dir}')

    os.makedirs(args.output_dir,exist_ok=True)

    model_name_or_path = args.model_path if args.model_path else args.model_name

    if not args.model_path and args.model_name:
        download_model(args.output_dir,args.model_name.strip())
        model_name_or_path = os.path.join(args.output_dir,os.path.basename(args.model_name))
        model_config_path = os.path.join(model_name_or_path,'config.json')
        if not os.path.exists(model_config_path):
            print(f'未检测到下载的模型配置文件 {model_config_path}')
            exit(1)


    work_file(args)
    os.system("llamafactory-cli train /root/llama_factory/train_model.json")

    time.sleep(5)

    print(f'训练完成.')

    if str(args.merge_lora).lower()=='true':
        print(f'开始合并lora模型')
        merge_job(args, 'exported_model')
        os.system('llamafactory-cli export /root/llama_factory/merge_model.json')
        print(f"合并模型存放地址: 'exported_model'")
        print(f'合并lora模型完成.')

    # # 测试推理
    # print(f'开始测试推理')
    # from llamafactory.chat import ChatModel
    # from llamafactory.extras.misc import torch_gc
    #
    # model_name_or_path = args.model_path if args.model_path else args.model_name
    # args = dict(
    #     model_name_or_path=model_name_or_path,
    #     adapter_name_or_path=args.output_dir,
    #     template=args.template,  # 和训练保持一致
    #     finetuning_type=args.finetuning_type,  # 和训练保持一致
    #     quantization_bit=4,  # 加载 4 比特量化模型
    # )
    # chat_model = ChatModel(args)
    #
    # messages = []
    # print("使用 `clear` 清除对话历史，使用 `exit` 退出程序。")
    # while True:
    #     query = input("\nUser: ")
    #     if query.strip() == "exit":
    #         break
    #     if query.strip() == "clear":
    #         messages = []
    #         torch_gc()
    #         print("对话历史已清除")
    #         continue
    #
    #     messages.append({"role": "user", "content": query})
    #     print("Assistant: ", end="", flush=True)
    #
    #     response = ""
    #     for new_text in chat_model.stream_chat(messages):
    #         print(new_text, end="", flush=True)
    #         response += new_text
    #     print()
    #     messages.append({"role": "assistant", "content": response})
    #
    # torch_gc()

