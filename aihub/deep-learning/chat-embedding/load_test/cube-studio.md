# 基础环境依赖

 - docker >= 19.03  
 - kubernetes = 1.18~1.24
 - kubectl >=1.18  
 - cfs/ceph等分布式文件系统 挂载到每台机器的 /data/k8s/ （单机可忽略）
 - 单机 磁盘>=200G 单机磁盘容量要求不大，仅做镜像容器的的存储  
 - 控制端机器 cpu>=8 mem>=16G  
 - 任务端机器，根据需要自行配置  
 
平台完成部署之后如下:

<img width="100%" alt="167874734-5b1629e0-c3bb-41b0-871d-ffa43d914066" src="https://user-images.githubusercontent.com/20157705/168214806-b8aceb3d-e1b4-48f0-a079-903ef8751f40.png">


# 1、对于不熟悉k8s的同学

可以参考视频，先使用rancher部署k8s，再部署cube-studio

[单机部署视频](https://www.bilibili.com/video/BV18r4y147oj/)

# 2、对于已有k8s的同学

平台部署命令：

将k8s集群的kubeconfig文件复制到install/kubernetes/config文件中,对于双网卡的同学，记得rancher里面current-context切换为内网的连接形式，然后执行如下命令，其中xx.xx.xx.xx为机器内网的ip（不是外网ip）
```
# 在k8s worker机器上执行
sh start.sh xx.xx.xx.xx
```


# 3、对于隔离内网部署的同学

需要先把需要的镜像拉取到内网docker仓库，再从内网docker仓库拉取到机器上。

 - [内网拉取rancher所需镜像(自有k8s可忽略)](https://github.com/data-infra/cube-studio/blob/main/install/kubernetes/rancher/all_image.py )
 - [内网拉取cube-studio所需镜像](https://github.com/data-infra/cube-studio/blob/main/install/kubernetes/all_image.py)

其他的同第一步或第二步

将infra命名空间下deployment拉取策略改为IfNotPresent，同时修改[配置文件](https://github.com/data-infra/cube-studio/wiki/%E8%87%AA%E5%AE%9A%E4%B9%89%E9%85%8D%E7%BD%AE%E6%96%87%E4%BB%B6)中IMAGE_PULL_POLICY为IfNotPresent

# 部署后排查

[了解平台基础组件](https://github.com/data-infra/cube-studio/wiki/%E5%9F%BA%E7%A1%80%E7%BB%84%E4%BB%B6%E4%BB%8B%E7%BB%8D)

[了解机器标签管理](https://github.com/data-infra/cube-studio/wiki/%E5%A4%9A%E6%9C%BA%E3%80%81%E5%A4%9A%E9%9B%86%E7%BE%A4%E3%80%81%E5%A4%9A%E9%A1%B9%E7%9B%AE%E7%BB%84-%E9%83%A8%E7%BD%B2%E8%B0%83%E5%BA%A6#%E6%9C%BA%E5%99%A8%E6%A0%87%E7%AD%BE%E7%AE%A1%E7%90%86)

0、kubectl工具不存在，无法下载，在内网中会存在，可以查看修改下start.sh脚本，手动下载kubectl。

1、查看机器label是否添加
```
kubectl label node $node train=true cpu=true notebook=true service=true org=public istio=true knative=true kubeflow=true kubeflow-dashboard=true mysql=true redis=true monitoring=true logging=true --overwrite
```

2、如果istio部署有问题，对于k8s 1.21+以上的版本。使用如下命令修复
```
kubectl delete -f istio/install.yaml
kubectl apply -f istio/install-1.15.0.yaml
kubectl patch svc istio-ingressgateway -n istio-system -p '{"spec":{"externalIPs":["'"xx.xx.xx.xx"'"]}}'
```

2、pv和pvc是否绑定。有些k8s平台会自动为pvc添加Storage Classes，需要对应pv也添加完成绑定

3、kube-system命名空间coredns是否正常，
 - 3.1、可以放开防火墙
```
/sbin/iptables -P FORWARD ACCEPT
/sbin/iptables -P INPUT ACCEPT
/sbin/iptables -P OUTPUT ACCEPT
``` 
放开防火墙后重启coredns 的pod
 - 3.2、可以查看53端口是否被占用，比如bind服务，关闭主机原有53端口服务(注意机器重启后可能原53端口占用的服务被重新打开)。

4、infra命名空间mysql是否部署成功。 
  对于出现 Table 'kubeflow.ab_permission_view_role。删除/data/k8s/infra/mysql/，然后重新部署sh start.sh xx.xx.xx.xx

5、infra命名空间其他组件是否成功，会链接mysql完成数据库初始化。kubeflow数据库由kubeflow-dashboard.infra组件完成初始化。
 - 5.1 数据库如果库表不全，可以把对应库删掉，重启相应组件。rm -rf /data/k8s/infra/mysql，然后重启mysql，再重启kubeflow-dashboard
 - 5.2  如果kubeflow-dashboard报core dump，则可能是linux系统内核版本太低，需要升级系统内核

6、istio-system空间，istio-ingressgateway的svc是否externalIPs形式暴露了内网ip。 如果有双网卡， 在执行sh start.sh xx.xx.xx.xx时，使用的是内网ip，浏览器打开的是外网ip

6、istio-ingressgateway暴露80以后，仍然无法打开，可能原因（1）80被内网封禁（2）80倍其他服务占用（3）没有禁用nginx-ingress (4)防火墙限制，可以`/sbin/iptables -P FORWARD ACCEPT`

7、istio-ingressgateway暴露其他端口，如果80端口被占用了，可以修改 istio-system/svc/istio-ingressgateway 类型为NodePort

8、镜像拉取不下来：可以离线拉取一遍[平台镜像](https://github.com/data-infra/cube-studio/blob/main/install/kubernetes/pull_image_kubeflow.sh)，对于其他的仓库镜像，最好public，否则更新每个命名空间hubsecret的账号密码。配置在线开发->镜像仓库 中hubsecret中的账号密码为自己的dockerhub官网的账号密码

9、k8s dashboard不能搜索，在高版本k8s中，使用
`kubectl apply -f dashboard/v2.6.1-cluster.yaml`部署更高版本的k8s dashboard

# 使用自有的组件，不重复部署

## 使用自有istio
开源版本中使用istio1.14，可以在start.sh里面禁掉对istio的部署
```
kubectl apply -f istio/install-crd.yaml
kubectl wait crd/envoyfilters.networking.istio.io --for condition=established --timeout=60s
kubectl apply -f istio/install.yaml
```
注意事项，

1、isito作为平台的统一入口，需要暴露ip，并开放80，8080端口，会代理cube 的web界面，notebook，pipeline，nni，内部服务，推理服务，监控服务。

2、配置监控对接到prometheus，并且默认不启动sidecar，通过label启动自动注入，同时流量的复制，分流，域名代理等功能可用

## 使用自有的prometheus

注释掉平台“部署prometheus”部分，仅留下grafana的部分，在仅部署cube-studio的grafana后可以通过修改命名空间monitoring下name为的grafana-datasources的Secret，这个Secret中有prometheus.yaml这个键，将这个键中datasources/url的值改为自有prometheus的url，再重启grafana的pod即可；例如：我希望对接kubesphere的promethues,那就改成http://prometheus-k8s.kubesphere-monitoring-system.svc:9090

注意事项

1、需要包含prometheus的基础组件， node-exporter，机器资源监控，prometheus-k8s，监控数据存储服务，grafana监控可视化看板，alertmanater，报警服务，prometheus_adapter，监控指标转hpa指标，servicemonitor 服务监控发现

2、支持通过annotations 自动被prometheus服务发现

3、部署prometheus/grafana/dashboard中的看板，并在config.py文件中修改所需grafana看板的地址。

4、修改grafana的配置，支持代理，iframe嵌入等，并部署istio virtual使用路径/grafana代理grafana服务

# 分布式文件系统

### juicefs

  可以使用juicefs作为分布式文件系统(不需要挂载到每台机器就可以实现多个Pod直接共享统一目录)， 

  执行`cd install/kubernetes/juicefs/ && sh start_juicefs.sh`; 

  执行前请阅读`install/kubernetes/juicefs/README.md`,  

  并记得修改`install/kubernetes/juicefs/.env`的`JUICEFS_HOST_IP`为本节点的ip，保证/data目录有足够的空间 

### [alluxio](https://github.com/data-infra/cube-studio/wiki/alluxio%E5%88%86%E5%B8%83%E5%BC%8F%E5%AD%98%E5%82%A8%E9%83%A8%E7%BD%B2)


