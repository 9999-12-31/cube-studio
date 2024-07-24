import os

cube_repo = 'harbor.bigdata.com/cube-studio/'


def fix_file(file_path):
    if os.path.isdir(file_path):
        file_paths = [os.path.join(file_path, one) for one in os.listdir(file_path)]
    else:
        file_paths = [file_path]

    for file_path in file_paths:
        content = ''.join(open(file_path, mode='r', encoding='utf-8').readlines())
        content = content.replace('ccr.ccs.tencentyun.com/cube-studio/', cube_repo)  # 替换自产镜像
        content = content.replace('docker:23.0.4', cube_repo + 'docker:23.0.4')  # 替换docker
        content = content.replace('python:', cube_repo + 'python:')  # 替换docker
        file = open(file_path, mode='w', encoding='utf-8', newline='\n')
        file.write(content)
        file.close()


fix_file('cube/overlays/config/config.py')
fix_file('../../myapp/init')
# fix_file('../../myapp/init-en')
