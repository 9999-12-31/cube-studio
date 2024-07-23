
# 安装基础环境
apt update -y
apt install -y openjdk-11-jdk wget apt-transport-https
pip install pdfplumber html2text
# 导入Elasticsearch GPG密钥
wget -qO - https://artifacts.elastic.co/GPG-KEY-elasticsearch | apt-key add -
# 添加Elasticsearch存储库
echo "deb https://artifacts.elastic.co/packages/7.x/apt stable main" | tee -a /etc/apt/sources.list.d/elastic-7.x.list
apt update -y
apt install -y elasticsearch

# 修改配置
echo "network.host: 0.0.0.0" >> /etc/elasticsearch/elasticsearch.yml
# 创建es 用户

groupadd elsearch
useradd elsearch -g elsearch -p elasticsearch
cd /usr/share/ && chown -R elsearch:elsearch  elasticsearch
#cd /usr/share/elasticsearch/bin && ./elasticsearch




