
# 安装基础环境
conda create -y -n python39 python=3.9
source activate python39
pip install PySnooper==1.1.1 opencv-python==4.8.0.76 requests==2.28.1 Flask==2.1.3 kubernetes==21.7.0 celery==5.2.7 redis==4.5.4 cryptography==38.0.4 tqdm==4.64.1 aiohttp==3.8.4 librosa==0.9.2 requests_toolbelt==0.10.1 multiprocess==0.70.14 gradio==3.33.1 --index-url https://mirrors.aliyun.com/pypi/simple
pip install modelscope
pip install transformers transformers_stream_generator
pip install torch torchvision torchaudio tiktoken accelerate

export PATH=/opt/conda/envs/python39/bin/python:$PATH
